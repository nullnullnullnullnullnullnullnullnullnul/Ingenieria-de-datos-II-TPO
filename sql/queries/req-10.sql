-- =====================================================================
-- Requirement 10: Total gastado por cliente con IVA incluido.
--
-- Returns one row per nro_cliente with the sum of total_con_iva across all
-- their facturas. Cross-DB: Mongo enriches each row with nombre and apellido
-- to produce the final "nombre apellido + total gastado" output the user sees.
-- =====================================================================

SELECT
    nro_cliente,
    SUM(total_con_iva) AS total_gastado
FROM factura
GROUP BY nro_cliente
ORDER BY nro_cliente;
