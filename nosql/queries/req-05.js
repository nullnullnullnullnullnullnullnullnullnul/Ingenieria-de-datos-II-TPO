// =====================================================================
// Requirement 5: Clientes sin facturas.
//
// Cross-DB query. The PostgreSQL side (sql/queries/req-05.sql) returns
// the DISTINCT nro_cliente that DO appear in factura (same set as
// req-04, by design). The MongoDB side computes the complement: every
// cliente in the collection whose nro_cliente is NOT in that set,
// using $nin.
//
// STANDALONE vs PRODUCTION:
//   - Standalone (this file run via mongosh): the array of
//     nro_cliente below is hardcoded with the actual output that
//     sql/queries/req-05.sql produces against the current SQL seed in
//     this repo (98 distinct nro_cliente, missing 58 and 62 which
//     have no facturas). This keeps the file reproducible without
//     needing a live Postgres connection.
//   - Production (future API in api/): the equivalent endpoint runs
//     sql/queries/req-05.sql at request time against PostgreSQL, gets
//     the live nro_cliente list, and passes it to this Mongo $nin
//     step. The hardcoded array is replaced by the real-time SQL
//     output. The Mongo find() below stays unchanged.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-05.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 5: Clientes sin facturas ===");

// === SQL side output (real values from sql/02-seed.sql via queries/req-05.sql) ===
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
print(`SQL returned ${sqlClientesConFactura.length} clientes that DO have facturas.`);

// === Mongo side: complement via $nin ===
const result = db.cliente.find(
    { nro_cliente: { $nin: sqlClientesConFactura } },
    { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1, direccion: 1 }
).sort({ nro_cliente: 1 }).toArray();

print(`Mongo found ${result.length} clientes WITHOUT facturas:`);
result.forEach(doc => printjson(doc));
