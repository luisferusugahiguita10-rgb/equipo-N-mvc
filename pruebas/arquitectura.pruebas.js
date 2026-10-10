// PRUEBAS DE ARQUITECTURA (Partes 3, 4 y 6)
//
// Verifican que cada pieza cumple SU papel en MVC: el Modelo no toca la pantalla, la Vista no decide
// reglas de negocio, el Controlador no arma HTML. En la industria se llaman "fitness functions"
// (funciones de aptitud): reglas de arquitectura que una máquina revisa por ti.
//
//   npm run arquitectura
//
// Son revisiones sencillas sobre el texto del código (sin comentarios). Sirven de guía, no de juez:
// una arquitectura sana no se demuestra solo con que estas pruebas pasen.

import { grupo, prueba, verdadero, leerFuente } from './mini.js';

const SUITE = 'arquitectura';
const g = (nombre, definir) => grupo(nombre, definir, { suite: SUITE });

/** Quita comentarios para no tropezar con palabras que solo aparecen explicando. */
const sinComentarios = (codigo) =>
  codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

async function fuente(ruta) {
  const texto = await leerFuente(ruta);
  verdadero(texto !== null, `No encuentro ${ruta}`);
  return sinComentarios(texto);
}

/** Falla si el código contiene alguno de los patrones prohibidos. */
function sinPatrones(codigo, ruta, patrones) {
  for (const [patron, explicacion] of patrones) {
    verdadero(!patron.test(codigo), `${ruta} no debería contener ${explicacion}`);
  }
}

/** Falla si el código contiene alguno de los patrones (lo que se espera encontrar es lo contrario). */
function conPatron(codigo, ruta, patron, explicacion) {
  verdadero(patron.test(codigo), `${ruta} debería ${explicacion}`);
}

