-- =====================================================================
-- Requirement 11: Facturas ordenadas por fecha.
--
-- Utiliza la vista v_facturas_por_fecha para retornar las facturas ordenadas.
-- =====================================================================

SELECT * FROM v_facturas_por_fecha
ORDER BY fecha;
