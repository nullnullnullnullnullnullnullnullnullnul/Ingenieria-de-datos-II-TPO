// =====================================================================
// TPO Ingenieria de Datos II - 1er cuatrimestre 2026
// MongoDB setup: create the cliente collection with a JSON Schema
// validator and the required indexes.
//
// The cliente document holds nro_cliente (logical link to PostgreSQL),
// nombre, apellido, direccion, activo, and an embedded telefonos array.
// Full schema description: nosql/README.md.
//
// Idempotent: drops the cliente collection if it exists before recreating.
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file 01-setup.js
// =====================================================================

// === Clean previous state ===
db.cliente.drop();

// === Create cliente collection with JSON Schema validator ===
db.createCollection("cliente", {
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

// uq_nro_cliente: app accesses cliente by nro_cliente when enriching SQL
// results (reqs 4, 5, 6, 7, 10) and on CRUD (req 13). Unique guarantees
// the logical 1:1 link with factura.nro_cliente in PostgreSQL.
db.cliente.createIndex(
    { nro_cliente: 1 },
    { unique: true, name: "uq_nro_cliente" }
);

// idx_nombre_apellido: filter by full name in req 2 ("Jacob Cooper") and
// req 7 ("Kai Bullock"). Without this index those queries do a full
// collection scan.
db.cliente.createIndex(
    { nombre: 1, apellido: 1 },
    { name: "idx_nombre_apellido" }
);

// uq_telefono: replicates the composite primary key of E01_TELEFONO in
// the DER. As a multikey unique index it prevents the same
// (codigo_area, nro_telefono) pair from appearing inside two different
// cliente documents.
db.cliente.createIndex(
    { "telefonos.codigo_area": 1, "telefonos.nro_telefono": 1 },
    { unique: true, name: "uq_telefono" }
);

// === Confirmation output ===
print("Collection 'cliente' created with JSON Schema validator.");
print("Indexes:");
db.cliente.getIndexes().forEach(idx => printjson(idx));
