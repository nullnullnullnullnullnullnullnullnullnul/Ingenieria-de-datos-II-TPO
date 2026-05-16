// =============================================================================
// 03-crud-cliente.js
// CRUD de clientes (Requerimiento 13).
// Coordina baja lógica para preservar integridad con PostgreSQL.
// =============================================================================

// 1. CREATE
db.cliente.insertOne({
  nro_cliente: NumberInt(1000), 
  nombre: "Gaspar",
  apellido: "Ginter",
  direccion: "General Paz 4534",
  activo: NumberInt(1), // Using integer to respect the JSON Schema (TINYINT)
  telefonos: [
    { codigo_area: NumberInt(2284), nro_telefono: NumberInt(499770), tipo: "M" }
  ]
});

print("Cliente creado. Buscando...");

// 2. READ
printjson(db.cliente.findOne({ nro_cliente: NumberInt(1000) }));

// 3. UPDATE
db.cliente.updateOne(
  { nro_cliente: NumberInt(1000) },
  { $set: { direccion: "Pasco 1005" } }
);

print("Cliente actualizado. Aplicando baja lógica...");

// 4. DELETE (Logical delete: setting 'activo' to 0)
db.cliente.updateOne(
  { nro_cliente: NumberInt(1000) },
  { $set: { activo: NumberInt(0) } } 
);

print("Estado final del cliente (activo = 0):");
printjson(db.cliente.findOne({ nro_cliente: NumberInt(1000) }));