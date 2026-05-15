# NoSQL: MongoDB

Capa documental del sistema de facturación. Almacena la colección `cliente`, con los `telefonos` anidados como array dentro de cada documento.

> Los productos, facturas y sus detalles estan en PostgreSQL. Ver [../sql/README.md](../sql/README.md).

## Modelo de datos

Un documento por cliente. Los teléfonos se anidan como array dentro del documento (1:N de baja cardinalidad, siempre consultado junto con el cliente). El campo `nro_cliente` es el vínculo lógico con `factura.nro_cliente` en PostgreSQL.

```json
{
  "_id": ObjectId("..."),
  "nro_cliente": 1,
  "nombre": "Jacob",
  "apellido": "Cooper",
  "direccion": "Av. Siempreviva 742",
  "activo": 1,
  "telefonos": [
    { "codigo_area": 11, "nro_telefono": 4567890, "tipo": "C" },
    { "codigo_area": 11, "nro_telefono": 1234567, "tipo": "F" }
  ]
}
```

### Campos top-level


| Campo         | Tipo    | Required            | Descripción                                                                         |
| ------------- | ------- | ------------------- | ----------------------------------------------------------------------------------- |
| `nro_cliente` | INT     | Sí                  | Identificador único del cliente. Referenciado por `factura.nro_cliente` en Postgres |
| `nombre`      | STRING  | Sí                  | Nombre del cliente                                                                  |
| `apellido`    | STRING  | Sí                  | Apellido del cliente                                                                |
| `direccion`   | STRING  | Sí                  | Dirección                                                                           |
| `activo`      | INT     | Sí (default `1`)    | Entero (matching `TINYINT` del DER).                                                |
| `telefonos`   | ARRAY   | No (default `[]`)   | Array de subdocumentos de teléfono. Puede estar vacío.                              |


### Subdocumento `telefonos[]`


| Campo          | Tipo            | Required | Descripción                          |
| -------------- | --------------- | -------- | ------------------------------------ |
| `codigo_area`  | INT             | Sí       | Código de área (1 a 3 dígitos)       |
| `nro_telefono` | INT             | Sí       | Número de teléfono (hasta 7 dígitos) |
| `tipo`         | STRING (1 char) | Sí       | `'C'` celular, `'F'` fijo            |


## Índices

La colección `cliente` necesita los siguientes índices:


