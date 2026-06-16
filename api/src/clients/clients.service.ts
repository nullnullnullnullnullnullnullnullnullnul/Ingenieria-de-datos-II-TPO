import { Injectable, Logger } from '@nestjs/common';
import { ConflictError, NotFoundError } from '../common/domain-errors';
import { PostgresService } from '../postgres/postgres.service';
import {
  ClientRepository,
  type ClientDoc,
  type ClientWriteInput,
} from './client.repository';
import { CreateClientDto } from './dto/create-client.dto';

/**
 * Application/use-case layer for clientes. Coordinates the cliente repository
 * (MongoDB) with the SQL side for cross-DB requirements, maps between the
 * Spanish persistence shape and the English API DTOs, and applies the business
 * rules (translating "not found" / "already exists" into HTTP exceptions).
 */
@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly postgresService: PostgresService,
  ) {}

  /** Maps a Spanish cliente document to the English API shape. */
  private mapToEnglish(doc: ClientDoc | null) {
    if (!doc) return null;
    return {
      clientNumber: doc.nro_cliente,
      name: doc.nombre,
      lastName: doc.apellido,
      address: doc.direccion,
      active: doc.activo,
      phones: (doc.telefonos || []).map((t) => ({
        areaCode: t.codigo_area,
        phoneNumber: t.nro_telefono,
        type: t.tipo,
      })),
    };
  }

  /** Maps the name-only projection used by the cross-DB requirements. */
  private mapNameOnly(doc: ClientDoc) {
    return {
      clientNumber: doc.nro_cliente,
      name: doc.nombre,
      lastName: doc.apellido,
    };
  }

  /** Maps a partial English DTO to the Spanish write input (plain numbers). */
  private mapToSpanish(dto: Partial<CreateClientDto>): ClientWriteInput {
    const input: ClientWriteInput = {};
    if (dto.clientNumber !== undefined) input.nro_cliente = dto.clientNumber;
    if (dto.name !== undefined) input.nombre = dto.name;
    if (dto.lastName !== undefined) input.apellido = dto.lastName;
    if (dto.address !== undefined) input.direccion = dto.address;
    if (dto.active !== undefined) input.activo = dto.active;
    if (dto.phones !== undefined) {
      input.telefonos = dto.phones.map((t) => ({
        codigo_area: t.areaCode,
        nro_telefono: t.phoneNumber,
        tipo: t.type,
      }));
    }
    return input;
  }

  /** Reads the distinct nro_cliente values produced by a SQL query file. */
  private async clientNumbersFromSql(sqlPath: string): Promise<number[]> {
    const result = await this.postgresService.runQueryFromFile(sqlPath);
    return result.rows.map((row: { nro_cliente: number }) => row.nro_cliente);
  }

  /**
   * Creates a new client in MongoDB.
   * @param createClientDto The client data to create
   * @returns The created client
   */
  async create(createClientDto: CreateClientDto) {
    if (await this.clientRepository.exists(createClientDto.clientNumber)) {
      throw new ConflictError('clientNumber already exists');
    }
    await this.clientRepository.insert(this.mapToSpanish(createClientDto));
    return this.findOne(createClientDto.clientNumber);
  }

  /**
   * Retrieves all clients from MongoDB.
   * @returns List of all clients
   */
  async findAll() {
    const results = await this.clientRepository.findAll();
    return results.map((doc) => this.mapToEnglish(doc));
  }

  /**
   * Retrieves a single client by their client number.
   * @param clientNumber The client number to search for
   * @returns The found client
   */
  async findOne(clientNumber: number) {
    const cliente = await this.clientRepository.findByNumber(clientNumber);
    if (!cliente) throw new NotFoundError('Client not found');
    return this.mapToEnglish(cliente);
  }

  /**
   * Updates an existing client.
   * @param clientNumber The client number to update
   * @param updateDto The data to update
   * @returns The updated client
   */
  async update(clientNumber: number, updateDto: Partial<CreateClientDto>) {
    const matched = await this.clientRepository.updateByNumber(
      clientNumber,
      this.mapToSpanish(updateDto),
    );
    if (matched === 0) throw new NotFoundError('Client not found');
    return this.findOne(clientNumber);
  }

  /**
   * Deletes a client by their client number.
   * @param clientNumber The client number to delete
   * @returns Object indicating deletion status
   */
  async remove(clientNumber: number) {
    const deleted = await this.clientRepository.deleteByNumber(clientNumber);
    if (deleted === 0) throw new NotFoundError('Client not found');
    return { deleted: true };
  }

  /** Req 01: Datos de los clientes con sus telefonos */
  async getClientsWithPhones() {
    this.logger.log('Executing Clients With Phones (Req 01)');
    const result = await this.clientRepository.findAllSorted();
    return result.map((doc) => this.mapToEnglish(doc));
  }

  /** Req 02: Telefonos y nro de cliente de un cliente dado por nombre y apellido */
  async getPhonesByClientName(name: string, lastName: string) {
    this.logger.log(`Executing Phones for ${name} ${lastName} (Req 02)`);
    const result = await this.clientRepository.findByName(name, lastName);
    if (!result) throw new NotFoundError(`${name} ${lastName} not found`);
    return {
      clientNumber: result.nro_cliente,
      phones: (result.telefonos || []).map((t) => ({
        areaCode: t.codigo_area,
        phoneNumber: t.nro_telefono,
        type: t.tipo,
      })),
    };
  }

  /** Req 03: Cada telefono con datos del cliente */
  async getEachPhoneWithClientData() {
    this.logger.log('Executing Each Phone With Client Data (Req 03)');
    return this.clientRepository.eachPhoneWithClient();
  }

  /** Req 04: Clients WITH invoices */
  async getClientsWithInvoices() {
    this.logger.log('Executing Clients With Invoices (Req 04)');
    const ids = await this.clientNumbersFromSql('sql/queries/req-04.sql');
    const result = await this.clientRepository.findProjectedByFilter({
      nro_cliente: { $in: ids },
    });
    return result.map((client) => this.mapNameOnly(client));
  }

  /** Req 05: Clients WITHOUT invoices */
  async getClientsWithoutInvoices() {
    this.logger.log('Executing Clients Without Invoices (Req 05)');
    const ids = await this.clientNumbersFromSql('sql/queries/req-05.sql');
    const result = await this.clientRepository.findProjectedByFilter({
      nro_cliente: { $nin: ids },
    });
    return result.map((client) => this.mapNameOnly(client));
  }

  /** Req 06: Number of invoices per client (0 for clients with none) */
  async getInvoiceCounts() {
    this.logger.log('Executing Invoice Counts Per Client (Req 06)');
    const sqlResult = await this.postgresService.runQueryFromFile(
      'sql/queries/req-06.sql',
    );
    const sqlData = new Map<number, number>();
    sqlResult.rows.forEach(
      (row: { nro_cliente: number; cantidad_facturas: string | number }) => {
        sqlData.set(row.nro_cliente, Number(row.cantidad_facturas));
      },
    );

    // Req 06 must list every client (including those with zero invoices), so
    // the full collection is intentionally scanned here.
    const clients = await this.clientRepository.findProjectedByFilter({});
    return clients.map((client) => ({
      ...this.mapNameOnly(client),
      invoiceCount: sqlData.get(client.nro_cliente as number) || 0,
    }));
  }

  /** Req 10: Total spent per client (0 for clients with none) */
  async getTotalSpent() {
    this.logger.log('Executing Total Spent Per Client (Req 10)');
    const sqlResult = await this.postgresService.runQueryFromFile(
      'sql/queries/req-10.sql',
    );
    const sqlData = new Map<number, number>();
    sqlResult.rows.forEach(
      (row: { nro_cliente: number; total_gastado: string | number }) => {
        sqlData.set(row.nro_cliente, Number(row.total_gastado));
      },
    );

    const clients = await this.clientRepository.findProjectedByFilter({});
    return clients.map((client) => ({
      ...this.mapNameOnly(client),
      totalSpent: sqlData.get(client.nro_cliente as number) || 0,
    }));
  }
}
