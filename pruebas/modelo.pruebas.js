// PRUEBAS DEL MODELO (Parte 2)
//
// Estas pruebas SON la especificación del Modelo: leerlas es la mejor guía para escribirlo.
// Corren sin navegador porque el Modelo no sabe nada de pantallas.
//
//   npm run test:modelo          (en la terminal)
//   http://localhost:3000/pruebas/pruebas.html   (en el navegador, con npm start)

import { grupo, prueba, verdadero, igual, igualJSON, cercaDe, lanzaReglas } from './mini.js';
import { NotasModelo } from '../src/modelo.js';
import { AlmacenMemoria } from '../src/almacen.js';

const SUITE = 'modelo';
const g = (nombre, definir, opciones) => grupo(nombre, definir, { suite: SUITE, ...opciones });

/** Un Modelo nuevo con un almacén en memoria (así cada prueba parte limpia). */
function crear(datosIniciales = []) {
  const almacen = new AlmacenMemoria(datosIniciales);
  return { almacen, modelo: new NotasModelo(almacen) };
}

/** Atajo: agrega varias evaluaciones de una vez. */
function conEvaluaciones(...evaluaciones) {
  const contexto = crear();
  for (const e of evaluaciones) contexto.modelo.agregar(e);
  return contexto;
}

// ---------------------------------------------------------------------------------------------
g('A · Agregar y validar', () => {
  prueba('agregar guarda la evaluación y le asigna un id', () => {
    const { modelo } = crear();
    modelo.agregar({ nombre: 'Parcial 1', peso: 30, nota: 3.5 });
    igual(modelo.evaluaciones.length, 1);
    igualJSON(modelo.evaluaciones[0], { id: 1, nombre: 'Parcial 1', peso: 30, nota: 3.5 });
  });

  prueba('la nota es opcional: sin nota queda en null', () => {
    const { modelo } = crear();
    modelo.agregar({ nombre: 'Final', peso: 20 });
    igual(modelo.evaluaciones[0].nota, null);
  });

  prueba('los ids son consecutivos', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 10 }, { nombre: 'B', peso: 10 });
    igualJSON(modelo.evaluaciones.map((e) => e.id), [1, 2]);
  });

  prueba('quita los espacios sobrantes del nombre', () => {
    const { modelo } = crear();
    modelo.agregar({ nombre: '  Taller  ', peso: 10 });
    igual(modelo.evaluaciones[0].nombre, 'Taller');
  });

  prueba('rechaza un nombre vacío o de solo espacios', () => {
    const { modelo } = crear();
    lanzaReglas(() => modelo.agregar({ nombre: '', peso: 10 }), 'El nombre es obligatorio.');
    lanzaReglas(() => modelo.agregar({ nombre: '   ', peso: 10 }), 'El nombre es obligatorio.');
  });

  prueba('rechaza un nombre de más de 40 caracteres (40 sí se acepta)', () => {
    const { modelo } = crear();
    lanzaReglas(() => modelo.agregar({ nombre: 'x'.repeat(41), peso: 10 }), 'El nombre no puede superar 40 caracteres.');
    modelo.agregar({ nombre: 'x'.repeat(40), peso: 10 });
    igual(modelo.evaluaciones.length, 1);
  });

  prueba('rechaza un peso fuera de 1 a 100', () => {
    const { modelo } = crear();
    for (const peso of [0, 0.5, -5, 101, NaN]) {
      lanzaReglas(() => modelo.agregar({ nombre: 'X', peso }), 'El peso debe estar entre 1 y 100.');
    }
  });

  prueba('rechaza una nota fuera de 0 a 5 (0 y 5 sí se aceptan)', () => {
    const { modelo } = crear();
    for (const nota of [-0.1, 5.1, NaN]) {
      lanzaReglas(() => modelo.agregar({ nombre: 'X', peso: 10, nota }), 'La nota debe estar entre 0 y 5.');
    }
    modelo.agregar({ nombre: 'Cero', peso: 10, nota: 0 });
    modelo.agregar({ nombre: 'Cinco', peso: 10, nota: 5 });
    igual(modelo.evaluaciones.length, 2);
  });

  prueba('los pesos no pueden sumar más de 100 (y el mensaje dice cuánto queda)', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 70 });
    lanzaReglas(
      () => modelo.agregar({ nombre: 'B', peso: 40 }),
      'Los pesos no pueden sumar más de 100 % (te quedan 30 %).',
    );
  });

  prueba('los pesos pueden sumar exactamente 100', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 70 }, { nombre: 'B', peso: 30 });
    igual(modelo.evaluaciones.length, 2);
  });

  prueba('una orden rechazada no cambia nada (ni consume ids)', () => {
    const { modelo } = crear();
    lanzaReglas(() => modelo.agregar({ nombre: '', peso: 10 }));
    lanzaReglas(() => modelo.agregar({ nombre: 'X', peso: 500 }));
    igual(modelo.evaluaciones.length, 0);
    modelo.agregar({ nombre: 'Bueno', peso: 10 });
    igual(modelo.evaluaciones[0].id, 1);
  });
});

