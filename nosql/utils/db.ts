import { MongoClient, Db } from 'mongodb';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the root .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

let mongoClient: MongoClient | null = null;
let pgPool: Pool | null = null;

export async function connectMongo(): Promise<Db> {
    if (!mongoClient) {
        const host = process.env.MONGO_HOST || 'localhost';
        const port = process.env.MONGO_PORT || 27017;
        const dbName = process.env.MONGO_DATABASE || 'tpo_facturacion';
        const uri = `mongodb://${host}:${port}/${dbName}`;
        
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
    }
    const dbName = process.env.MONGO_DATABASE || 'tpo_facturacion';
    return mongoClient.db(dbName);
}

export function getPgPool(): Pool {
    if (!pgPool) {
        pgPool = new Pool({
            user: process.env.PG_USER || 'tpo',
            host: process.env.PG_HOST || 'localhost',
            database: process.env.PG_DATABASE || 'tpo_facturacion',
            password: process.env.PG_PASSWORD || 'tpo',
            port: Number(process.env.PG_PORT) || 5432,
        });
    }
    return pgPool;
}

export async function disconnectAll() {
    if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
    }
    if (pgPool) {
        await pgPool.end();
        pgPool = null;
    }
}
