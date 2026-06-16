import { connectMongo, getPgPool, disconnectAll } from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================================
// Requirement 6: Clientes con cantidad de facturas (0 si no tienen).
//
// Cross-DB query. The PostgreSQL side returns (nro_cliente, COUNT(*)) for
// each cliente that has at least one factura (see sql/queries/req-06.sql).
// The MongoDB side merges that with the full cliente set, defaulting
// cantidad to 0 for clientes absent from the SQL result.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();

        console.log("=== Requirement 6: Clientes con cantidad de facturas ===");

        // === SQL side output (real values from sql/queries/req-06.sql) ===
        const sqlFilePath = path.join(process.cwd(), 'sql/queries/req-06.sql');
        const sqlQuery = await fs.promises.readFile(sqlFilePath, 'utf8');
        
        const pgResult = await pgPool.query(sqlQuery);
        console.log(`SQL returned ${pgResult.rows.length} (nro_cliente, cantidad) pairs.`);

        // === Build lookup table by nro_cliente ===
        const countById: Record<number, number> = {};
        for (const row of pgResult.rows) {
            countById[row.nro_cliente] = parseInt(row.cantidad_facturas, 10);
        }

        // === Mongo side: iterate ALL clientes, attach cantidad (default 0) ===
        const mongoDocs = await db.collection('cliente').find(
            {},
            { projection: { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 } }
        ).sort({ nro_cliente: 1 }).toArray();

        const result = mongoDocs.map(c => ({
            ...c,
            cantidad: countById[c.nro_cliente] || 0
        }));

        console.log(`Total clientes in final result: ${result.length}\n`);
        
        const zeros = result.filter(r => r.cantidad === 0);
        console.log("Clientes con cantidad = 0 (no facturas):");
        console.dir(zeros, { depth: null });
        
        const nonZeros = result.filter(r => r.cantidad > 0);
        console.log("\nSample with facturas (first 5):");
        console.dir(nonZeros.slice(0, 5), { depth: null });

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
