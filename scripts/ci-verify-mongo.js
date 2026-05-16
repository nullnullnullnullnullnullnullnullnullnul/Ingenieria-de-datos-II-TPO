// =====================================================================
// CI verification script for the MongoDB cliente collection.
//
// Asserts the post-seed state of the cliente collection. Used by the
// apply-mongo-setup job in .github/workflows/validate.yml after the
// setup and seed scripts run.
//
// Can also be run locally to reproduce CI exactly:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file scripts/ci-verify-mongo.js
//
// Exits with non-zero status if any assertion fails (via quit(1)).
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

const errors = [];

// === Document count ===
const count = db.cliente.countDocuments();
if (count !== 100) errors.push("Expected 100 clientes, got " + count);

// === Index set (by name) ===
const indexNames = db.cliente.getIndexes().map(i => i.name).sort();
const expectedIndexes = ["_id_", "idx_nombre_apellido", "uq_nro_cliente", "uq_telefono"].sort();
if (JSON.stringify(indexNames) !== JSON.stringify(expectedIndexes))
    errors.push("Index mismatch: got " + JSON.stringify(indexNames));

// === uq_telefono specifics: unique + partialFilterExpression ===
// Regression guard for the empty-telefonos-array bug fixed in 8cfe029.
const uqTelefono = db.cliente.getIndexes().find(i => i.name === "uq_telefono");
if (!uqTelefono || !uqTelefono.unique)
    errors.push("uq_telefono missing or not unique");
if (!uqTelefono || !uqTelefono.partialFilterExpression)
    errors.push("uq_telefono missing partialFilterExpression (two empty arrays would collide on (null, null))");

// === Total telefonos across all documents ===
const tele = db.cliente.aggregate([
    { $project: { n: { $size: { $ifNull: ["$telefonos", []] } } } },
    { $group: { _id: null, total: { $sum: "$n" } } }
]).toArray()[0].total;
if (tele !== 198) errors.push("Expected 198 telefonos, got " + tele);

// === Validator: top-level rules ===
try {
    db.cliente.insertOne({ nro_cliente: "not-int", nombre: "X", apellido: "Y", direccion: "Z", activo: 1 });
    errors.push("Validator did not reject bad bsonType for nro_cliente");
} catch (e) { /* expected */ }

try {
    db.cliente.insertOne({ nro_cliente: NumberInt(9999), nombre: "X" });
    errors.push("Validator did not reject missing required fields");
} catch (e) { /* expected */ }

// === Validator: subdocument rules (telefonos[]) ===
try {
    db.cliente.insertOne({
        nro_cliente: NumberInt(9998),
        nombre: "X", apellido: "Y", direccion: "Z", activo: NumberInt(1),
        telefonos: [{ codigo_area: NumberInt(100), nro_telefono: NumberInt(1234567), tipo: "ZZ" }]
    });
    errors.push("Subdoc validator did not reject bad tipo enum (expected only F or M)");
} catch (e) { /* expected */ }

try {
    db.cliente.insertOne({
        nro_cliente: NumberInt(9997),
        nombre: "X", apellido: "Y", direccion: "Z", activo: NumberInt(1),
        telefonos: [{ codigo_area: NumberInt(100), nro_telefono: NumberInt(1234567), tipo: "F", nickname: "extra" }]
    });
    errors.push("Subdoc validator did not reject additionalProperties in telefonos");
} catch (e) { /* expected */ }

// === Unique constraint: uq_nro_cliente ===
try {
    db.cliente.insertOne({
        nro_cliente: NumberInt(1),
        nombre: "Dup", apellido: "Cliente", direccion: "X", activo: NumberInt(1),
        telefonos: []
    });
    errors.push("uq_nro_cliente did not reject duplicate nro_cliente");
} catch (e) { /* expected */ }

// === Report ===
if (errors.length > 0) {
    errors.forEach(e => print("FAIL: " + e));
    quit(1);
}
print("OK: 100 clientes, 198 telefonos, 4 indexes (uq_telefono partial unique),");
print("    validator enforces top-level + subdoc rules, unique constraint enforced.");
