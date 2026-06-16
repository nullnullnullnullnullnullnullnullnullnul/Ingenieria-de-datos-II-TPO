import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Service for interacting with the PostgreSQL database.
 * Manages connection pooling and query execution.
 */
@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(PostgresService.name);
  // Caches SQL file contents by path so each query file is read from disk once,
  // not on every request.
  private readonly sqlCache = new Map<string, string>();

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.get<string>('PG_USER', 'tpo'),
      host: this.configService.get<string>('PG_HOST', 'localhost'),
      database: this.configService.get<string>(
        'PG_DATABASE',
        'tpo_facturacion',
      ),
      password: this.configService.get<string>('PG_PASSWORD', 'tpo'),
      port: Number(this.configService.get<string>('PG_PORT', '5432')),
    });
  }

  async onModuleInit() {
    try {
      // Acquire a client just to verify connectivity, then release it back to
      // the pool so the startup check does not leak a connection.
      const client = await this.pool.connect();
      client.release();
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * Executes a SQL query against the PostgreSQL database.
   * @param query The SQL query string
   * @param params Optional array of parameters
   * @returns The query result
   */
  async runQuery(query: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(query, params);
  }

  /**
   * Reads a SQL query from a file (memoized) and executes it.
   * @param sqlRelativePath Relative path to the SQL file
   * @param params Optional array of parameters
   * @returns The query result
   */
  async runQueryFromFile(
    sqlRelativePath: string,
    params?: any[],
  ): Promise<QueryResult> {
    let query = this.sqlCache.get(sqlRelativePath);
    if (query === undefined) {
      const filePath = path.join(process.cwd(), '..', sqlRelativePath);
      query = await fs.readFile(filePath, 'utf-8');
      this.sqlCache.set(sqlRelativePath, query);
    }
    return this.runQuery(query, params);
  }
}
