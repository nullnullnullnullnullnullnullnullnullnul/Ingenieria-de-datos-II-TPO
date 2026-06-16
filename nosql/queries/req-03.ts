import { connectMongo, disconnectAll } from '../utils/db';

// =====================================================================
// Requirement 3: Mostrar cada telefono junto con los datos del cliente.
//
// Pure Mongo. $unwind descompone el array embebido `telefonos` y
// produce una fila por cada telefono, conservando los campos del
// cliente. El $project achata la estructura para que cada fila
// contenga directamente codigo_area, nro_telefono y tipo.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();

        console.log("=== Requirement 3: cada telefono junto con los datos del cliente ===");

        const result = await db.collection('cliente').aggregate([
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

        console.log(`Total telefonos enumerados: ${result.length}\n`);
        console.log("Sample (first 5):");
        console.dir(result.slice(0, 5), { depth: null });
        console.log(`... (showing 5 of ${result.length})`);

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
