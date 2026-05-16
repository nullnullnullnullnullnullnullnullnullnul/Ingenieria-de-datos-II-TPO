// =====================================================================
// Requirement 3: Mostrar cada telefono junto con los datos del cliente.
//
// Pure Mongo. $unwind descompone el array embebido `telefonos` y
// produce una fila por cada telefono, conservando los campos del
// cliente. El $project achata la estructura para que cada fila
// contenga directamente codigo_area, nro_telefono y tipo (en vez de
// quedar anidados bajo un subdocumento "telefonos"). El _id se
// excluye para output limpio.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file queries/req-03.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

print("=== Requirement 3: cada telefono junto con los datos del cliente ===");

const result = db.cliente.aggregate([
    { $unwind: "$telefonos" },
    {
        $project: {
            _id: 0,
            nro_cliente: 1,
            nombre: 1,
            apellido: 1,
            direccion: 1,
            codigo_area: "$telefonos.codigo_area",
            nro_telefono: "$telefonos.nro_telefono",
            tipo: "$telefonos.tipo"
        }
    },
    { $sort: { nro_cliente: 1, codigo_area: 1 } }
]).toArray();

print(`Total telefonos enumerados: ${result.length}`);
print("");
print("Sample (first 5):");
result.slice(0, 5).forEach(doc => printjson(doc));
print(`... (showing 5 of ${result.length})`);
