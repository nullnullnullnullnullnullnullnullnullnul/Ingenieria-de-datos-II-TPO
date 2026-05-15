-- =====================================================================
-- TPO Ingenieria de Datos II - 1er cuatrimestre 2026
-- Entrega 1: Dataset Inicial (Inserts)
-- ---------------------------------------------------------------------
-- Genera datos de prueba para validar requerimientos 1 a 14.
-- IMPORTANTE: Los nro_cliente deben coincidir con los de MongoDB.
-- =====================================================================

-- 1. CLIENTES 
INSERT INTO e01_cliente (nro_cliente, nombre, apellido, direccion, activo) VALUES
(101, 'Jacob', 'Cooper', 'Calle Falsa 123', 1), 
(102, 'Kai', 'Bullock', 'Avenida Siempre Viva 742', 1),
(103, 'Fantasma', 'SinCompras', 'Ruta 66', 1);

-- 2. PRODUCTOS 
INSERT INTO e01_producto (codigo_producto, marca, nombre, descripcion, precio, stock) VALUES
(1, 'Ipsum', 'Monitor UltraWide', '34 pulgadas 144Hz', 450000.00, 10),
(2, 'Ipsum', 'Teclado Mecanico', 'Switch Red Pro', 85000.00, 20),
(3, 'Logi', 'Mouse Inalambrico', 'Sensor Hero 25K', 60000.00, 5);

-- 3. FACTURAS 
INSERT INTO e01_factura (nro_factura, fecha, total_sin_iva, iva, total_con_iva, nro_cliente) VALUES
(1, '2026-05-10', 450000.00, 94500.00, 544500.00, 101),
(2, '2026-05-12', 85000.00,  17850.00, 102850.00, 102),
(3, '2026-05-14', 450000.00, 94500.00, 544500.00, 101);

-- 4. DETALLE DE FACTURA 
INSERT INTO e01_detalle_factura (nro_factura, nro_item, cantidad, codigo_producto) VALUES
(1, 1, 1, 1), 
(2, 1, 1, 2), 
(3, 1, 1, 1); 