import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../common/domain-errors';
import { ClientRepository } from '../clients/client.repository';
import { InvoiceRepository, type InvoiceRow } from './invoice.repository';

/**
 * Application/use-case layer for facturas. Coordinates the invoice repository
 * (PostgreSQL) with the client repository (MongoDB) for the cross-DB
 * requirement, maps rows to the English API shape, and applies the business
 * rules.
 */
@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  /** Maps a factura row to the English API shape. */
  private mapInvoice(row: InvoiceRow) {
    return {
      invoiceNumber: row.numero_factura,
      issueDate: row.fecha_emision,
      subtotal: row.subtotal,
      vat: row.iva,
      totalWithVat: row.total_con_iva,
      clientNumber: row.nro_cliente,
    };
  }

  /** Req 07: Mongo -> Postgres (invoices of a client resolved by name) */
  async getInvoicesByClientName(name: string, lastName: string) {
    this.logger.log(`Executing Invoices for ${name} ${lastName} (Req 07)`);

    const client = await this.clientRepository.findByName(name, lastName);
    if (!client) {
      throw new NotFoundError(`Client ${name} ${lastName} not found in Mongo`);
    }

    const rows = await this.invoiceRepository.findByClientNumber(
      client.nro_cliente as number,
    );
    return rows.map((row) => this.mapInvoice(row));
  }

  /** Req 09: Invoices with "Ipsum" products */
  async getInvoicesWithIpsumProducts() {
    this.logger.log('Executing Invoices with Ipsum products (Req 09)');
    const rows = await this.invoiceRepository.findWithIpsumBrand();
    return rows.map((row) => ({
      ...this.mapInvoice(row),
      lineNumber: row.nro_renglon,
      quantity: row.cantidad,
      productCode: row.codigo_producto,
      brand: row.marca,
      name: row.nombre,
      description: row.descripcion,
      price: row.precio,
      stock: row.stock,
    }));
  }

  /** Req 11: Invoices by date view */
  async getInvoicesByDate() {
    this.logger.log('Executing Invoices by date view (Req 11)');
    const rows = await this.invoiceRepository.findOrderedByDate();
    return rows.map((row) => this.mapInvoice(row));
  }
}
