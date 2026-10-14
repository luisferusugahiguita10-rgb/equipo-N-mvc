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
    // Orden de las reglas: nombre (R1, R2), peso (R3), nota (R4) y al final la suma de pesos (R5).
    const nombreLimpio = String(nombre ?? '').trim();
    if (nombreLimpio === '') throw new ErrorDeReglas('El nombre es obligatorio.');
    if (nombreLimpio.length > MAX_NOMBRE) {
      throw new ErrorDeReglas(`El nombre no puede superar ${MAX_NOMBRE} caracteres.`);
    }
    if (!Number.isFinite(peso) || peso < 1 || peso > 100) {
      throw new ErrorDeReglas('El peso debe estar entre 1 y 100.');
    }
    const notaValida = this.#validarNota(nota);

    // 5A · Los nombres son únicos (sin importar mayúsculas ni espacios sobrantes).
    const clave = nombreLimpio.toLowerCase();
    if (this.#evaluaciones.some((e) => e.nombre.toLowerCase() === clave)) {
      throw new ErrorDeReglas('Ya existe una evaluación con ese nombre.');
    }

    const total = this.#evaluaciones.reduce((suma, e) => suma + e.peso, 0);
    if (total + peso > 100 + EPS) {
      const quedan = Math.round((100 - total) * 100) / 100;
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${quedan} %).`);
    }

    // El id solo se consume cuando todo salió bien (por eso se incrementa aquí y no antes).
    this.#evaluaciones.push({ id: this.#siguienteId++, nombre: nombreLimpio, peso, nota: notaValida });
    this.#cambio();
  }

  // ---------------------------------------------------------------- 2B · Calificar y eliminar
  calificar(id, nota) {
    const evaluacion = this.#buscar(id);
    evaluacion.nota = this.#validarNota(nota);
    this.#cambio();
  }

  eliminar(id) {
    const evaluacion = this.#buscar(id);
    this.#evaluaciones = this.#evaluaciones.filter((e) => e !== evaluacion);
    this.#cambio();
  }

  // ---------------------------------------------------------------- 2C · Resumen
  resumen() {
    const calificadas = this.#evaluaciones.filter((e) => e.nota !== null);
    const acumulado = calificadas.reduce((suma, e) => suma + (e.peso * e.nota) / 100, 0);
    const pesoCalificado = calificadas.reduce((suma, e) => suma + e.peso, 0);
    const pesoPendiente = 100 - pesoCalificado;

    // Si no queda peso por calificar no existe "nota necesaria" (dividiríamos entre cero).
    const notaNecesaria =
      pesoPendiente > 0
        ? redondearArriba(Math.max(0, (NOTA_MINIMA - acumulado) / (pesoPendiente / 100)))
        : null;

    let estado;
    if (acumulado + EPS >= NOTA_MINIMA) estado = 'aprobado';
    else if (notaNecesaria === null || notaNecesaria > NOTA_MAXIMA) estado = 'imposible';
    else if (notaNecesaria > UMBRAL_RIESGO) estado = 'en-riesgo';
    else estado = 'en-camino';

    return { acumulado, pesoCalificado, pesoPendiente, notaNecesaria, estado };
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    this.#suscriptores.add(suscriptor);
    return () => this.#suscriptores.delete(suscriptor);
  }

  #cambio() {
    this.#almacen.guardar(this.#evaluaciones);
    // Se recorre una copia: si un suscriptor se cancela mientras lo avisamos, no se rompe el ciclo.
    for (const suscriptor of [...this.#suscriptores]) suscriptor();
  }

  // ---------------------------------------------------------------- Ayudas privadas
  /** Devuelve la evaluación con ese id (la original, no una copia) o lanza R6. */
  #buscar(id) {
    const evaluacion = this.#evaluaciones.find((e) => e.id === id);
    if (!evaluacion) throw new ErrorDeReglas('No existe la evaluación.');
    return evaluacion;
  }

  /** R4: la nota puede faltar (null) o ser un número entre 0 y 5. Devuelve la nota normalizada. */
  #validarNota(nota) {
    if (nota === null || nota === undefined) return null;
    if (!Number.isFinite(nota) || nota < 0 || nota > NOTA_MAXIMA) {
      throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
    }
    return nota;
  }
}
