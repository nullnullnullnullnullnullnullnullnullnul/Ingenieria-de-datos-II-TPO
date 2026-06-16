-- =====================================================================
-- Requirement 9: Mostrar todos los datos de las facturas que contengan productos de una marca determinada.
--
-- Busca las facturas cuya marca contiene 'Ipsum', retornando la factura, sus
-- detalles y el producto asociado. Se usa LIKE porque en el dataset 'Ipsum'
-- aparece como parte del nombre de la marca, no como valor exacto.
-- =====================================================================

SELECT
    f.nro_factura AS numero_factura,
    f.fecha AS fecha_emision,
    f.total_sin_iva AS subtotal,
    f.iva,
    f.total_con_iva,
    f.nro_cliente,
    df.nro_item AS nro_renglon,
    df.cantidad,
    p.codigo_producto,
    p.marca,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock
FROM factura AS f
INNER JOIN detalle_factura AS df ON f.nro_factura = df.nro_factura
INNER JOIN producto AS p ON df.codigo_producto = p.codigo_producto
WHERE p.marca LIKE '%Ipsum%'
ORDER BY f.nro_factura, df.nro_item;
