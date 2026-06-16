import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';

/** Read shape of a factura row (PostgreSQL). */
export interface InvoiceRow {
  numero_factura: number;
  fecha_emision: Date;
  subtotal: number;
  iva: number;
  total_con_iva: number;
  nro_cliente: number;
}

/** A factura row joined with one detalle line and its producto. */
export interface InvoiceDetailRow extends InvoiceRow {
  nro_renglon: number;
  cantidad: number;
  codigo_producto: number;
  marca: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

/**
 * Data-access layer for facturas (PostgreSQL). Owns the invoice query files and
 * returns plain rows. It contains no business rules and throws no HTTP
 * exceptions.
 */
@Injectable()
export class InvoiceRepository {
  constructor(private readonly postgresService: PostgresService) {}

  /** Invoices of a given client number (Req 07). */
  async findByClientNumber(nroCliente: number): Promise<InvoiceRow[]> {
    const result = await this.postgresService.runQueryFromFile(
      'sql/queries/req-07.sql',
      [nroCliente],
    );
    return result.rows as InvoiceRow[];
  }

  /** Invoices containing products whose brand matches "Ipsum" (Req 09). */
  async findWithIpsumBrand(): Promise<InvoiceDetailRow[]> {
    const result = await this.postgresService.runQueryFromFile(
      'sql/queries/req-09.sql',
    );
    return result.rows as InvoiceDetailRow[];
  }

  /** Invoices ordered by date, via the view (Req 11). */
  async findOrderedByDate(): Promise<InvoiceRow[]> {
    const result = await this.postgresService.runQueryFromFile(
      'sql/queries/req-11.sql',
    );
    return result.rows as InvoiceRow[];
  }
}
