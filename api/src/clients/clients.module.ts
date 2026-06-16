import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientRepository } from './client.repository';
import { MongoModule } from '../mongo/mongo.module';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  imports: [MongoModule, PostgresModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientRepository],
  exports: [ClientsService, ClientRepository],
})
export class ClientsModule {}
