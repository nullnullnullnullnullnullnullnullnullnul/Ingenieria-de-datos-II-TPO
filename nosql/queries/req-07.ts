import { connectMongo, getPgPool, disconnectAll } from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================================
// Requirement 7: Listar las facturas de "Kai Bullock".
//
// Cross-DB query. The full pipeline:
//   1. Mongo resolves nombre + apellido to nro_cliente.
//   2. SQL fetches every factura row where factura.nro_cliente = :id.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();

        console.log("=== Requirement 7: Facturas de Kai Bullock ===");

        // === Mongo step 1: name -> nro_cliente ===
        const kai = await db.collection('cliente').findOne(
            { nombre: "Kai", apellido: "Bullock" },
            { projection: { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 } }
        );

        if (kai === null) {
            console.log("No cliente named 'Kai Bullock' found in Mongo. Cannot proceed to step 2.");
            return;
        }

        console.log(`Mongo step 1 OK: ${kai.nombre} ${kai.apellido} -> nro_cliente = ${kai.nro_cliente}\n`);

        // === SQL step 2: fetch facturas ===
        console.log("SQL step 2 fetching facturas...");
        const sqlFilePath = path.join(process.cwd(), 'sql/queries/req-07.sql');
        const sqlQuery = await fs.promises.readFile(sqlFilePath, 'utf8');
        
        // El script SQL tiene un $1 para parametrizar
        const pgResult = await pgPool.query(sqlQuery, [kai.nro_cliente]);
        
        console.log(`SQL returned ${pgResult.rows.length} facturas for Kai Bullock:\n`);
        console.table(pgResult.rows);

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
