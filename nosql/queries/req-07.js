// =============================================================================
// req-07.js
// Requerimiento 7: Facturas de "Kai Bullock" (Cross-DB Lookup)
// =============================================================================

// STEP 1 (Mongo): Search for Kai Bullock to get his nro_cliente ID
const kai = db.cliente.findOne(
  { nombre: "Kai", apellido: "Bullock" },
  { nro_cliente: 1, _id: 0 } 
);

if (kai) {
  print(`[Paso 1 - Mongo] El nro_cliente de Kai Bullock es: ${kai.nro_cliente}`);
  print(`[Paso 2 - SQL] Ejecutar en PostgreSQL: SELECT * FROM factura WHERE nro_cliente = ${kai.nro_cliente};`);
} else {
  print("No se encontró a Kai Bullock en la base de datos.");
}