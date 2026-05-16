// =====================================================================
// CRUD de cliente (Requerimiento 13).
//
// Demuestra las 4 operaciones (Create, Read, Update, Delete) sobre la
// coleccion cliente. La operacion de delete sigue el patron cross-DB
// documentado en docs/justificacion-poliglota.md: physical delete en
// MongoDB con pre-check de integridad en PostgreSQL. La app consulta
// "SELECT COUNT(*) FROM factura WHERE nro_cliente = :id"; si el count
// es mayor a 0 la operacion se rechaza, si es 0 se procede al
// deleteOne. Esto evita referencias huerfanas en factura.nro_cliente.
//
// STANDALONE vs PRODUCTION:
//   - Standalone (este archivo via mongosh): el pre-check SQL se
//     simula con count = 0 hardcodeado. Es correcto porque el cliente
//     de prueba (nro_cliente = 1000) nunca aparece en el seed SQL
//     (sql/02-seed.sql solo asigna nro_cliente del 1 al 100 en
//     factura), asi que la consulta real devolveria 0.
//   - Production (futura API en api/): el handler corre el SELECT
//     COUNT real contra PostgreSQL y solo procede al deleteOne si el
//     count es 0. La logica Mongo (insertOne, findOne, updateOne,
//     deleteOne) no cambia.
//
// Idempotente: limpia cualquier residuo del cliente de prueba antes
// de empezar, y al final remueve fisicamente el cliente de prueba.
// Esto permite re-correr el archivo sin error y mantiene la
// coleccion en su tamano original (100 documentos) para que las
// asserciones de CI sigan pasando.
//
// Run with:
//   mongosh "mongodb://localhost:27017/tpo_facturacion" --file 03-crud-cliente.js
// =====================================================================

db = db.getSiblingDB("tpo_facturacion");

const TEST_NRO_CLIENTE = NumberInt(1000);

// === Idempotency: clean any residue from a previous run ===
db.cliente.deleteOne({ nro_cliente: TEST_NRO_CLIENTE });

// === 1. CREATE ===
db.cliente.insertOne({
    nro_cliente: TEST_NRO_CLIENTE,
    nombre: "Gaspar",
    apellido: "Ginter",
    direccion: "General Paz 4534",
    activo: NumberInt(1),
    telefonos: [
        // codigo_area must be in [1, 999] per the JSON Schema validator
        // (DER specifies 1 to 3 digits for area code).
        { codigo_area: NumberInt(228), nro_telefono: NumberInt(4499770), tipo: "M" }
    ]
});
print("CREATE: cliente 1000 insertado.");

// === 2. READ ===
print("READ: estado del cliente recien creado:");
printjson(db.cliente.findOne({ nro_cliente: TEST_NRO_CLIENTE }));

// === 3. UPDATE ===
db.cliente.updateOne(
    { nro_cliente: TEST_NRO_CLIENTE },
    { $set: { direccion: "Pasco 1005" } }
);
print("UPDATE: direccion modificada a 'Pasco 1005'.");

// === 4. DELETE con pre-check cross-motor ===
//
// En production, este COUNT lo ejecuta la app contra PostgreSQL. En
// standalone lo simulamos con 0 (ver header).
const facturasAsociadas = 0;  // SELECT COUNT(*) FROM factura WHERE nro_cliente = 1000

if (facturasAsociadas > 0) {
    print(`DELETE: rechazado. El cliente tiene ${facturasAsociadas} factura(s) asociada(s) en PostgreSQL.`);
} else {
    db.cliente.deleteOne({ nro_cliente: TEST_NRO_CLIENTE });
    print("DELETE: cliente 1000 removido fisicamente (pre-check pass, count = 0).");
}

// === Verification ===
const final = db.cliente.findOne({ nro_cliente: TEST_NRO_CLIENTE });
print(`Final state: ${final === null ? "cliente 1000 no existe en la coleccion (OK)" : "ERROR: cliente todavia presente"}`);
