# Ingeniería de Datos II - Trabajo Práctico Obligatorio

Sistema de Facturación con persistencia políglota.
**1er cuatrimestre 2026.**

[![validate](https://github.com/netqo/Ingenieria-de-datos-II-TPO/actions/workflows/validate.yml/badge.svg)](https://github.com/netqo/Ingenieria-de-datos-II-TPO/actions/workflows/validate.yml)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Last commit](https://img.shields.io/github/last-commit/netqo/Ingenieria-de-datos-II-TPO)](https://github.com/netqo/Ingenieria-de-datos-II-TPO/commits/main)

---

## Cátedra

- **Materia:** Ingeniería de Datos II
- **Docente:** Rodriguez Guillermo Horacio
- **Cuatrimestre:** 1er cuatrimestre 2026

---

## Descripción del problema

Se debe implementar un sistema de facturación que controle los productos comprados por los clientes. La facturación verifica disponibilidad de stock, decrementa la cantidad vendida y calcula el monto total considerando IVA y descuentos por volumen.

Enunciado completo: [docs/TPO.md](docs/TPO.md)

## Arquitectura

Capa de persistencia **políglota** (al menos 2 motores distintos), elegida por afinidad de carga: cada entidad vive en el motor que mejor sirve a su patrón de acceso.


| Motor         | Entidades                                | Justificación resumida                                                                        |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| PostgreSQL 17 | `producto`, `factura`, `detalle_factura` | Núcleo transaccional: stock atómico, FKs, joins, vistas, agregaciones. ACID estricto.         |
| MongoDB 8     | `cliente` (con `telefonos` anidados)     | Agregado descriptivo. Teléfonos 1:N siempre consultados con el cliente -> anidamiento canónico. |


El vínculo entre motores es `nro_cliente` (entero): `factura.nro_cliente` en PostgreSQL referencia lógicamente al `nro_cliente` del documento en MongoDB. No es FK relacional cross-motor.

Detalle de la decisión de diseño: [docs/justificacion-poliglota.md](docs/justificacion-poliglota.md).

### Capa de aplicación: API REST

Sobre los dos motores hay una API REST (**NestJS + Fastify**, en [`api/`](api/)) que orquesta las consultas cross-DB y expone cada requerimiento como un endpoint. La documentación interactiva (**Swagger UI**) se sirve en `/docs` y cumple el rol de frontend para demostrar los requerimientos. Las queries SQL siguen viviendo en `sql/` y las pipelines de Mongo en `nosql/`: la API las orquesta, no las reemplaza.

---

## Estructura del repositorio

```
.
|-- .github/                # Templates de PR y workflows de CI
|-- api/                    # API REST (NestJS + Fastify) sobre los dos motores, con Swagger UI
|-- docs/                   # Documentación de diseño, DER y enunciado
|   |-- DER.png
|   |-- TPO.md
|   `-- justificacion-poliglota.md
|-- sql/                    # Scripts SQL (DDL, DML, queries, vistas)
|-- nosql/                  # Scripts NoSQL (setup, seed, queries, CRUD)
|-- scripts/                # Scripts de CI (verificación del estado de Mongo)
|-- .env.example
|-- .gitattributes
|-- .gitignore
|-- .sqlfluff
|-- docker-compose.yml      # postgres + mongo + api
`-- README.md
```

## Requisitos previos

- **Docker** o instalación nativa de:
  - PostgreSQL 17
  - MongoDB 8
- Cliente de PostgreSQL: `psql`
- Cliente de MongoDB: `mongosh` ([download](https://www.mongodb.com/try/download/shell))

## Setup local

Copiar el template de variables de entorno:

```bash
cp .env.example .env
```

Levantar el stack con Docker Compose (PostgreSQL + MongoDB + la API):

```bash
docker compose up -d --build
```

La primera vez buildea la imagen de la API. Una vez arriba, la documentación interactiva queda en **http://localhost:3000/docs**.

> Para levantar solo las bases (sin la API): `docker compose up -d postgres mongo`.

Detalle por motor: [sql/README.md](sql/README.md) y [nosql/README.md](nosql/README.md).

## Cómo cargar los datos

En orden, desde la raíz del repo:

```bash
# PostgreSQL
psql -h localhost -U tpo -d tpo_facturacion -f sql/01-schema.sql
psql -h localhost -U tpo -d tpo_facturacion -f sql/02-seed.sql

# MongoDB
bun run nosql/01-setup.ts
bun run nosql/02-seed.ts
```

## Cómo ejecutar los requerimientos

Cada requerimiento del enunciado está implementado en `sql/`, en `nosql/`, o en ambos (cuando es cross-DB). El mapeo concreto de cada requerimiento a su archivo vive en cada motor:

- [sql/README.md](sql/README.md): requerimientos resueltos en PostgreSQL.
- [nosql/README.md](nosql/README.md): requerimientos resueltos en MongoDB.

La decisión de diseño sobre qué motor toca cada requerimiento (y la justificación) está en [docs/justificacion-poliglota.md](docs/justificacion-poliglota.md).

---

## Convenciones de trabajo

- **Branching:** Git Flow simplificado.
  - `main` recibe solo merges de `dev` para cada entrega, y cada entrega se taggea (`entrega-1`, `entrega-2`...).
  - `dev` integra el trabajo en progreso.
  - Ramas `feat/<descripcion>` y `fix/<descripcion>` salen de `dev` y vuelven a `dev` vía PR.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/).
- **Pull Requests:** obligatorios para mergear a `dev`. Requieren CI verde y 1 aprobación. `main` solo recibe PRs de `dev`.

