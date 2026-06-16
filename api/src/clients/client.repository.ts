import { Injectable } from '@nestjs/common';
import { Int32, type Collection, type Document, type Filter } from 'mongodb';
import { MongoService } from '../mongo/mongo.service';

/**
 * Read shape of a cliente document. Mongo returns its int32 fields as plain JS
 * numbers, so reads are modelled with numbers.
 */
export interface PhoneDoc {
  codigo_area: number;
  nro_telefono: number;
  tipo: string;
}

export interface ClientDoc {
  nro_cliente?: number;
  nombre?: string;
  apellido?: string;
  direccion?: string;
  activo?: number;
  telefonos?: PhoneDoc[];
}

/**
 * Write input for a cliente. Plain numbers; the repository is responsible for
 * the persistence detail of wrapping them in Int32.
 */
export interface ClientWriteInput {
  nro_cliente?: number;
  nombre?: string;
  apellido?: string;
  direccion?: string;
  activo?: number;
  telefonos?: { codigo_area: number; nro_telefono: number; tipo: string }[];
}

/** Projection used by the cross-DB requirements (name-only). */
const NAME_PROJECTION = { _id: 0, nro_cliente: 1, nombre: 1, apellido: 1 };

/**
 * Data-access layer for the `cliente` MongoDB collection. Owns every collection
 * detail (queries, projections, sorting and the Int32 wrapping required by the
 * JSON Schema validator) and returns plain documents. It contains no business
 * rules and throws no HTTP exceptions.
 */
@Injectable()
export class ClientRepository {
  constructor(private readonly mongoService: MongoService) {}

  /** Typed handle for read queries. */
  private get collection(): Collection<ClientDoc> {
    return this.mongoService.getDb().collection<ClientDoc>('cliente');
  }

  /** Untyped handle for writes, which carry Int32 (BSON) values. */
  private get writeCollection(): Collection<Document> {
    return this.mongoService.getDb().collection('cliente');
  }

  /**
   * Converts a numeric write input into a BSON document whose integer fields are
   * Int32, so it passes the collection's `bsonType: "int"` validator.
   */
  private toPersistence(input: ClientWriteInput): Document {
    const doc: Document = {};
    if (input.nro_cliente !== undefined)
      doc.nro_cliente = new Int32(input.nro_cliente);
    if (input.nombre !== undefined) doc.nombre = input.nombre;
    if (input.apellido !== undefined) doc.apellido = input.apellido;
    if (input.direccion !== undefined) doc.direccion = input.direccion;
    if (input.activo !== undefined) doc.activo = new Int32(input.activo);
    if (input.telefonos !== undefined) {
      doc.telefonos = input.telefonos.map((t) => ({
        codigo_area: new Int32(t.codigo_area),
        nro_telefono: new Int32(t.nro_telefono),
        tipo: t.tipo,
      }));
    }
    return doc;
  }

  /** All clients (unsorted), without _id. */
  findAll(): Promise<ClientDoc[]> {
    return this.collection.find({}, { projection: { _id: 0 } }).toArray();
  }

  /** All clients sorted by nro_cliente, without _id. */
  findAllSorted(): Promise<ClientDoc[]> {
    return this.collection
      .find({}, { projection: { _id: 0 } })
      .sort({ nro_cliente: 1 })
      .toArray();
  }

  /** A single client by its number, or null. */
  findByNumber(nroCliente: number): Promise<ClientDoc | null> {
    return this.collection.findOne(
      { nro_cliente: nroCliente },
      { projection: { _id: 0 } },
    );
  }

  /** A client by name + last name, projected to nro_cliente and telefonos. */
  findByName(nombre: string, apellido: string): Promise<ClientDoc | null> {
    return this.collection.findOne(
      { nombre, apellido },
      { projection: { _id: 0, nro_cliente: 1, telefonos: 1 } },
    );
  }

  /** Name-only projection of every client matching the filter, sorted. */
  findProjectedByFilter(filter: Filter<ClientDoc>): Promise<ClientDoc[]> {
    return this.collection
      .find(filter, { projection: NAME_PROJECTION })
      .sort({ nro_cliente: 1 })
      .toArray();
  }

  /** One row per phone with its owner's data (Req 03). */
  eachPhoneWithClient(): Promise<Document[]> {
    return this.collection
      .aggregate([
        { $unwind: '$telefonos' },
        {
          $project: {
            _id: 0,
            clientNumber: '$nro_cliente',
            name: '$nombre',
            lastName: '$apellido',
            address: '$direccion',
            areaCode: '$telefonos.codigo_area',
            phoneNumber: '$telefonos.nro_telefono',
            type: '$telefonos.tipo',
          },
        },
        { $sort: { clientNumber: 1, areaCode: 1 } },
      ])
      .toArray();
  }

  /** Whether a client with that number exists. */
  async exists(nroCliente: number): Promise<boolean> {
    const count = await this.collection.countDocuments(
      { nro_cliente: nroCliente },
      { limit: 1 },
    );
    return count > 0;
  }

  /** Inserts a new client (telefonos defaults to an empty array). */
  async insert(input: ClientWriteInput): Promise<void> {
    const doc = this.toPersistence({
      ...input,
      telefonos: input.telefonos ?? [],
    });
    await this.writeCollection.insertOne(doc);
  }

  /** Updates a client by number; returns the number of matched documents. */
  async updateByNumber(
    nroCliente: number,
    input: ClientWriteInput,
  ): Promise<number> {
    const result = await this.writeCollection.updateOne(
      { nro_cliente: nroCliente },
      { $set: this.toPersistence(input) },
    );
    return result.matchedCount;
  }

  /** Deletes a client by number; returns the number of deleted documents. */
  async deleteByNumber(nroCliente: number): Promise<number> {
    const result = await this.writeCollection.deleteOne({
      nro_cliente: nroCliente,
    });
    return result.deletedCount;
  }
}
