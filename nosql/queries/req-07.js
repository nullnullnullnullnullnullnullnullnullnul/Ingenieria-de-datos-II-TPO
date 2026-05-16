// =====================================================================
// Requirement 7: Listar las facturas de "Kai Bullock".
//
// Cross-DB query. The full pipeline:
//   1. Mongo resolves nombre + apellido to nro_cliente.
//   2. SQL fetches every factura row where factura.nro_cliente = :id.
// The final output of the requirement is the SQL rows, not the Mongo
// result. This file owns step 1 only; the SQL query for step 2 is in
// sql/queries/req-07.sql and the orchestration of both steps is the
// job of the application layer.
//
// STANDALONE vs PRODUCTION:
//   - Standalone (this file run via mongosh): runs step 1 and prints
//     the exact SQL statement that step 2 would execute, with the
//     resolved nro_cliente already substituted. The reviewer can copy
//     the SQL into psql to see the final result. The file does NOT
//     attempt to run the SQL itself; mongosh is a Mongo client, not a
//     polyglot orchestrator.
//   - Production (future API in api/): the endpoint chains both steps
//     in a single handler. It calls this Mongo lookup, then runs the
//     SQL query against PostgreSQL with the resolved id, and returns
//     the SQL rows as the response. The Mongo lookup logic below
//     stays unchanged.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-07.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 7: Facturas de Kai Bullock ===");

// === Mongo step 1: name -> nro_cliente ===
const kai = db.cliente.findOne(
    { nombre: "Kai", apellido: "Bullock" },
    { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 }
);

if (kai === null) {
    print("No cliente named 'Kai Bullock' found in Mongo. Cannot proceed to step 2.");
} else {
    print(`Mongo step 1 OK: ${kai.nombre} ${kai.apellido} -> nro_cliente = ${kai.nro_cliente}`);
    print("");
    print("SQL step 2 (run in psql to see the final result of the requirement):");
    print("");
    print(`    SELECT nro_factura, fecha, total_sin_iva, iva, total_con_iva`);
    print(`    FROM factura`);
    print(`    WHERE nro_cliente = ${kai.nro_cliente}`);
    print(`    ORDER BY fecha;`);
}
