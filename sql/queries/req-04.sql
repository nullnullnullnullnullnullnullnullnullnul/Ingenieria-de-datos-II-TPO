-- Requirement 4: Clientes con al menos una factura.
--
-- Returns the distinct nro_cliente values that appear in factura.
-- Cross-DB: this set is consumed by Mongo, which enriches each id with the
-- corresponding nombre and apellido from the cliente collection.

SELECT DISTINCT nro_cliente
FROM factura
ORDER BY nro_cliente;
