// ALMACÉN: dónde se guardan las evaluaciones.
//
// El Modelo no sabe si los datos viven en memoria, en localStorage o en un servidor:
// solo exige que el almacén tenga estos dos métodos (un "contrato"):
//
//     cargar()              → devuelve la lista de evaluaciones guardadas
//     guardar(evaluaciones) → reemplaza lo guardado por esta lista
//
// Cualquier clase con esos dos métodos sirve. En la Parte 5C crearás una más.

/** Guarda en memoria: se pierde al recargar la página. Ideal para las pruebas. */
export class AlmacenMemoria {
  #datos;

  constructor(datosIniciales = []) {
    this.#datos = structuredClone(datosIniciales);
  }

  cargar() {
    return structuredClone(this.#datos);
  }

  guardar(evaluaciones) {
    this.#datos = structuredClone(evaluaciones);
  }
}

/** Guarda en localStorage del navegador: sobrevive a las recargas. */
export class AlmacenLocal {
  #clave;

  constructor(clave = 'notas.v1') {
    this.#clave = clave;
  }

  cargar() {
    try {
      return JSON.parse(localStorage.getItem(this.#clave) ?? '[]');
    } catch {
      return [];
    }
  }

  guardar(evaluaciones) {
    localStorage.setItem(this.#clave, JSON.stringify(evaluaciones));
  }
}
