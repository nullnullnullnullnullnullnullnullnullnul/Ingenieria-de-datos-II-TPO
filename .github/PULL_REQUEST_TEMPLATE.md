## Description

<!-- What changes and why. Be brief but specific. -->

## Type of change

- [ ] feat - new SQL/Mongo functionality (schema, query, view, CRUD)
- [ ] fix - bug fix
- [ ] docs - documentation (README, justificacion, comments)
- [ ] chore - config / scripts / CI / repo housekeeping

## Requirements covered

<!-- Mark which of the 14 requirements this PR addresses. -->

- [ ] 1. Clientes con sus telefonos
- [ ] 2. Telefonos de "Jacob Cooper"
- [ ] 3. Telefonos con datos del cliente
- [ ] 4. Clientes con al menos una factura
- [ ] 5. Clientes sin facturas
- [ ] 6. Clientes con cantidad de facturas
- [ ] 7. Facturas de "Kai Bullock"
- [ ] 8. Productos facturados al menos una vez
- [ ] 9. Facturas con productos marca "Ipsum"
- [ ] 10. Total gastado por cliente con IVA
- [ ] 11. Vista de facturas ordenadas por fecha
- [ ] 12. Vista de productos no facturados
- [ ] 13. CRUD de clientes
- [ ] 14. CRUD de productos
- [ ] None (infra / docs / CI only)

## How to test

<!-- Concrete steps for the reviewer. Include the exact psql/mongosh commands when applicable. -->

1.
2.

## Checklist

- [ ] CI is green (sqlfluff lint + Postgres apply-schema)
- [ ] Changes were tested locally against a fresh Postgres
- [ ] Documentation updated if applicable (README / justificacion / engine README)
- [ ] No secrets or credentials included
- [ ] PR title follows Conventional Commits format
- [ ] PR targets `dev` (not `main` directly)
