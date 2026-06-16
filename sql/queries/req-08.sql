-- =====================================================================
-- Requirement 8: Mostrar todos los productos que han sido facturados al menos una vez.
--
-- Devuelve los datos de los productos que estan en detalle_factura.
-- =====================================================================

SELECT DISTINCT
    p.codigo_producto,
    p.marca,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock
FROM producto AS p
INNER JOIN detalle_factura AS df ON p.codigo_producto = df.codigo_producto
ORDER BY p.codigo_producto;
