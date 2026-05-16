// =============================================================================
// req-03.js
// Requerimiento 3: Mostrar cada teléfono junto con los datos del cliente
// =============================================================================

print("Ejecutando Requerimiento 3...");
const resultados = db.cliente.aggregate([
  { $unwind: "$telefonos" }
]).toArray();

printjson(resultados);