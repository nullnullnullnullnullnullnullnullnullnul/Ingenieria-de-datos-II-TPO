// =====================================================================
// Requirement 10: Total gastado por cliente con IVA incluido.
//
// Cross-DB query. The PostgreSQL side (sql/queries/req-10.sql) returns
// (nro_cliente, SUM(total_con_iva)) for each cliente that has at
// least one factura. The MongoDB side enriches each id with nombre
// and apellido to produce the final "Nombre Apellido + total" output.
//
// Note: 26 of the 98 clientes show total_gastado = 0 because every
// factura assigned to them in the dataset has total_sin_iva = 0 (126
// of the 400 facturas in the seed have a zero total). This is faithful
// to the dataset provided by the catedra and is not a query bug.
//
// STANDALONE vs PRODUCTION:
//   - Standalone (this file run via mongosh): the array of
//     (nro_cliente, total_gastado) pairs below is hardcoded with the
//     actual output that sql/queries/req-10.sql produces against the
//     current SQL seed in this repo (98 rows). This keeps the file
//     reproducible without needing a live Postgres connection.
//   - Production (future API in api/): the equivalent endpoint runs
//     sql/queries/req-10.sql at request time against PostgreSQL, gets
//     the live (nro_cliente, total_gastado) pairs, and passes them to
//     this Mongo enrichment step. The hardcoded array is replaced by
//     the real-time SQL output. The Mongo enrichment below stays
//     unchanged.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-10.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 10: Total gastado por cliente con IVA ===");

