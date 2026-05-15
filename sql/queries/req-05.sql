-- Requirement 5: Clientes sin facturas.
--
-- SQL returns the SAME set as req-04: distinct nro_cliente values present in
-- factura. Mongo consumes this set and computes the complement against its
-- full cliente collection (`{ nro_cliente: { $nin: <set> } }`), yielding the
-- clientes that have NOT generated any factura.

SELECT DISTINCT nro_cliente
FROM factura
ORDER BY nro_cliente;
