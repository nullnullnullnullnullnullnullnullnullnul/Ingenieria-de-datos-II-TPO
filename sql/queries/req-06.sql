-- =====================================================================
-- Requirement 6: Clientes con cantidad de facturas (>= 1).
--
-- Returns one row per nro_cliente that appears in factura, with the total
-- count of facturas. Cross-DB: Mongo enriches each row with nombre and
-- apellido. For clientes absent from this result (count = 0), Mongo emits
-- them with cantidad_facturas = 0.
-- =====================================================================

SELECT
    nro_cliente,
    COUNT(*) AS cantidad_facturas
FROM factura
GROUP BY nro_cliente
ORDER BY nro_cliente;
