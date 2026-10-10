// Un mini marco de pruebas, a propósito sencillo, que funciona igual en Node y en el navegador.
// No necesitas leerlo ni modificarlo: lo usan modelo.pruebas.js y arquitectura.pruebas.js.

const grupos = [];
let grupoActual = null;

/** Agrupa pruebas relacionadas. Con { extension: true } el grupo corresponde a la Parte 5. */
export function grupo(nombre, definir, opciones = {}) {
  grupoActual = { nombre, pruebas: [], extension: Boolean(opciones.extension), suite: opciones.suite ?? '' };
  grupos.push(grupoActual);
  definir();
  grupoActual = null;
}

export function prueba(nombre, cuerpo) {
  grupoActual.pruebas.push({ nombre, cuerpo });
}

export class FalloDePrueba extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'FalloDePrueba';
  }
}

const mostrar = (valor) => (typeof valor === 'string' ? JSON.stringify(valor) : JSON.stringify(valor) ?? String(valor));

export function verdadero(valor, mensaje = 'Se esperaba un valor verdadero') {
  if (!valor) throw new FalloDePrueba(mensaje);
}

export function igual(real, esperado, mensaje = 'Los valores no coinciden') {
  if (!Object.is(real, esperado)) {
    throw new FalloDePrueba(`${mensaje}\n      esperado: ${mostrar(esperado)}\n      recibido: ${mostrar(real)}`);
  }
}

// JSON con las claves ordenadas: {a:1,b:2} y {b:2,a:1} se consideran iguales.
const canonico = (valor) =>
  JSON.stringify(valor, (_clave, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => x.localeCompare(y)))
      : v,
  );

export function igualJSON(real, esperado, mensaje = 'Los objetos no coinciden') {
  const a = canonico(real);
  const b = canonico(esperado);
  if (a !== b) throw new FalloDePrueba(`${mensaje}\n      esperado: ${b}\n      recibido: ${a}`);
}

export function cercaDe(real, esperado, tolerancia = 1e-9, mensaje = 'Los números no son (casi) iguales') {
  if (typeof real !== 'number' || Number.isNaN(real) || Math.abs(real - esperado) > tolerancia) {
    throw new FalloDePrueba(`${mensaje}\n      esperado: ${esperado}\n      recibido: ${mostrar(real)}`);
  }
}

/** Comprueba que el cuerpo lance un ErrorDeReglas (y, si se indica, con ese mensaje exacto). */
export function lanzaReglas(cuerpo, mensajeEsperado) {
  try {
    cuerpo();
  } catch (error) {
    if (error?.name !== 'ErrorDeReglas') {
      throw new FalloDePrueba(`Se esperaba un ErrorDeReglas y se lanzó: ${error?.name ?? 'algo'}: ${error?.message ?? error}`);
    }
    if (mensajeEsperado !== undefined && error.message !== mensajeEsperado) {
      throw new FalloDePrueba(`El mensaje del error no coincide\n      esperado: "${mensajeEsperado}"\n      recibido: "${error.message}"`);
    }
    return;
  }
  throw new FalloDePrueba('Se esperaba que lanzara un ErrorDeReglas, pero no lanzó nada');
}

const ES_NODE = typeof process !== 'undefined' && Boolean(process.versions?.node);

/** Lee el código fuente de un archivo del proyecto (ruta desde la raíz, ej. "src/modelo.js"). Devuelve null si no existe. */
export async function leerFuente(rutaDesdeRaiz) {
  const url = new URL(`../${rutaDesdeRaiz}`, import.meta.url);
  if (ES_NODE) {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    try {
      return await readFile(fileURLToPath(url), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }
  const respuesta = await fetch(url);
  return respuesta.ok ? respuesta.text() : null;
}

/** Ejecuta todos los grupos registrados. Devuelve los resultados; no imprime nada. */
export async function ejecutar({ suite } = {}) {
  const resultado = { grupos: [], total: 0, pasan: 0, fallan: 0 };
  for (const g of grupos) {
    if (suite && g.suite !== suite) continue;
    const resultados = [];
    for (const p of g.pruebas) {
      try {
        await p.cuerpo();
        resultados.push({ nombre: p.nombre, ok: true });
      } catch (error) {
        resultados.push({ nombre: p.nombre, ok: false, mensaje: error?.message ?? String(error) });
      }
    }
    const pasan = resultados.filter((r) => r.ok).length;
    resultado.grupos.push({ nombre: g.nombre, suite: g.suite, extension: g.extension, resultados, pasan });
    resultado.total += resultados.length;
    resultado.pasan += pasan;
    resultado.fallan += resultados.length - pasan;
  }
  return resultado;
}
