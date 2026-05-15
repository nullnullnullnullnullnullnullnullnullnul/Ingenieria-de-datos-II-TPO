# Justificación de la capa de persistencia políglota

Documento donde se argumenta la elección y distribución de motores para el TPO de Ingeniería de Datos II.

## Motores elegidos

- **Motor relacional:** PostgreSQL 17
- **Motor NoSQL (documental):** MongoDB 8

## Distribución de datos


| Entidad / Datos             | Motor      | Justificación                                                                                                                                |
| --------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `producto`                  | PostgreSQL | El stock se decrementa atómicamente al facturar. Necesita ACID y constraints (precio > 0, stock ≥ 0).                                        |
| `factura`                   | PostgreSQL | Cabecera contable: totales con/sin IVA, fecha. Su emisión es transaccional: insertar cabecera + detalle + decrementar stock en un solo paso. |
| `detalle_factura`           | PostgreSQL | Líneas de factura. Relación N:N entre factura y producto, modelo relacional natural con FKs.                                                 |
| `cliente` (con `telefonos`) | MongoDB    | Documento por cliente con sus teléfonos anidados como array. 1:N de baja cardinalidad, siempre consultados juntos, no transaccional.         |


El vínculo entre motores es `nro_cliente` (entero). En PostgreSQL, `factura.nro_cliente` es un campo entero indexado que referencia lógicamente al `nro_cliente` del documento en MongoDB. No hay FK relacional cross-motor.

## Justificación general

La elección es **políglota por afinidad de carga**: cada entidad vive en el motor cuya semántica de almacenamiento mejor refleja su patrón de uso.

### Por qué PostgreSQL para el núcleo transaccional

El sistema de facturación, según el enunciado, requiere:

- **Chequeo y decremento de stock atómico**: la creación de una factura implica simultáneamente verificar stock, decrementarlo, insertar la cabecera y los detalles. Si falla cualquier paso, todo debe revertirse (ACID).
- **Integridad referencial**: un detalle debe referir un producto existente; una factura debe tener al menos un detalle. PostgreSQL lo garantiza con FKs nativas.
- **Joins sobre el núcleo**: los requerimientos 8, 9 y 12 cruzan `producto`, `factura` y `detalle_factura` con filtros, agregaciones y `LEFT JOIN`s. PostgreSQL los resuelve sin ceremonia.
- **Vistas**: los requerimientos 11 y 12 piden explícitamente vistas (`CREATE VIEW`).
- **Agregaciones con IVA y descuento por volumen**: cálculos típicos de SQL con `GROUP BY` y window functions.

PostgreSQL sobre MySQL: mayor adherencia al estándar SQL, mejor soporte de CTEs y window functions, y un dialecto más limpio para el linter (`sqlfluff` con dialecto `postgres`).

### Por qué MongoDB para cliente y sus teléfonos

El cliente, junto con sus teléfonos, forma un **agregado descriptivo** que casi nunca está en operaciones transaccionales:

- **1:N de baja cardinalidad, siempre consultado junto**: los teléfonos de un cliente se piden con el cliente. Anidar el array de teléfonos dentro del documento del cliente es el patrón canónico de modelado documental ("always fetched together", Fowler 2012).
- **Esquema variable**: distintos tipos de teléfono (celular, fijo, internacional) pueden requerir campos extra (extensión, prefijo de país, observaciones) sin migrar el schema.
- **Sin participación en transacciones de stock/facturación**: agregar, eliminar o modificar un teléfono no afecta facturas, stock ni totales. No requiere ACID.
- **Patrón de consulta natural**: "dame todos los teléfonos del cliente X" es un único `findOne({ nro_cliente: X })` con índice, más eficiente que el `JOIN` cliente<->telefono que requeriría SQL.

Frente a la alternativa de almacenar `telefono` como una colección separada con `cliente_id`: anidar es mejor porque elimina el `JOIN` lógico (un solo round-trip), respeta el principio de "modelar por agregado de aplicación" y aprovecha el tope natural de teléfonos por cliente (entra bien en el límite de 16MB por documento).

## Trade-offs aceptados

- **Consultas cross-motor** (requerimientos 4, 5, 6, 7, 10): se resuelven en la capa de aplicación. SQL devuelve `nro_cliente`s (con agregados según el caso) y MongoDB agrega `nombre`, `apellido`, `direccion`. El costo es bajo porque las consultas son puntuales y `nro_cliente` está indexado en ambos motores. Es el patrón políglota: un agregado por motor, joins lógicos en la app.
- **Consistencia eventual entre motores**: si se elimina un cliente en MongoDB, sus facturas en PostgreSQL quedan referenciando un `nro_cliente` inexistente hasta que el proceso de borrado lógico (CRUD requerimiento 13) las marque o limpie. Se mitiga con una operación coordinada desde la aplicación: nunca borrar físicamente un cliente con facturas asociadas, sino marcarlo como `activo = false` en MongoDB.
- **Operación dual**: levantar y mantener dos motores en lugar de uno. Compensado por la separación de responsabilidades, la mejor adecuación de cada motor a su carga, y el aprendizaje pedagógico (que es el objetivo del TP).
- **No hay duplicación de `cliente`**: el modelo evita replicar `cliente` en ambas BDs. La única referencia es `nro_cliente`. Esto preserva la **fuente única de verdad** para los datos descriptivos del cliente.

## Mapeo de requerimientos a motores


| #   | Requerimiento                           | Motor(es)            | Notas                                                                                |
| --- | --------------------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| 1   | Datos de los clientes con sus teléfonos | MongoDB              | Documento de cliente con array de teléfonos anidado                                  |
| 2   | Teléfonos y nro de "Jacob Cooper"       | MongoDB              | Filtro por `nombre` y `apellido` en `cliente`                                        |
| 3   | Cada teléfono con datos del cliente     | MongoDB              | `$unwind` sobre el array `telefonos`                                                 |
| 4   | Clientes con al menos una factura       | PostgreSQL + MongoDB | SQL devuelve `nro_cliente`s; Mongo agrega `nombre`, `apellido`                       |
| 5   | Clientes sin facturas                   | PostgreSQL + MongoDB | Mongo devuelve todos los `nro_cliente`; SQL los que sí facturaron; diferencia en app |
| 6   | Clientes con cantidad de facturas       | PostgreSQL + MongoDB | SQL devuelve `nro_cliente, COUNT(*)`; Mongo agrega `nombre`, `apellido`              |
| 7   | Facturas de "Kai Bullock"               | PostgreSQL + MongoDB | Mongo resuelve nombre ->`nro_cliente`; SQL filtra facturas                           |
| 8   | Productos facturados al menos una vez   | PostgreSQL           | `EXISTS` sobre `detalle_factura`                                                     |
| 9   | Facturas con productos marca "Ipsum"    | PostgreSQL           | `JOIN factura <-> detalle <-> producto WHERE marca = 'Ipsum'`                        |
| 10  | Total gastado por cliente con IVA       | PostgreSQL + MongoDB | SQL agrupa `SUM(total_con_iva)` por `nro_cliente`; Mongo agrega `nombre`, `apellido` |
| 11  | Vista de facturas ordenadas por fecha   | PostgreSQL           | `CREATE VIEW` sobre `factura`                                                        |
| 12  | Vista de productos no facturados        | PostgreSQL           | `LEFT JOIN` / `NOT EXISTS`                                                           |
| 13  | CRUD de clientes                        | MongoDB              | Cliente vive solo en MongoDB; baja lógica si tiene facturas en SQL                   |
| 14  | CRUD de productos                       | PostgreSQL           | Precio sin IVA, validación de stock ≥ 0                                              |