const SIN_PENDIENTES = [[/throw\s+new\s+Error\(\s*['"`]TODO/, 'métodos sin implementar (throw new Error("TODO ..."))']];
const SIN_REGLAS_DE_NOTAS = [
  [/[<>]=?\s*3(\.0)?(?![\w.])/, 'la nota mínima escrita a mano (>= 3): esa regla es del Modelo'],
  [/[<>]=?\s*4(\.0)?(?![\w.])/, 'el umbral de riesgo escrito a mano (> 4): esa regla es del Modelo'],
];
const SIN_REGLAS_DE_PESO = [[/[<>]=?\s*100(?![\w.])/, 'el tope de 100 % escrito a mano: esa regla es del Modelo']];
const SIN_ALMACENAMIENTO = [[/\b(localStorage|sessionStorage|indexedDB)\b/, 'almacenamiento (eso llega por el almacén, dentro del Modelo)']];
const SIN_DOM = [
  [/\bdocument\b/, 'document (el DOM es de la Vista)'],
  [/\bwindow\b/, 'window (el navegador es de la Vista)'],
  [/\b(querySelector(All)?|getElementById|getElementsBy\w+|innerHTML|textContent|classList|addEventListener|createElement)\b/, 'manipulación del DOM'],
  [/\b(alert|confirm|prompt)\s*\(/, 'alert/confirm/prompt (mostrar cosas es de la Vista)'],
];

// ---------------------------------------------------------------------------------------------
g('Modelo puro', () => {
  prueba('modelo.js no usa el DOM ni el navegador', async () => {
    sinPatrones(await fuente('src/modelo.js'), 'modelo.js', SIN_DOM);
  });

  prueba('modelo.js no usa almacenamiento directo (usa el almacén que recibe)', async () => {
    sinPatrones(await fuente('src/modelo.js'), 'modelo.js', SIN_ALMACENAMIENTO);
  });

  prueba('modelo.js no importa la Vista ni el Controlador', async () => {
    sinPatrones(await fuente('src/modelo.js'), 'modelo.js', [
      [/from\s+['"]\.\/(vista|controlador|termometro)/, 'imports de la Vista o del Controlador (el Modelo no los conoce)'],
    ]);
  });

  prueba('modelo.js no deja métodos pendientes', async () => {
    sinPatrones(await fuente('src/modelo.js'), 'modelo.js', SIN_PENDIENTES);
  });
});

// ---------------------------------------------------------------------------------------------
async function vistas() {
  const rutas = ['src/vista.js', 'src/termometro-vista.js'];
  const encontradas = [];
  for (const ruta of rutas) {
    const texto = await leerFuente(ruta);
    if (texto !== null) encontradas.push([ruta, sinComentarios(texto)]);
  }
  return encontradas;
}

g('Vista pasiva', () => {
  prueba('vista.js lee del Modelo y se suscribe a sus cambios', async () => {
    const codigo = await fuente('src/vista.js');
    conPatron(codigo, 'vista.js', /\.suscribir\s*\(/, 'suscribirse al Modelo (modelo.suscribir(...)) para redibujarse sola');
    conPatron(codigo, 'vista.js', /\.(evaluaciones|resumen\s*\()/, 'leer del Modelo (evaluaciones o resumen())');
  });

  prueba('ninguna vista cambia el Modelo (agregar, calificar, eliminar)', async () => {
    for (const [ruta, codigo] of await vistas()) {
      sinPatrones(codigo, ruta, [[/\.(agregar|calificar|eliminar)\s*\(/, 'órdenes al Modelo (eso lo hace el Controlador)']]);
    }
  });

  prueba('ninguna vista decide reglas de negocio ni guarda datos', async () => {
    for (const [ruta, codigo] of await vistas()) {
      sinPatrones(codigo, ruta, [...SIN_REGLAS_DE_NOTAS, ...SIN_ALMACENAMIENTO]);
    }
  });

  prueba('ninguna vista importa el Controlador ni crea otras piezas', async () => {
    for (const [ruta, codigo] of await vistas()) {
      sinPatrones(codigo, ruta, [
        [/from\s+['"]\.\/controlador/, 'import del Controlador'],
        [/new\s+(NotasModelo|NotasControlador|Almacen\w*)\s*\(/, 'crear el Modelo, el Controlador o un almacén (eso es de main.js)'],
      ]);
    }
  });

  prueba('vista.js ofrece los eventos y órdenes que el Controlador necesita', async () => {
    const codigo = await fuente('src/vista.js');
    for (const metodo of ['alAgregar', 'alEliminar', 'alCalificar', 'leerFormulario', 'limpiarFormulario', 'mostrarError', 'limpiarError', 'render']) {
      conPatron(codigo, 'vista.js', new RegExp(`\\b${metodo}\\s*\\(`), `definir ${metodo}()`);
    }
  });
});

// ---------------------------------------------------------------------------------------------
g('Controlador delgado', () => {
  prueba('controlador.js no toca el DOM ni arma HTML', async () => {
    sinPatrones(await fuente('src/controlador.js'), 'controlador.js', SIN_DOM);
  });

  prueba('controlador.js no decide reglas de negocio ni guarda datos', async () => {
    sinPatrones(await fuente('src/controlador.js'), 'controlador.js', [...SIN_REGLAS_DE_NOTAS, ...SIN_REGLAS_DE_PESO, ...SIN_ALMACENAMIENTO]);
  });

  prueba('controlador.js escucha a la Vista y le da órdenes al Modelo', async () => {
    const codigo = await fuente('src/controlador.js');
    for (const evento of ['alAgregar', 'alEliminar', 'alCalificar']) {
      conPatron(codigo, 'controlador.js', new RegExp(`\\.${evento}\\s*\\(`), `registrarse en la Vista con ${evento}(...)`);
    }
    for (const orden of ['agregar', 'eliminar', 'calificar']) {
      conPatron(codigo, 'controlador.js', new RegExp(`\\.${orden}\\s*\\(`), `llamar a ${orden}() del Modelo`);
    }
  });

  prueba('controlador.js muestra los errores de reglas con la Vista', async () => {
    const codigo = await fuente('src/controlador.js');
    conPatron(codigo, 'controlador.js', /ErrorDeReglas/, 'distinguir el ErrorDeReglas del Modelo');
    conPatron(codigo, 'controlador.js', /\.mostrarError\s*\(/, 'pedirle a la Vista que muestre el error (mostrarError)');
  });

  prueba('controlador.js no crea el Modelo ni la Vista (los recibe)', async () => {
    sinPatrones(await fuente('src/controlador.js'), 'controlador.js', [
      [/new\s+(NotasModelo|NotasVista|Almacen\w*)\s*\(/, 'crear el Modelo, la Vista o un almacén (eso es de main.js)'],
    ]);
  });

  prueba('controlador.js no deja métodos pendientes', async () => {
    sinPatrones(await fuente('src/controlador.js'), 'controlador.js', SIN_PENDIENTES);
  });
});
