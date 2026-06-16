import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../common/domain-errors';
import {
  ProductRepository,
  type ProductRow,
  type ProductWriteInput,
} from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';

/**
 * Application/use-case layer for productos. Coordinates the product repository
 * (PostgreSQL), maps between the Spanish row shape and the English API DTOs, and
 * applies the business rules (translating "not found" into HTTP exceptions).
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  /** Maps a PostgreSQL product row to the English API shape. */
  private mapToEnglish(row: ProductRow | null) {
    if (!row) return null;
    return {
      productCode: row.codigo_producto,
      brand: row.marca,
      name: row.nombre,
      description: row.descripcion,
      price: row.precio,
      stock: row.stock,
    };
  }

  /** Maps a partial English DTO to the Spanish write fields. */
  private mapToSpanish(dto: Partial<CreateProductDto>): ProductWriteInput {
    const input: ProductWriteInput = {};
    if (dto.brand !== undefined) input.marca = dto.brand;
    if (dto.name !== undefined) input.nombre = dto.name;
    if (dto.description !== undefined) input.descripcion = dto.description;
    if (dto.price !== undefined) input.precio = dto.price;
    if (dto.stock !== undefined) input.stock = dto.stock;
    return input;
  }

  /**
   * Creates a new product in PostgreSQL.
   * @param dto The product data to create
   * @returns The created product
   */
  async create(dto: CreateProductDto) {
    const row = await this.productRepository.insert({
      marca: dto.brand,
      nombre: dto.name,
      descripcion: dto.description,
      precio: dto.price,
      stock: dto.stock,
    });
    return this.mapToEnglish(row);
  }

  /**
   * Retrieves all products from PostgreSQL.
   * @returns List of all products
   */
  async findAll() {
    const rows = await this.productRepository.findAll();
    return rows.map((row) => this.mapToEnglish(row));
  }

  /**
   * Retrieves a single product by its product code.
   * @param id The product code to search for
   * @returns The found product
   */
  async findOne(id: number) {
    const row = await this.productRepository.findByCode(id);
    if (!row) throw new NotFoundError('Product not found');
    return this.mapToEnglish(row);
  }

  /**
   * Updates an existing product.
   * @param id The product code to update
   * @param dto The data to update
   * @returns The updated product
   */
  async update(id: number, dto: Partial<CreateProductDto>) {
    const row = await this.productRepository.updateByCode(
      id,
      this.mapToSpanish(dto),
    );
    if (!row) throw new NotFoundError('Product not found');
    return this.mapToEnglish(row);
  }

  /**
   * Deletes a product by its product code.
   * @param id The product code to delete
   * @returns Object indicating deletion status
   */
  async remove(id: number) {
    const deleted = await this.productRepository.deleteByCode(id);
    if (!deleted) throw new NotFoundError('Product not found');
    return { deleted: true };
  }

  /** Req 08: Products invoiced at least once */
  async getInvoicedProducts() {
    this.logger.log('Executing Invoiced Products (Req 08)');
    const rows = await this.productRepository.findInvoiced();
    return rows.map((row) => this.mapToEnglish(row));
  }

  /** Req 12: Uninvoiced products view */
  async getUninvoicedProducts() {
    this.logger.log('Executing Uninvoiced Products (Req 12)');
    const rows = await this.productRepository.findUninvoiced();
    return rows.map((row) => this.mapToEnglish(row));
  }
}
