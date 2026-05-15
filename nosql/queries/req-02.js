// =====================================================================
// Requirement 2: Telefonos y nro de cliente de "Jacob Cooper".
//
// Pure Mongo. Filter by nombre + apellido (idx_nombre_apellido covers
// this) and project only the requested fields. Jacob Cooper exists as
// nro_cliente 22 in the seed.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-02.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 2: Telefonos y nro de Jacob Cooper ===");

const result = db.cliente.findOne(
    { nombre: "Jacob", apellido: "Cooper" },
    { _id: 0, nro_cliente: 1, telefonos: 1 }
);

if (result === null) {
    print("No cliente named 'Jacob Cooper' found.");
} else {
    printjson(result);
    print("");
    print(`Jacob Cooper has nro_cliente=${result.nro_cliente} and ${result.telefonos.length} telefonos.`);
}
