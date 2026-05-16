// =============================================================================
// req-05.js
// Requerimiento 5: Clientes sin facturas (Cross-DB)
// =============================================================================

// PASO 1 (SQL): SELECT DISTINCT nro_cliente FROM factura;
// Simulamos que SQL nos devuelve que los clientes del 1 al 10 tienen facturas.
const clientesConFacturas_SQL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 

// PASO 2 (Mongo): Traer los clientes que NO estén en esa lista
print("Clientes que no tienen facturas en PostgreSQL:");
const clientesSinFacturas = db.cliente.find({
  nro_cliente: { $nin: clientesConFacturas_SQL }
}).toArray();

printjson(clientesSinFacturas);