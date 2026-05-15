-- Requirement 11: Vista de facturas ordenadas por fecha.
--
-- Creates v_facturas_por_fecha which returns every factura column sorted by
-- fecha ascending. The DROP guarantees idempotency on re-runs.

DROP VIEW IF EXISTS v_facturas_por_fecha;

CREATE VIEW v_facturas_por_fecha AS
SELECT
    nro_factura,
    fecha,
    total_sin_iva,
    iva,
    total_con_iva,
    nro_cliente
FROM factura
ORDER BY fecha;
