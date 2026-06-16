-- =====================================================================
-- Requirement 7: Mostrar las facturas de un cliente determinado.
--
-- Devuelve las facturas dado el numero de cliente (obtenido de mongo).
-- =====================================================================

SELECT
    nro_factura,
    fecha,
    total_sin_iva,
    iva,
    total_con_iva,
    nro_cliente
FROM factura
WHERE nro_cliente = $1
ORDER BY fecha;
