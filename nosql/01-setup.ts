import { connectMongo, disconnectAll } from './utils/db';

// =====================================================================
// TPO Ingenieria de Datos II - 1er cuatrimestre 2026
// MongoDB setup: create the cliente collection with a JSON Schema
// validator and the required indexes.
//
// The cliente document holds nro_cliente (logical link to PostgreSQL),
// nombre, apellido, direccion, activo, and an embedded telefonos array.
//
// Idempotent: drops the cliente collection if it exists before recreating.
// =====================================================================

async function main() {
    try {
        const db = await connectMongo();

        // === Clean previous state ===
        const collections = await db.listCollections({ name: 'cliente' }).toArray();
        if (collections.length > 0) {
            await db.collection('cliente').drop();
            console.log("Dropped existing 'cliente' collection.");
        }

        // === Create cliente collection with JSON Schema validator ===
        await db.createCollection("cliente", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["nro_cliente", "nombre", "apellido", "direccion", "activo"],
                    additionalProperties: true,
                    properties: {
                        nro_cliente: {
                            bsonType: "int",
                            minimum: 1,
                            description: "Unique client identifier. Referenced by factura.nro_cliente in PostgreSQL."
                        },
                        nombre: {
                            bsonType: "string",
                            minLength: 1,
                            maxLength: 45,
                            description: "Client first name. Matches VARCHAR(45) in the DER."
                        },
                        apellido: {
                            bsonType: "string",
                            minLength: 1,
                            maxLength: 45,
                            description: "Client last name. Matches VARCHAR(45) in the DER."
                        },
                        direccion: {
                            bsonType: "string",
                            maxLength: 45,
                            description: "Client postal address. Matches VARCHAR(45) in the DER."
                        },
                        activo: {
                            bsonType: "int",
                            minimum: 0,
                            maximum: 255,
                            description: "Numeric status matching TINYINT (1 byte, range 0-255) from the DER. Semantics not specified by the dataset."
                        },
                        telefonos: {
                            bsonType: "array",
                            description: "Embedded array of phone subdocuments. May be empty.",
                            items: {
                                bsonType: "object",
                                required: ["codigo_area", "nro_telefono", "tipo"],
                                additionalProperties: false,
                                properties: {
                                    codigo_area: {
                                        bsonType: "int",
                                        minimum: 1,
                                        maximum: 999,
                                        description: "Area code (1 to 3 digits)."
                                    },
                                    nro_telefono: {
                                        bsonType: "int",
                                        minimum: 1,
                                        maximum: 9999999,
                                        description: "Phone number (up to 7 digits)."
                                    },
                                    tipo: {
                                        bsonType: "string",
                                        enum: ["F", "M"],
                                        description: "Phone type. 'F' = fijo, 'M' = movil. Matches the catedra dataset values."
                                    }
                                }
                            }
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        });

        // === Indexes ===
        const clienteCollection = db.collection('cliente');

        await clienteCollection.createIndex(
            { nro_cliente: 1 },
            { unique: true, name: "uq_nro_cliente" }
        );

        await clienteCollection.createIndex(
            { nombre: 1, apellido: 1 },
            { name: "idx_nombre_apellido" }
        );

        await clienteCollection.createIndex(
            { "telefonos.codigo_area": 1, "telefonos.nro_telefono": 1 },
            {
                unique: true,
                name: "uq_telefono",
                partialFilterExpression: { "telefonos.0": { $exists: true } }
            }
        );

        // === Confirmation output ===
        console.log("Collection 'cliente' created with JSON Schema validator.");
        console.log("Indexes:");
        const indexes = await clienteCollection.indexes();
        console.dir(indexes, { depth: null });
        
    } catch (err) {
        console.error("Error setting up MongoDB:", err);
        process.exit(1);
    } finally {
        await disconnectAll();
    }
}

main();
