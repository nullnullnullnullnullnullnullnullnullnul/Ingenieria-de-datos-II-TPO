// =====================================================================
// Requirement 1: Datos de los clientes con sus telefonos.
//
// Pure Mongo. The cliente document already embeds telefonos as a
// subdocument array, so a single find() returns every cliente with its
// phones in one round-trip. No JOIN or $lookup needed.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-01.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 1: Datos de los clientes con sus telefonos ===");

const result = db.cliente
    .find({}, { _id: 0 })
    .sort({ nro_cliente: 1 })
    .toArray();

print(`Total clientes returned: ${result.length}`);
print("");
print("Sample (first 3 documents):");
result.slice(0, 3).forEach(doc => printjson(doc));
print("");
print(`(showing 3 of ${result.length} documents; use mongosh interactively to inspect more)`);
