import { connectMongo, disconnectAll } from '../utils/db';

// =====================================================================
// Requirement 1: Datos de los clientes con sus telefonos.
//
// Pure Mongo. The cliente document already embeds telefonos as a
// subdocument array, so a single find() returns every cliente with its
// phones in one round-trip. No JOIN or $lookup needed.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();

        console.log("=== Requirement 1: Datos de los clientes con sus telefonos ===");

        const result = await db.collection('cliente')
            .find({}, { projection: { _id: 0 } })
            .sort({ nro_cliente: 1 })
            .toArray();

        console.log(`Total clientes returned: ${result.length}\n`);
        console.log("Sample (first 3 documents):");
        console.dir(result.slice(0, 3), { depth: null });
        console.log(`\n(showing 3 of ${result.length} documents)`);

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
