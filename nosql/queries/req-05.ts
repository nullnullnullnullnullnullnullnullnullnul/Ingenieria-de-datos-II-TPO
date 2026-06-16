import { connectMongo, getPgPool, disconnectAll } from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================================
// Requirement 5: Clientes sin facturas.
//
// Cross-DB query. The PostgreSQL side (sql/queries/req-05.sql) returns
// the DISTINCT nro_cliente that DO appear in factura (same set as
// req-04, by design). The MongoDB side computes the complement: every
// cliente in the collection whose nro_cliente is NOT in that set,
// using $nin.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();

        console.log("=== Requirement 5: Clientes sin facturas ===");

        // === SQL side output (real values from sql/queries/req-05.sql) ===
        const sqlFilePath = path.join(process.cwd(), 'sql/queries/req-05.sql');
        const sqlQuery = await fs.promises.readFile(sqlFilePath, 'utf8');
        
        const pgResult = await pgPool.query(sqlQuery);
        const sqlClientesConFactura = pgResult.rows.map(row => row.nro_cliente);

        console.log(`SQL returned ${sqlClientesConFactura.length} clientes that DO have facturas.`);

        // === Mongo side: complement via $nin ===
        const result = await db.collection('cliente').find(
            { nro_cliente: { $nin: sqlClientesConFactura } },
            { projection: { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1, direccion: 1 } }
        ).sort({ nro_cliente: 1 }).toArray();

        console.log(`Mongo found ${result.length} clientes WITHOUT facturas:\n`);
        console.dir(result, { depth: null });

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
