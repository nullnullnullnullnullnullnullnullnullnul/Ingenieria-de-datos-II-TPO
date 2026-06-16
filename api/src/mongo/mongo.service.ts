import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';

/**
 * Service for interacting with the MongoDB database.
 * Manages the connection and provides access to the Db instance.
 */
@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly dbName: string;
  private readonly logger = new Logger(MongoService.name);

  constructor(private configService: ConfigService) {
    // Build the connection from the same MONGO_HOST/PORT/DATABASE variables
    // documented in .env.example and used by nosql/utils/db.ts. MONGO_URI is
    // honoured as an optional override (e.g. for replica sets / Atlas).
    const host = this.configService.get<string>('MONGO_HOST', 'localhost');
    const port = this.configService.get<string>('MONGO_PORT', '27017');
    this.dbName = this.configService.get<string>(
      'MONGO_DATABASE',
      'tpo_facturacion',
    );
    const uri =
      this.configService.get<string>('MONGO_URI') ??
      `mongodb://${host}:${port}/${this.dbName}`;
    this.client = new MongoClient(uri);
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.logger.log('Connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  /**
   * Gets the MongoDB Db instance.
   * @returns The active MongoDB database instance
   */
  getDb(): Db {
    return this.db;
  }
}
