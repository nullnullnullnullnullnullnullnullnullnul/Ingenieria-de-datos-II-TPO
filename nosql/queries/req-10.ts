import { connectMongo, getPgPool, disconnectAll } from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// =====================================================================
// Requirement 10: Total gastado por cliente con IVA incluido.
//
// Cross-DB query. The PostgreSQL side (sql/queries/req-10.sql) returns
// (nro_cliente, SUM(total_con_iva)) for each cliente that has at
// least one factura. The MongoDB side enriches each id with nombre
// and apellido to produce the final "Nombre Apellido + total" output.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();
        const pgPool = getPgPool();

        console.log("=== Requirement 10: Total gastado por cliente con IVA ===");

        // === SQL side output ===
        const sqlFilePath = path.join(process.cwd(), 'sql/queries/req-10.sql');
        const sqlQuery = await fs.promises.readFile(sqlFilePath, 'utf8');

        const pgResult = await pgPool.query(sqlQuery);
        console.log(`SQL returned ${pgResult.rows.length} (nro_cliente, total_gastado) pairs.`);

        // === Build lookup table by nro_cliente ===
        const totalById: Record<number, number> = {};
        for (const row of pgResult.rows) {
            totalById[row.nro_cliente] = parseFloat(row.total_gastado);
        }
        const ids = pgResult.rows.map(r => r.nro_cliente);

        // === Mongo side: enrich each id with nombre and apellido ===
        const mongoDocs = (await db.collection('cliente').find(
            { nro_cliente: { $in: ids } },
            { projection: { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 } }
        ).sort({ nro_cliente: 1 }).toArray()) as any[];

        const result = mongoDocs.map(c => ({
            ...c,
            total_gastado: totalById[c.nro_cliente] || 0
        }));

        console.log(`Mongo enriched ${result.length} clientes.\n`);

        console.log("Sample with non-zero totals (first 5):");
        result.filter(r => r.total_gastado > 0).slice(0, 5).forEach(d =>
            console.log(`  ${d.nombre} ${d.apellido} (cliente ${d.nro_cliente}): $${d.total_gastado.toFixed(2)}`)
        );
        console.log(`\nClientes with total_gastado = 0 (zero-total facturas in the seed): ${result.filter(r => r.total_gastado === 0).length}`);

    } catch (err) {
        console.error("Error executing query:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
