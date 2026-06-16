import { connectMongo, getPgPool, disconnectAll } from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================================
// Requirement 4: Clientes con al menos una factura.
//
// Cross-DB query. The PostgreSQL side returns the DISTINCT set of
// nro_cliente that appear in factura (see sql/queries/req-04.sql). The
// MongoDB side takes that list and enriches each id with nombre and
// apellido.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();

        console.log("=== Requirement 4: Clientes con al menos una factura ===");

        // === SQL side output (real values from sql/queries/req-04.sql) ===
        const sqlFilePath = path.join(process.cwd(), 'sql/queries/req-04.sql');
        const sqlQuery = await fs.promises.readFile(sqlFilePath, 'utf8');
        
        const pgResult = await pgPool.query(sqlQuery);
        const sqlClientesConFactura = pgResult.rows.map(row => row.nro_cliente);

        console.log(`SQL returned ${sqlClientesConFactura.length} nro_clientes with at least one factura.`);

        // === Mongo side: enrich each id with nombre and apellido ===
        const result = await db.collection('cliente').find(
            { nro_cliente: { $in: sqlClientesConFactura } },
            { projection: { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 } }
        ).sort({ nro_cliente: 1 }).toArray();

        console.log(`Mongo enriched ${result.length} clientes (the difference vs SQL count would be missing docs).\n`);
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