// ---------------------------------------------------------------------------------------------
g('B · Calificar y eliminar', () => {
  prueba('calificar asigna la nota', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 30 });
    modelo.calificar(1, 4.2);
    igual(modelo.evaluaciones[0].nota, 4.2);
  });

  prueba('calificar con null quita la nota', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 30, nota: 4 });
    modelo.calificar(1, null);
    igual(modelo.evaluaciones[0].nota, null);
  });

  prueba('calificar rechaza notas fuera de rango y deja la anterior', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 30, nota: 4 });
    lanzaReglas(() => modelo.calificar(1, 6), 'La nota debe estar entre 0 y 5.');
    lanzaReglas(() => modelo.calificar(1, NaN), 'La nota debe estar entre 0 y 5.');
    igual(modelo.evaluaciones[0].nota, 4);
  });

  prueba('calificar una evaluación que no existe es un error de reglas', () => {
    const { modelo } = crear();
    lanzaReglas(() => modelo.calificar(99, 3), 'No existe la evaluación.');
  });

  prueba('eliminar quita la evaluación indicada', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 10 }, { nombre: 'B', peso: 10 });
    modelo.eliminar(1);
    igualJSON(modelo.evaluaciones.map((e) => e.nombre), ['B']);
  });

  prueba('eliminar libera su peso', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 100 });
    modelo.eliminar(1);
    modelo.agregar({ nombre: 'B', peso: 100 });
    igual(modelo.evaluaciones.length, 1);
  });

  prueba('eliminar una evaluación que no existe es un error de reglas', () => {
    const { modelo } = crear();
    lanzaReglas(() => modelo.eliminar(7), 'No existe la evaluación.');
  });
});

// ---------------------------------------------------------------------------------------------
g('C · Resumen', () => {
  prueba('sin evaluaciones todo el peso está pendiente', () => {
    const r = crear().modelo.resumen();
    igual(r.acumulado, 0);
    igual(r.pesoCalificado, 0);
    igual(r.pesoPendiente, 100);
    igual(r.notaNecesaria, 3);
    igual(r.estado, 'en-camino');
  });

  prueba('el acumulado suma peso × nota ÷ 100 (solo de lo calificado)', () => {
    const { modelo } = conEvaluaciones(
      { nombre: 'P1', peso: 30, nota: 3.5 },
      { nombre: 'P2', peso: 30, nota: 4.0 },
      { nombre: 'Taller', peso: 20, nota: 5.0 },
      { nombre: 'Final', peso: 20 },
    );
    const r = modelo.resumen();
    cercaDe(r.acumulado, 3.25);
    igual(r.pesoCalificado, 80);
    igual(r.pesoPendiente, 20);
  });

  prueba('estado "aprobado" cuando el acumulado llega al mínimo', () => {
    const { modelo } = conEvaluaciones(
      { nombre: 'P1', peso: 30, nota: 3.5 },
      { nombre: 'P2', peso: 30, nota: 4.0 },
      { nombre: 'Taller', peso: 20, nota: 5.0 },
    );
    igual(modelo.resumen().estado, 'aprobado');
  });

  prueba('estado "en-camino": necesitas hasta 4.0 en lo que falta', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 50, nota: 2.0 });
    const r = modelo.resumen();
    cercaDe(r.notaNecesaria, 4.0);
    igual(r.estado, 'en-camino');
  });

  prueba('estado "en-riesgo": necesitas más de 4.0 (y hasta 5.0)', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 30, nota: 2.0 }, { nombre: 'P2', peso: 30, nota: 2.0 });
    const r = modelo.resumen();
    cercaDe(r.notaNecesaria, 4.5);
    igual(r.estado, 'en-riesgo');
  });

  prueba('necesitar exactamente 5.0 todavía es "en-riesgo", no "imposible"', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 50, nota: 1.0 });
    const r = modelo.resumen();
    cercaDe(r.notaNecesaria, 5.0);
    igual(r.estado, 'en-riesgo');
  });

  prueba('estado "imposible": ni con 5.0 en lo que falta alcanzas', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 60, nota: 1.0 });
    igual(modelo.resumen().estado, 'imposible');
  });

  prueba('estado "imposible": ya no queda peso por calificar y no llegaste', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 50, nota: 2.0 }, { nombre: 'P2', peso: 50, nota: 2.5 });
    const r = modelo.resumen();
    igual(r.pesoPendiente, 0);
    igual(r.notaNecesaria, null);
    igual(r.estado, 'imposible');
  });

  prueba('la nota necesaria se redondea hacia ARRIBA a dos decimales', () => {
    const { modelo } = conEvaluaciones({ nombre: 'P1', peso: 40, nota: 2.0 }); // necesitas 2.2 / 0.6 = 3.666…
    igual(modelo.resumen().notaNecesaria, 3.67);
  });

  prueba('los decimales no engañan: diez evaluaciones de 10 % con 3.0 → aprobado', () => {
    const { modelo } = crear();
    for (let i = 1; i <= 10; i++) modelo.agregar({ nombre: `E${i}`, peso: 10, nota: 3.0 });
    igual(modelo.resumen().estado, 'aprobado');
  });
});

