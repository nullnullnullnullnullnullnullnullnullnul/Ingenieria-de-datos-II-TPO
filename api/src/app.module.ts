import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './postgres/postgres.module';
import { MongoModule } from './mongo/mongo.module';
import { RequirementsModule } from './requirements/requirements.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresModule,
    MongoModule,
    RequirementsModule,
    ClientsModule,
    ProductsModule,
    InvoicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
