// =============================================================================
// req-10.js
// Requerimiento 10: Total gastado por cliente con IVA (Cross-DB)
// =============================================================================

// STEP 1 (SQL): SELECT nro_cliente, SUM(total_con_iva)...
// We simulate the totals calculated in Postgres for a couple of clients from the seed.
const totalesSQL = [
  { nro_cliente: 1, total_gastado: 154500.50 }, // Xerxes Hale
  { nro_cliente: 2, total_gastado: 89320.00 },  // Brent Leblanc
  { nro_cliente: 5, total_gastado: 210000.00 }  // Kai Bullock
];

print("=== Reporte de Total Gastado por Cliente ===");

// STEP 2 (Mongo): Cross reference with client names
totalesSQL.forEach(registro => {
  const cliente = db.cliente.findOne({ nro_cliente: registro.nro_cliente });
  
  if (cliente) {
    print(`- ${cliente.nombre} ${cliente.apellido} (ID: ${cliente.nro_cliente}): $${registro.total_gastado}`);
  }
});