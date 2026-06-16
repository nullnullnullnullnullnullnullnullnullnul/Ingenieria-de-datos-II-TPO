-- =====================================================================
-- Requirement 12: Vista de productos no facturados.
--
-- Creates v_productos_no_facturados which returns every product that has no
-- associated detail entries in factura.
-- =====================================================================

DROP VIEW IF EXISTS v_productos_no_facturados;

CREATE VIEW v_productos_no_facturados AS
SELECT *
FROM producto
WHERE NOT EXISTS (
    SELECT 1
    FROM detalle_factura
    WHERE detalle_factura.codigo_producto = producto.codigo_producto
);
