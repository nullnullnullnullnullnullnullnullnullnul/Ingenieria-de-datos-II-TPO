import { connectMongo, getPgPool, disconnectAll } from './utils/db';
import { Int32 } from 'mongodb';

// =====================================================================
// CRUD de cliente (Requerimiento 13).
//
// Demuestra las 4 operaciones (Create, Read, Update, Delete) sobre la
// coleccion cliente. La operacion de delete sigue el patron cross-DB
// documentado en docs/justificacion-poliglota.md: physical delete en
// MongoDB con pre-check de integridad en PostgreSQL.
//
// Idempotente: limpia cualquier residuo del cliente de prueba antes
// de empezar, y al final remueve fisicamente el cliente de prueba.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();
        const clienteColl = db.collection('cliente');

        const TEST_NRO_CLIENTE = new Int32(1000);

        // === Idempotency: clean any residue from a previous run ===
        await clienteColl.deleteOne({ nro_cliente: TEST_NRO_CLIENTE });

        // === 1. CREATE ===
        await clienteColl.insertOne({
            nro_cliente: TEST_NRO_CLIENTE,
            nombre: "Gaspar",
            apellido: "Ginter",
            direccion: "General Paz 4534",
            activo: new Int32(1),
            telefonos: [
                { codigo_area: new Int32(228), nro_telefono: new Int32(4499770), tipo: "M" }
            ]
        });
        console.log("CREATE: cliente 1000 insertado.");

        // === 2. READ ===
        console.log("READ: estado del cliente recien creado:");
        const doc = await clienteColl.findOne({ nro_cliente: TEST_NRO_CLIENTE });
        console.dir(doc, { depth: null });

        // === 3. UPDATE ===
        await clienteColl.updateOne(
            { nro_cliente: TEST_NRO_CLIENTE },
            { $set: { direccion: "Pasco 1005" } }
        );
        console.log("UPDATE: direccion modificada a 'Pasco 1005'.");

        // === 4. DELETE con pre-check cross-motor ===
        // Ejecuta COUNT en Postgres para asegurar integridad referencial
        const pgResult = await pgPool.query(
            'SELECT COUNT(*) as count FROM factura WHERE nro_cliente = $1',
            [1000]
        );
        const facturasAsociadas = parseInt(pgResult.rows[0].count, 10);

        if (facturasAsociadas > 0) {
            console.log(`DELETE: rechazado. El cliente tiene ${facturasAsociadas} factura(s) asociada(s) en PostgreSQL.`);
        } else {
            await clienteColl.deleteOne({ nro_cliente: TEST_NRO_CLIENTE });
            console.log(`DELETE: cliente 1000 removido fisicamente (pre-check pass, count = ${facturasAsociadas}).`);
        }

        // === Verification ===
        const finalDoc = await clienteColl.findOne({ nro_cliente: TEST_NRO_CLIENTE });
        console.log(`Final state: ${finalDoc === null ? "cliente 1000 no existe en la coleccion (OK)" : "ERROR: cliente todavia presente"}`);

    } catch (err) {
        console.error("Error in CRUD Operations:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