// === SQL side output (real values from sql/02-seed.sql via queries/req-10.sql) ===
const sqlTotales = [
    { nro_cliente: 1, total_gastado: 1307559.3797561342 },
    { nro_cliente: 2, total_gastado: 574653.2957576637 },
    { nro_cliente: 3, total_gastado: 1110559.9252185554 },
    { nro_cliente: 4, total_gastado: 1461081.4573979538 },
    { nro_cliente: 5, total_gastado: 1393107.7776439171 },
    { nro_cliente: 6, total_gastado: 1138736.8910358716 },
    { nro_cliente: 7, total_gastado: 780646.2815954154 },
    { nro_cliente: 8, total_gastado: 1256660.9278443374 },
    { nro_cliente: 9, total_gastado: 1782944.7916752226 },
    { nro_cliente: 10, total_gastado: 463590.5329465942 },
    { nro_cliente: 11, total_gastado: 741104.5476312279 },
    { nro_cliente: 12, total_gastado: 1207908.8017057113 },
    { nro_cliente: 13, total_gastado: 457070.625087852 },
    { nro_cliente: 14, total_gastado: 1252280.6919640044 },
    { nro_cliente: 15, total_gastado: 2246407.656810305 },
    { nro_cliente: 16, total_gastado: 2064635.1534929809 },
    { nro_cliente: 17, total_gastado: 1522885.882102021 },
    { nro_cliente: 18, total_gastado: 2253032.6483034343 },
    { nro_cliente: 19, total_gastado: 155569.9545923195 },
    { nro_cliente: 20, total_gastado: 1211138.1666147423 },
    { nro_cliente: 21, total_gastado: 933113.361812054 },
    { nro_cliente: 22, total_gastado: 1736629.2334956322 },
    { nro_cliente: 23, total_gastado: 1385316.303250223 },
    { nro_cliente: 24, total_gastado: 612936.7865290527 },
    { nro_cliente: 25, total_gastado: 1590659.464925907 },
    { nro_cliente: 26, total_gastado: 578943.1247315063 },
    { nro_cliente: 27, total_gastado: 517020.4061923828 },
    { nro_cliente: 28, total_gastado: 335094.1424623566 },
    { nro_cliente: 29, total_gastado: 1197278.155907215 },
    { nro_cliente: 30, total_gastado: 1196762.8705052338 },
    { nro_cliente: 31, total_gastado: 457574.73233574675 },
    { nro_cliente: 32, total_gastado: 630161.5921364441 },
    { nro_cliente: 33, total_gastado: 1309943.6742782763 },
    { nro_cliente: 34, total_gastado: 351561.629920166 },
    { nro_cliente: 35, total_gastado: 697753.4990136663 },
    { nro_cliente: 36, total_gastado: 0 },
    { nro_cliente: 37, total_gastado: 26885.77745085144 },
    { nro_cliente: 38, total_gastado: 728283.3350003891 },
    { nro_cliente: 39, total_gastado: 1384085.9505258063 },
    { nro_cliente: 40, total_gastado: 287631.53975555423 },
    { nro_cliente: 41, total_gastado: 474377.0465795746 },
    { nro_cliente: 42, total_gastado: 1235117.7355409546 },
    { nro_cliente: 43, total_gastado: 960168.3089923332 },
    { nro_cliente: 44, total_gastado: 687629.7964178162 },
    { nro_cliente: 45, total_gastado: 738903.0783496551 },
    { nro_cliente: 46, total_gastado: 435210.70359228516 },
    { nro_cliente: 47, total_gastado: 538942.072231292 },
    { nro_cliente: 48, total_gastado: 407998.023104187 },
    { nro_cliente: 49, total_gastado: 592247.9349565632 },
    { nro_cliente: 50, total_gastado: 1335824.6442663204 },
    { nro_cliente: 51, total_gastado: 489801.66682351683 },
    { nro_cliente: 52, total_gastado: 857042.4277914504 },
    { nro_cliente: 53, total_gastado: 698296.246137268 },
    { nro_cliente: 54, total_gastado: 440594.320799652 },
    { nro_cliente: 55, total_gastado: 562416.3464600496 },
    { nro_cliente: 56, total_gastado: 583654.8332666319 },
    { nro_cliente: 57, total_gastado: 942725.8138851014 },
    { nro_cliente: 59, total_gastado: 232099.71859992217 },
    { nro_cliente: 60, total_gastado: 663523.8141319356 },
    { nro_cliente: 61, total_gastado: 259385.1440494766 },
    { nro_cliente: 63, total_gastado: 408360.7303638001 },
    { nro_cliente: 64, total_gastado: 717271.4619148646 },
    { nro_cliente: 65, total_gastado: 363695.539734436 },
    { nro_cliente: 66, total_gastado: 46293.06342961121 },
    { nro_cliente: 67, total_gastado: 597944.3910625229 },
    { nro_cliente: 68, total_gastado: 634805.6257940063 },
    { nro_cliente: 69, total_gastado: 74287.6068515625 },
    { nro_cliente: 70, total_gastado: 219918.84326930117 },
    { nro_cliente: 71, total_gastado: 302893.2915318985 },
    { nro_cliente: 72, total_gastado: 241990.75383387422 },
    { nro_cliente: 73, total_gastado: 712440.888376213 },
    { nro_cliente: 74, total_gastado: 292673.4706007538 },
    { nro_cliente: 75, total_gastado: 532851.4009169006 },
    { nro_cliente: 76, total_gastado: 0 },
    { nro_cliente: 77, total_gastado: 0 },
    { nro_cliente: 78, total_gastado: 0 },
    { nro_cliente: 79, total_gastado: 0 },
    { nro_cliente: 80, total_gastado: 0 },
    { nro_cliente: 81, total_gastado: 0 },
    { nro_cliente: 82, total_gastado: 0 },
    { nro_cliente: 83, total_gastado: 0 },
    { nro_cliente: 84, total_gastado: 0 },
    { nro_cliente: 85, total_gastado: 0 },
    { nro_cliente: 86, total_gastado: 0 },
    { nro_cliente: 87, total_gastado: 0 },
    { nro_cliente: 88, total_gastado: 0 },
    { nro_cliente: 89, total_gastado: 0 },
    { nro_cliente: 90, total_gastado: 0 },
    { nro_cliente: 91, total_gastado: 0 },
    { nro_cliente: 92, total_gastado: 0 },
    { nro_cliente: 93, total_gastado: 0 },
    { nro_cliente: 94, total_gastado: 0 },
    { nro_cliente: 95, total_gastado: 0 },
    { nro_cliente: 96, total_gastado: 0 },
    { nro_cliente: 97, total_gastado: 0 },
    { nro_cliente: 98, total_gastado: 0 },
    { nro_cliente: 99, total_gastado: 0 },
    { nro_cliente: 100, total_gastado: 0 }
];
print(`SQL returned ${sqlTotales.length} (nro_cliente, total_gastado) pairs.`);

// === Build lookup table by nro_cliente ===
const totalById = Object.fromEntries(sqlTotales.map(r => [r.nro_cliente, r.total_gastado]));
const ids = sqlTotales.map(r => r.nro_cliente);

// === Mongo side: enrich each id with nombre and apellido ===
const result = db.cliente.find(
    { nro_cliente: { $in: ids } },
    { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 }
).sort({ nro_cliente: 1 }).toArray()
    .map(c => ({ ...c, total_gastado: totalById[c.nro_cliente] }));

print(`Mongo enriched ${result.length} clientes.`);
print("");
print("Sample with non-zero totals (first 5):");
result.filter(r => r.total_gastado > 0).slice(0, 5).forEach(d =>
    print(`  ${d.nombre} ${d.apellido} (cliente ${d.nro_cliente}): $${d.total_gastado.toFixed(2)}`)
);
print("");
print(`Clientes with total_gastado = 0 (zero-total facturas in the seed): ${result.filter(r => r.total_gastado === 0).length}`);
