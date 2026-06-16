import { connectMongo, disconnectAll } from '../nosql/utils/db';
import { Int32 } from 'mongodb';

// =====================================================================
// CI verification script for the MongoDB cliente collection.
//
// Asserts the post-seed state of the cliente collection. Used by the
// apply-mongo-setup job in .github/workflows/validate.yml after the
// setup and seed scripts run.
//
// Exits with non-zero status if any assertion fails.
// =====================================================================

async function main() {
    let hasErrors = false;
    const errors: string[] = [];

    try {
        const db = await connectMongo();
        const clienteColl = db.collection('cliente');

        // === Document count ===
        const count = await clienteColl.countDocuments();
        if (count !== 100) errors.push("Expected 100 clientes, got " + count);

        // === Index set (by name) ===
        const indexes = await clienteColl.indexes();
        const indexNames = indexes.map((i: any) => i.name).sort();
        const expectedIndexes = ["_id_", "idx_nombre_apellido", "uq_nro_cliente", "uq_telefono"].sort();
        if (JSON.stringify(indexNames) !== JSON.stringify(expectedIndexes)) {
            errors.push("Index mismatch: got " + JSON.stringify(indexNames));
        }

        // === uq_telefono specifics: unique + partialFilterExpression ===
        const uqTelefono = indexes.find((i: any) => i.name === "uq_telefono");
        if (!uqTelefono || !uqTelefono.unique) {
            errors.push("uq_telefono missing or not unique");
        }
        if (!uqTelefono || !uqTelefono.partialFilterExpression) {
            errors.push("uq_telefono missing partialFilterExpression (two empty arrays would collide on (null, null))");
        }

        // === Total telefonos across all documents ===
        const teleStats = await clienteColl.aggregate([
            { $project: { n: { $size: { $ifNull: ["$telefonos", []] } } } },
            { $group: { _id: null, total: { $sum: "$n" } } }
        ]).toArray();
        const tele = teleStats[0]?.total || 0;
        if (tele !== 198) errors.push("Expected 198 telefonos, got " + tele);

        // === Validator: top-level rules ===
        try {
            await clienteColl.insertOne({ nro_cliente: "not-int", nombre: "X", apellido: "Y", direccion: "Z", activo: 1 } as any);
            errors.push("Validator did not reject bad bsonType for nro_cliente");
        } catch (e) { /* expected */ }

        try {
            await clienteColl.insertOne({ nro_cliente: new Int32(9999), nombre: "X" } as any);
            errors.push("Validator did not reject missing required fields");
        } catch (e) { /* expected */ }

        // === Validator: subdocument rules (telefonos[]) ===
        try {
            await clienteColl.insertOne({
                nro_cliente: new Int32(9998),
                nombre: "X", apellido: "Y", direccion: "Z", activo: new Int32(1),
                telefonos: [{ codigo_area: new Int32(100), nro_telefono: new Int32(1234567), tipo: "ZZ" }]
            } as any);
            errors.push("Subdoc validator did not reject bad tipo enum (expected only F or M)");
        } catch (e) { /* expected */ }

        try {
            await clienteColl.insertOne({
                nro_cliente: new Int32(9997),
                nombre: "X", apellido: "Y", direccion: "Z", activo: new Int32(1),
                telefonos: [{ codigo_area: new Int32(100), nro_telefono: new Int32(1234567), tipo: "F", nickname: "extra" }]
            } as any);
            errors.push("Subdoc validator did not reject additionalProperties in telefonos");
        } catch (e) { /* expected */ }

        // === Unique constraint: uq_nro_cliente ===
        try {
            await clienteColl.insertOne({
                nro_cliente: new Int32(1),
                nombre: "Dup", apellido: "Cliente", direccion: "X", activo: new Int32(1),
                telefonos: []
            });
            errors.push("uq_nro_cliente did not reject duplicate nro_cliente");
        } catch (e) { /* expected */ }

        // === Report ===
        if (errors.length > 0) {
            errors.forEach(e => console.error("FAIL: " + e));
            hasErrors = true;
        } else {
            console.log("OK: 100 clientes, 198 telefonos, 4 indexes (uq_telefono partial unique),");
            console.log("    validator enforces top-level + subdoc rules, unique constraint enforced.");
        }

    } catch (err) {
        console.error("Error during verification:", err);
        hasErrors = true;
    } finally {
        await disconnectAll();
        if (hasErrors) {
            process.exit(1);
        }
    }
}

main();
