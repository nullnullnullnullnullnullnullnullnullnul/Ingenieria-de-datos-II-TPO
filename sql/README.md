# SQL: PostgreSQL

Capa relacional del sistema de facturación. Almacena las entidades transaccionales: `producto`, `factura`, `detalle_factura`.

> Los clientes y sus teléfonos están en MongoDB. Ver [../nosql/README.md](../nosql/README.md).

## Cómo levantar PostgreSQL local

### Docker Compose

Desde la raíz del repo, con `.env` ya copiado de `.env.example`:

```bash
docker compose up -d postgres
```

El `docker-compose.yml` lee las credenciales de `.env` (campos `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, `PG_PORT`).

Para entrar al cliente desde el host:

```bash
psql -h localhost -p 5432 -U tpo -d tpo_facturacion
```

O desde adentro del contenedor:

```bash
docker compose exec postgres psql -U tpo -d tpo_facturacion
```

Para apagar el servicio (mantiene los datos):

```bash
docker compose down
```

Para apagar y resetear (borra el volumen):

```bash
docker compose down -v
```

### Instalación nativa

Crear la base de datos:

```sql
CREATE DATABASE tpo_facturacion;
```

Conectarse:

```bash
psql -h localhost -U tpo -d tpo_facturacion
```

## Cómo correr los scripts

Setup (en orden), desde esta carpeta:

```bash
psql -h localhost -U tpo -d tpo_facturacion -f 01-schema.sql
psql -h localhost -U tpo -d tpo_facturacion -f 02-seed.sql
psql -h localhost -U tpo -d tpo_facturacion -f 03-view-facturas-fecha.sql
psql -h localhost -U tpo -d tpo_facturacion -f 04-view-productos-no-facturados.sql
psql -h localhost -U tpo -d tpo_facturacion -f 05-crud-producto.sql
```

Para ejecutar una query de requerimiento individual:

```bash
psql -h localhost -U tpo -d tpo_facturacion -f queries/req-08.sql
```

Todos los scripts son **idempotentes**: se pueden re-ejecutar sin error.

## Archivos


| Archivo                               | Descripción                                                                | Estado |
| ------------------------------------- | -------------------------------------------------------------------------- | ------ |
| `01-schema.sql`                       | DDL: tablas `producto`, `factura`, `detalle_factura`, FKs, checks, índices | TODO   |
| `02-seed.sql`                         | Datos de prueba (productos, facturas, detalles)                            | TODO   |
| `03-view-facturas-fecha.sql`          | Vista del requerimiento 11 (facturas ordenadas por fecha)                  | TODO   |
| `04-view-productos-no-facturados.sql` | Vista del requerimiento 12 (productos no facturados)                       | TODO   |
| `05-crud-producto.sql`                | CRUD de productos (requerimiento 14)                                       | TODO   |
| `queries/`                            | Una query por requerimiento (ver mapeo abajo)                              | TODO   |


## Mapeo de requerimientos a archivos SQL

Solo los requerimientos que toca este motor. Los cross-DB necesitan también su contraparte en [../nosql/](../nosql/).


| #   | Requerimiento                         | Archivo                               | Cross-DB                                   |
| --- | ------------------------------------- | ------------------------------------- | ------------------------------------------ |
| 4   | Clientes con al menos una factura     | `queries/req-04.sql`                  | Sí (Mongo agrega `nombre`, `apellido`)                              |
| 5   | Clientes sin facturas                 | `queries/req-05.sql`                  | Sí (Mongo agrega `nombre`, `apellido` y filtra los que NO aparecen en SQL) |
| 6   | Clientes con cantidad de facturas     | `queries/req-06.sql`                  | Sí (Mongo agrega `nombre`, `apellido`)                              |
| 7   | Facturas de "Kai Bullock"             | `queries/req-07.sql`                  | Sí (Mongo resuelve `nombre`+`apellido` a `nro_cliente`)             |
| 8   | Productos facturados al menos una vez | `queries/req-08.sql`                  | No                                                                  |
| 9   | Facturas con productos marca "Ipsum"  | `queries/req-09.sql`                  | No                                                                  |
| 10  | Total gastado por cliente con IVA     | `queries/req-10.sql`                  | Sí (Mongo agrega `nombre`, `apellido`)                              |
| 11  | Vista de facturas ordenadas por fecha | `03-view-facturas-fecha.sql`          | No                                         |
| 12  | Vista de productos no facturados      | `04-view-productos-no-facturados.sql` | No                                         |
| 14  | CRUD de productos                     | `05-crud-producto.sql`                | No                                         |


Los requerimientos 1, 2, 3 y 13 los resuelve Mongo. Ver [../nosql/README.md](../nosql/README.md).

## Convenciones de naming

- Tablas y columnas: `lowercase_snake_case`, **sin prefijo `e01_`**.
- Tablas en singular: `producto`, `factura`, `detalle_factura`.
- Índices: `idx_<tabla>_<columna>`.
- FKs: nombradas implícitamente por Postgres (`<tabla>_<col>_fkey`).
- Capitalización SQL: keywords en UPPER, identifiers en lower, funciones en UPPER. Enforcement vía `sqlfluff` (ver `.sqlfluff` en la raíz del repo).

