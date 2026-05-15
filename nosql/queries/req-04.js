// =====================================================================
// Requirement 4: Clientes con al menos una factura.
//
// Cross-DB query. The PostgreSQL side returns the DISTINCT set of
// nro_cliente that appear in factura (see sql/queries/req-04.sql). The
// MongoDB side takes that list and enriches each id with nombre and
// apellido. The hardcoded array below is the actual output that
// sql/queries/req-04.sql produces against the SQL seed in this repo
// (98 distinct nro_cliente, missing 58 and 62 which have no facturas).
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-04.js
// =====================================================================

print("=== Requirement 4: Clientes con al menos una factura ===");

// === SQL side output (real values from sql/02-seed.sql via queries/req-04.sql) ===
const sqlClientesConFactura = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 54, 55, 56, 57, 59, 60, 61,
    63, 64, 65, 66, 67, 68, 69, 70, 71, 72,
    73, 74, 75, 76, 77, 78, 79, 80, 81, 82,
    83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
    93, 94, 95, 96, 97, 98, 99, 100
];
print(`SQL returned ${sqlClientesConFactura.length} nro_clientes with at least one factura.`);

// === Mongo side: enrich each id with nombre and apellido ===
const result = db.cliente.find(
    { nro_cliente: { $in: sqlClientesConFactura } },
    { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 }
).sort({ nro_cliente: 1 }).toArray();

print(`Mongo enriched ${result.length} clientes (the difference vs SQL count would be missing docs).`);
print("");
print("Sample (first 5):");
result.slice(0, 5).forEach(doc => printjson(doc));
print(`... (showing 5 of ${result.length})`);