// ---------------------------------------------------------------------------------------------
g('D · Observador y persistencia', () => {
  prueba('un suscriptor se entera de cada cambio (agregar, calificar, eliminar)', () => {
    const { modelo } = crear();
    let avisos = 0;
    modelo.suscribir(() => avisos++);
    modelo.agregar({ nombre: 'A', peso: 10 });
    modelo.calificar(1, 3);
    modelo.eliminar(1);
    igual(avisos, 3);
  });

  prueba('el suscriptor encuentra el Modelo ya actualizado', () => {
    const { modelo } = crear();
    let vistos = -1;
    modelo.suscribir(() => (vistos = modelo.evaluaciones.length));
    modelo.agregar({ nombre: 'A', peso: 10 });
    igual(vistos, 1);
  });

  prueba('suscribir devuelve la forma de cancelar la suscripción', () => {
    const { modelo } = crear();
    let avisos = 0;
    const cancelar = modelo.suscribir(() => avisos++);
    modelo.agregar({ nombre: 'A', peso: 10 });
    cancelar();
    modelo.agregar({ nombre: 'B', peso: 10 });
    igual(avisos, 1);
  });

  prueba('se pueden tener varios suscriptores a la vez', () => {
    const { modelo } = crear();
    let a = 0;
    let b = 0;
    modelo.suscribir(() => a++);
    modelo.suscribir(() => b++);
    modelo.agregar({ nombre: 'A', peso: 10 });
    igual(a + b, 2);
  });

  prueba('una orden rechazada NO notifica a nadie', () => {
    const { modelo } = crear();
    let avisos = 0;
    modelo.suscribir(() => avisos++);
    lanzaReglas(() => modelo.agregar({ nombre: '', peso: 10 }));
    lanzaReglas(() => modelo.eliminar(99));
    igual(avisos, 0);
  });

  prueba('guarda en el almacén después de cada cambio', () => {
    const { modelo, almacen } = crear();
    modelo.agregar({ nombre: 'A', peso: 10, nota: 4 });
    igualJSON(almacen.cargar(), [{ id: 1, nombre: 'A', peso: 10, nota: 4 }]);
    modelo.eliminar(1);
    igualJSON(almacen.cargar(), []);
  });

  prueba('al crearse carga lo que hay en el almacén y sigue la numeración', () => {
    const { modelo } = crear([{ id: 7, nombre: 'Guardada', peso: 20, nota: null }]);
    igual(modelo.evaluaciones.length, 1);
    modelo.agregar({ nombre: 'Nueva', peso: 10 });
    igual(modelo.evaluaciones[1].id, 8);
  });

  prueba('evaluaciones devuelve COPIAS: modificarlas no altera el Modelo', () => {
    const { modelo } = conEvaluaciones({ nombre: 'A', peso: 10, nota: 4 });
    const copia = modelo.evaluaciones;
    copia[0].nota = 0;
    copia.push({ id: 99, nombre: 'Intruso', peso: 5, nota: null });
    igual(modelo.evaluaciones.length, 1);
    igual(modelo.evaluaciones[0].nota, 4);
  });
});

// ---------------------------------------------------------------------------------------------
g(
  'E · Parte 5A · Nombres únicos',
  () => {
    prueba('rechaza un nombre que ya existe', () => {
      const { modelo } = conEvaluaciones({ nombre: 'Parcial 1', peso: 30 });
      lanzaReglas(() => modelo.agregar({ nombre: 'Parcial 1', peso: 10 }), 'Ya existe una evaluación con ese nombre.');
    });

    prueba('compara sin importar mayúsculas ni espacios sobrantes', () => {
      const { modelo } = conEvaluaciones({ nombre: 'Parcial 1', peso: 30 });
      lanzaReglas(() => modelo.agregar({ nombre: '  parcial 1 ', peso: 10 }), 'Ya existe una evaluación con ese nombre.');
    });

    prueba('después de eliminarla, el nombre se puede volver a usar', () => {
      const { modelo } = conEvaluaciones({ nombre: 'Parcial 1', peso: 30 });
      modelo.eliminar(1);
      modelo.agregar({ nombre: 'Parcial 1', peso: 30 });
      verdadero(modelo.evaluaciones.length === 1);
    });
  },
  { extension: true },
);
