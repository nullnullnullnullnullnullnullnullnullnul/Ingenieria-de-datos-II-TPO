import { connectMongo, disconnectAll } from '../utils/db';

// =====================================================================
// Requirement 2: Telefonos y nro de cliente de "Jacob Cooper".
//
// Pure Mongo. Filter by nombre + apellido (idx_nombre_apellido covers
// this) and project only the requested fields. Jacob Cooper exists as
// nro_cliente 22 in the seed.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();

        console.log("=== Requirement 2: Telefonos y nro de Jacob Cooper ===");

        const result = await db.collection('cliente').findOne(
            { nombre: "Jacob", apellido: "Cooper" },
            { projection: { _id: 0, nro_cliente: 1, telefonos: 1 } }
        );

        if (result === null) {
            console.log("No cliente named 'Jacob Cooper' found.");
        } else {
            console.dir(result, { depth: null });
            console.log(`\nJacob Cooper has nro_cliente=${result.nro_cliente} and ${result.telefonos?.length || 0} telefonos.`);
        }

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
