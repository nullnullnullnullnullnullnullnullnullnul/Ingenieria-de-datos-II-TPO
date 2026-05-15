// =====================================================================
// Requirement 6: Clientes con cantidad de facturas (0 si no tienen).
//
// Cross-DB query. The PostgreSQL side returns (nro_cliente, COUNT(*)) for
// each cliente that has at least one factura (see sql/queries/req-06.sql).
// The MongoDB side merges that with the full cliente set, defaulting
// cantidad to 0 for clientes absent from the SQL result. The hardcoded
// array below is the actual output that sql/queries/req-06.sql produces
// against the SQL seed in this repo (98 rows; clientes 58 and 62 have no
// facturas so they appear with cantidad=0 in the final output).
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-06.js
// =====================================================================

print("=== Requirement 6: Clientes con cantidad de facturas ===");

// === SQL side output (real values from sql/02-seed.sql via queries/req-06.sql) ===
const sqlCounts = [
    { nro_cliente: 1, cantidad: 4 }, { nro_cliente: 2, cantidad: 2 }, { nro_cliente: 3, cantidad: 3 }, { nro_cliente: 4, cantidad: 7 },
    { nro_cliente: 5, cantidad: 5 }, { nro_cliente: 6, cantidad: 4 }, { nro_cliente: 7, cantidad: 3 }, { nro_cliente: 8, cantidad: 5 },
    { nro_cliente: 9, cantidad: 5 }, { nro_cliente: 10, cantidad: 2 }, { nro_cliente: 11, cantidad: 3 }, { nro_cliente: 12, cantidad: 4 },
    { nro_cliente: 13, cantidad: 2 }, { nro_cliente: 14, cantidad: 3 }, { nro_cliente: 15, cantidad: 6 }, { nro_cliente: 16, cantidad: 6 },
    { nro_cliente: 17, cantidad: 6 }, { nro_cliente: 18, cantidad: 7 }, { nro_cliente: 19, cantidad: 1 }, { nro_cliente: 20, cantidad: 4 },
    { nro_cliente: 21, cantidad: 2 }, { nro_cliente: 22, cantidad: 6 }, { nro_cliente: 23, cantidad: 4 }, { nro_cliente: 24, cantidad: 2 },
    { nro_cliente: 25, cantidad: 4 }, { nro_cliente: 26, cantidad: 4 }, { nro_cliente: 27, cantidad: 5 }, { nro_cliente: 28, cantidad: 3 },
    { nro_cliente: 29, cantidad: 4 }, { nro_cliente: 30, cantidad: 6 }, { nro_cliente: 31, cantidad: 4 }, { nro_cliente: 32, cantidad: 4 },
    { nro_cliente: 33, cantidad: 9 }, { nro_cliente: 34, cantidad: 3 }, { nro_cliente: 35, cantidad: 6 }, { nro_cliente: 36, cantidad: 1 },
    { nro_cliente: 37, cantidad: 2 }, { nro_cliente: 38, cantidad: 5 }, { nro_cliente: 39, cantidad: 5 }, { nro_cliente: 40, cantidad: 1 },
    { nro_cliente: 41, cantidad: 3 }, { nro_cliente: 42, cantidad: 8 }, { nro_cliente: 43, cantidad: 5 }, { nro_cliente: 44, cantidad: 3 },
    { nro_cliente: 45, cantidad: 3 }, { nro_cliente: 46, cantidad: 2 }, { nro_cliente: 47, cantidad: 5 }, { nro_cliente: 48, cantidad: 2 },
    { nro_cliente: 49, cantidad: 3 }, { nro_cliente: 50, cantidad: 4 }, { nro_cliente: 51, cantidad: 3 }, { nro_cliente: 52, cantidad: 8 },
    { nro_cliente: 53, cantidad: 7 }, { nro_cliente: 54, cantidad: 5 }, { nro_cliente: 55, cantidad: 5 }, { nro_cliente: 56, cantidad: 6 },
    { nro_cliente: 57, cantidad: 5 }, { nro_cliente: 59, cantidad: 4 }, { nro_cliente: 60, cantidad: 5 }, { nro_cliente: 61, cantidad: 3 },
    { nro_cliente: 63, cantidad: 3 }, { nro_cliente: 64, cantidad: 8 }, { nro_cliente: 65, cantidad: 3 }, { nro_cliente: 66, cantidad: 1 },
    { nro_cliente: 67, cantidad: 5 }, { nro_cliente: 68, cantidad: 6 }, { nro_cliente: 69, cantidad: 1 }, { nro_cliente: 70, cantidad: 2 },
    { nro_cliente: 71, cantidad: 4 }, { nro_cliente: 72, cantidad: 3 }, { nro_cliente: 73, cantidad: 5 }, { nro_cliente: 74, cantidad: 3 },
    { nro_cliente: 75, cantidad: 5 }, { nro_cliente: 76, cantidad: 5 }, { nro_cliente: 77, cantidad: 1 }, { nro_cliente: 78, cantidad: 4 },
    { nro_cliente: 79, cantidad: 8 }, { nro_cliente: 80, cantidad: 1 }, { nro_cliente: 81, cantidad: 5 }, { nro_cliente: 82, cantidad: 8 },
    { nro_cliente: 83, cantidad: 6 }, { nro_cliente: 84, cantidad: 3 }, { nro_cliente: 85, cantidad: 5 }, { nro_cliente: 86, cantidad: 4 },
    { nro_cliente: 87, cantidad: 4 }, { nro_cliente: 88, cantidad: 5 }, { nro_cliente: 89, cantidad: 4 }, { nro_cliente: 90, cantidad: 4 },
    { nro_cliente: 91, cantidad: 5 }, { nro_cliente: 92, cantidad: 2 }, { nro_cliente: 93, cantidad: 2 }, { nro_cliente: 94, cantidad: 4 },
    { nro_cliente: 95, cantidad: 5 }, { nro_cliente: 96, cantidad: 1 }, { nro_cliente: 97, cantidad: 6 }, { nro_cliente: 98, cantidad: 4 },
    { nro_cliente: 99, cantidad: 2 }, { nro_cliente: 100, cantidad: 2 }
];
print(`SQL returned ${sqlCounts.length} (nro_cliente, cantidad) pairs.`);

// === Build lookup table by nro_cliente ===
const countById = Object.fromEntries(sqlCounts.map(r => [r.nro_cliente, r.cantidad]));

// === Mongo side: iterate ALL clientes, attach cantidad (default 0) ===
const result = db.cliente.find(
    {},
    { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 }
).sort({ nro_cliente: 1 }).toArray()
    .map(c => ({ ...c, cantidad: countById[c.nro_cliente] || 0 }));

print(`Total clientes in final result: ${result.length}`);
print("");
print("Clientes con cantidad = 0 (no facturas):");
result.filter(r => r.cantidad === 0).forEach(d => printjson(d));
print("");
print("Sample with facturas (first 5):");
result.filter(r => r.cantidad > 0).slice(0, 5).forEach(d => printjson(d));
