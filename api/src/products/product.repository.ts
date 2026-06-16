import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';

/** Read shape of a producto row (PostgreSQL). */
export interface ProductRow {
  codigo_producto: number;
  marca: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

/** Spanish-column write fields for a producto. */
export interface ProductWriteInput {
  marca?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
}

/**
 * Data-access layer for the `producto` PostgreSQL table. Owns every SQL detail
 * (statements, parameter binding, dynamic UPDATE building and the query files)
 * and returns plain rows. It contains no business rules and throws no HTTP
 * exceptions.
 */
@Injectable()
export class ProductRepository {
  constructor(private readonly postgresService: PostgresService) {}

  /** Inserts a product and returns the created row. */
  async insert(input: Required<ProductWriteInput>): Promise<ProductRow> {
    const query = `
      INSERT INTO producto (marca, nombre, descripcion, precio, stock)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      input.marca,
      input.nombre,
      input.descripcion,
      input.precio,
      input.stock,
    ];
    const result = await this.postgresService.runQuery(query, values);
    return result.rows[0] as ProductRow;
  }

  /** All products, ordered by code. */
  async findAll(): Promise<ProductRow[]> {
    const result = await this.postgresService.runQuery(
      `SELECT * FROM producto ORDER BY codigo_producto ASC;`,
    );
    return result.rows as ProductRow[];
  }

  /** A single product by code, or null. */
  async findByCode(code: number): Promise<ProductRow | null> {
    const result = await this.postgresService.runQuery(
      `SELECT * FROM producto WHERE codigo_producto = $1;`,
      [code],
    );
    return (result.rows[0] as ProductRow | undefined) ?? null;
  }

  /**
   * Updates the provided columns of a product. Returns the updated row, or null
   * if it does not exist. With no fields to update, returns the current row
   * (or null).
   */
  async updateByCode(
    code: number,
    input: ProductWriteInput,
  ): Promise<ProductRow | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.marca !== undefined) {
      updates.push(`marca = $${i++}`);
      values.push(input.marca);
    }
    if (input.nombre !== undefined) {
      updates.push(`nombre = $${i++}`);
      values.push(input.nombre);
    }
    if (input.descripcion !== undefined) {
      updates.push(`descripcion = $${i++}`);
      values.push(input.descripcion);
    }
    if (input.precio !== undefined) {
      updates.push(`precio = $${i++}`);
      values.push(input.precio);
    }
    if (input.stock !== undefined) {
      updates.push(`stock = $${i++}`);
      values.push(input.stock);
    }

    if (updates.length === 0) return this.findByCode(code);

    values.push(code);
    const query = `
      UPDATE producto
      SET ${updates.join(', ')}
      WHERE codigo_producto = $${i}
      RETURNING *;
    `;
    const result = await this.postgresService.runQuery(query, values);
    return (result.rows[0] as ProductRow | undefined) ?? null;
  }

  /** Deletes a product by code; returns whether a row was deleted. */
  async deleteByCode(code: number): Promise<boolean> {
    const result = await this.postgresService.runQuery(
      `DELETE FROM producto WHERE codigo_producto = $1 RETURNING *;`,
      [code],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Products invoiced at least once (Req 08). */
  async findInvoiced(): Promise<ProductRow[]> {
    const result = await this.postgresService.runQueryFromFile(
      'sql/queries/req-08.sql',
    );
    return result.rows as ProductRow[];
  }

  /** Products never invoiced (Req 12). */
  async findUninvoiced(): Promise<ProductRow[]> {
    const result = await this.postgresService.runQueryFromFile(
      'sql/queries/req-12.sql',
    );
    return result.rows as ProductRow[];
  }
}
