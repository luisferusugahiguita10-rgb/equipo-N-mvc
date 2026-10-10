/**
 * MODELO · Notas del semestre                                            (PARTE 2 de la guía)
 *
 * SABE: qué es una evaluación, las reglas (pesos, rangos, nota mínima) y cómo se calcula el resumen.
 * NO SABE: que existe una pantalla, el DOM, localStorage, alert()... Por eso se prueba sin navegador.
 *
 * Se comunica con el resto SIN conocerlo: avisa de sus cambios con el patrón Observer (suscribir).
 *
 * Tu trabajo: reemplazar cada "TODO" por código real hasta que `npm run test:modelo` quede en verde.
 * Las reglas exactas y los mensajes de error están en la guía (Parte 2) y en pruebas/modelo.pruebas.js.
 */

export const NOTA_MINIMA = 3.0; // para aprobar
export const NOTA_MAXIMA = 5.0;
export const UMBRAL_RIESGO = 4.0; // si necesitas más que esto en lo que falta, estás "en riesgo"
export const MAX_NOMBRE = 40;

const EPS = 1e-9; // tolerancia para comparar decimales (0.1 + 0.2 no es exactamente 0.3 en un computador)

/** Error de negocio: su mensaje se puede mostrar tal cual al usuario. */
export class ErrorDeReglas extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeReglas';
  }
}

/** Ayuda ya escrita: redondea hacia ARRIBA (la nota que "necesitas" nunca debe quedarse corta). */
const redondearArriba = (valor, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.ceil(valor * f - EPS) / f;
};

export class NotasModelo {
  #almacen;
  #evaluaciones;
  #siguienteId;
  #suscriptores = new Set();

  // Ya escrito: recibe el almacén (no sabe cuál es), carga lo guardado y calcula el próximo id.
  constructor(almacen) {
    this.#almacen = almacen;
    this.#evaluaciones = almacen.cargar();
    this.#siguienteId = this.#evaluaciones.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  }

  // Ya escrito: devuelve COPIAS, para que nadie cambie el estado interno saltándose las reglas.
  get evaluaciones() {
    return this.#evaluaciones.map((e) => ({ ...e }));
  }

  // ---------------------------------------------------------------- 2A · Agregar y validar
  agregar({ nombre, peso, nota = null }) {
    // TODO 2A: valida, EN ESTE ORDEN: nombre, peso, nota y suma de pesos (mensajes en la guía).
    //          Si todo está bien: crea { id, nombre, peso, nota }, agrégalo y llama a this.#cambio().
    //          Si algo está mal: lanza new ErrorDeReglas('...') SIN cambiar nada.
    throw new Error('TODO 2A · agregar()');
  }

  // ---------------------------------------------------------------- 2B · Calificar y eliminar
  calificar(id, nota) {
    // TODO 2B: la nota puede ser null (quitar) o un número entre 0 y 5. Si el id no existe → ErrorDeReglas.
    throw new Error('TODO 2B · calificar()');
  }

  eliminar(id) {
    // TODO 2B: quita la evaluación. Si el id no existe → ErrorDeReglas.
    throw new Error('TODO 2B · eliminar()');
  }

  // ---------------------------------------------------------------- 2C · Resumen
  resumen() {
    // TODO 2C: devuelve { acumulado, pesoCalificado, pesoPendiente, notaNecesaria, estado }.
    //          Usa NOTA_MINIMA, NOTA_MAXIMA, UMBRAL_RIESGO, EPS y redondearArriba (ya están arriba).
    throw new Error('TODO 2C · resumen()');
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    // TODO 2D: guarda el suscriptor y devuelve una función que lo cancele.
    throw new Error('TODO 2D · suscribir()');
  }

  #cambio() {
    // TODO 2D: después de CADA cambio: guarda en el almacén (this.#almacen.guardar(...)) y avisa a los suscriptores.
  }

  // Puedes agregar aquí los métodos privados que necesites (por ejemplo #buscar(id) o #validarNota(nota)).
}
