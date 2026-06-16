-- =====================================================================
-- Requirement 11: Vista de facturas ordenadas por fecha.
--
-- Creates v_facturas_por_fecha which exposes every factura column. The ordering
-- is applied by the consuming query (sql/queries/req-11.sql), not in the view:
-- a view's internal ORDER BY is not guaranteed to be preserved by an outer
-- SELECT. The DROP guarantees idempotency on re-runs.
-- =====================================================================

DROP VIEW IF EXISTS v_facturas_por_fecha;

CREATE VIEW v_facturas_por_fecha AS
SELECT
    nro_factura,
    fecha,
    total_sin_iva,
    iva,
    total_con_iva,
    nro_cliente
FROM factura;
