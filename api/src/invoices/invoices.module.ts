import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoiceRepository } from './invoice.repository';
import { ClientsModule } from '../clients/clients.module';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  imports: [PostgresModule, ClientsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceRepository],
  exports: [InvoicesService],
})
export class InvoicesModule {}