| Índice                | Campos                                                        | Único         | Justificación                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uq_nro_cliente`      | `{ nro_cliente: 1 }`                                          | Sí            | Clave de búsqueda principal. La app accede al cliente por `nro_cliente` cuando agrega `nombre`, `apellido` a resultados de SQL (reqs 4, 5, 6, 7, 10) o cuando hace CRUD (req 13). |
| `idx_nombre_apellido` | `{ nombre: 1, apellido: 1 }`                                  | No            | Búsqueda por nombre completo: req 2 ("Jacob Cooper") y req 7 ("Kai Bullock"). Sin este índice, esas queries hacen full collection scan.                         |
| `uq_telefono`         | `{ "telefonos.codigo_area": 1, "telefonos.nro_telefono": 1 }` | Sí (multikey) | Replica la PK compuesta de `E01_TELEFONO` en el DER. Previene que el mismo número (par `codigo_area`+`nro_telefono`) esté registrado en dos clientes distintos. |


## Cómo levantar MongoDB local

### Docker Compose

Desde la raíz del repo, con `.env` ya copiado de `.env.example`:

```bash
docker compose up -d mongo
```

El `docker-compose.yml` lee la configuración de `.env` (campos `MONGO_DATABASE`, `MONGO_PORT`). MongoDB local no requiere autenticación.

Para entrar al cliente desde el host (requiere `mongosh` instalado):

```bash
mongosh "mongodb://localhost:27017/tpo_facturacion"
```

O desde adentro del contenedor (sin `mongosh` en el host):

```bash
docker compose exec mongo mongosh "mongodb://localhost:27017/tpo_facturacion"
```

Para apagar el servicio (mantiene los datos):

```bash
docker compose down
```

Para apagar y resetear (borra el volumen):

```bash
docker compose down -v
```

### MongoDB Atlas (alternativa cloud)

1. Crear cluster M0 gratuito en [https://cloud.mongodb.com](https://cloud.mongodb.com).
2. Obtener connection string del cluster.
3. Conectarse:

```bash
mongosh "<connection_string>/tpo_facturacion"
```

## Cómo correr los scripts

En orden, desde esta carpeta:

```bash
mongosh "mongodb://localhost:27017/tpo_facturacion" --file 01-setup.js
mongosh "mongodb://localhost:27017/tpo_facturacion" --file 02-seed.js
mongosh "mongodb://localhost:27017/tpo_facturacion" --file 03-crud-cliente.js
```

Todos los scripts son **idempotentes** (dropean lo que crean antes de recrearlo).

## Archivos


| Archivo              | Descripción                                                             | Estado |
| -------------------- | ----------------------------------------------------------------------- | ------ |
| `01-setup.js`        | Crea la colección `cliente` con validador JSON Schema e índices         | TODO   |
| `02-seed.js`         | Datos de prueba (clientes con sus teléfonos anidados)                   | TODO   |
| `03-crud-cliente.js` | CRUD de clientes (requerimiento 13). Coordina pre-check de integridad con `factura` antes de eliminar | TODO   |
| `queries/`           | Una query por requerimiento (ver mapeo abajo)                           | TODO   |


## Mapeo de requerimientos a archivos Mongo

Solo los requerimientos que toca este motor. Los cross-DB necesitan también su contraparte en [../sql/](../sql/).


| #   | Requerimiento                           | Archivo              | Cross-DB                                                                                       |
| --- | --------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Datos de los clientes con sus teléfonos | `queries/req-01.js`  | No                                                                                             |
| 2   | Teléfonos de "Jacob Cooper"             | `queries/req-02.js`  | No                                                                                             |
| 3   | Cada teléfono con datos del cliente     | `queries/req-03.js`  | No                                                                                             |
| 4   | Clientes con al menos una factura       | `queries/req-04.js`  | Sí (SQL aporta los `nro_cliente` que aparecen en `factura`)                                    |
| 5   | Clientes sin facturas                   | `queries/req-05.js`  | Sí (SQL aporta los `nro_cliente` que aparecen en `factura`; Mongo los filtra del set completo) |
| 6   | Clientes con cantidad de facturas       | `queries/req-06.js`  | Sí (SQL aporta `nro_cliente` y cantidad de facturas)                                           |
| 7   | Facturas de "Kai Bullock"               | `queries/req-07.js`  | Sí (Mongo resuelve `nombre`+`apellido` a `nro_cliente`; SQL filtra las facturas)               |
| 10  | Total gastado por cliente con IVA       | `queries/req-10.js`  | Sí (SQL aporta `nro_cliente` y total con IVA)                                                  |
| 13  | CRUD de clientes                        | `03-crud-cliente.js` | No (pre-check en SQL antes de eliminar para evitar facturas huérfanas)                         |


Los requerimientos 8, 9, 11, 12 y 14 los resuelve PostgreSQL. Ver [../sql/README.md](../sql/README.md).

## Notas sobre la integridad referencial

MongoDB no garantiza la consistencia de `nro_cliente` con la tabla `factura` de PostgreSQL: es una **referencia lógica**, no una FK relacional cross-motor.

La capa de aplicación se responsabiliza de:

- Asignar `nro_cliente` único al crear un cliente (alineado con lo que PostgreSQL espera en `factura.nro_cliente`).
- **Pre-check de integridad antes de eliminar**: el CRUD del requerimiento 13 consulta `SELECT COUNT(*) FROM factura WHERE nro_cliente = :id` en PostgreSQL. Si el cliente tiene facturas asociadas, rechaza la operación con error. Solo se ejecuta `db.cliente.deleteOne({ nro_cliente: :id })` si el count es `0`. De esta forma nunca quedan referencias huérfanas en `factura`.


Es un **trade-off conocido del modelo políglota** y está discutido en [../docs/justificacion-poliglota.md](../docs/justificacion-poliglota.md).