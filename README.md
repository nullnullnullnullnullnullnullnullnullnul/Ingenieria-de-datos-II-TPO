# Ingeniería de Datos II - Trabajo Práctico Obligatorio

Sistema de Facturación con persistencia políglota.
**1er cuatrimestre 2026.**

[![validate](https://github.com/nullnullnullnullnullnullnullnullnullnul/Ingenieria-de-datos-II-TPO/actions/workflows/validate.yml/badge.svg)](https://github.com/nullnullnullnullnullnullnullnullnullnul/Ingenieria-de-datos-II-TPO/actions/workflows/validate.yml)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Last commit](https://img.shields.io/github/last-commit/nullnullnullnullnullnullnullnullnullnul/Ingenieria-de-datos-II-TPO)](https://github.com/nullnullnullnullnullnullnullnullnullnul/Ingenieria-de-datos-II-TPO/commits/main)

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

---

## Estructura del repositorio

```
.
├── .github/                # Templates de PR y workflows de CI
├── docs/                   # Documentación de diseño, DER y enunciado
│   ├── DER.png
│   ├── TPO.md
│   └── justificacion-poliglota.md
├── sql/                    # Scripts SQL (DDL, DML, queries, vistas, CRUD)
├── nosql/                  # Scripts NoSQL (setup, seed, queries, CRUD)
├── .env.example
├── .gitattributes
├── .gitignore
├── .sqlfluff
├── docker-compose.yml
└── README.md
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

Levantar PostgreSQL con Docker Compose:

```bash
docker compose up -d postgres
```

Levantar MongoDB (todavía standalone, va a migrar a `docker-compose.yml` en su fase):

```bash
docker run -d --name tpo-mongo -p 27017:27017 mongo:8
```

Detalle por motor: [sql/README.md](sql/README.md) y [nosql/README.md](nosql/README.md).

## Cómo cargar los datos

En orden, desde la raíz del repo:

```bash
# PostgreSQL
psql -h localhost -U tpo -d tpo_facturacion -f sql/01-schema.sql
psql -h localhost -U tpo -d tpo_facturacion -f sql/02-seed.sql

# MongoDB
mongosh "mongodb://localhost:27017/tpo_facturacion" --file nosql/01-setup.js
mongosh "mongodb://localhost:27017/tpo_facturacion" --file nosql/02-seed.js
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

