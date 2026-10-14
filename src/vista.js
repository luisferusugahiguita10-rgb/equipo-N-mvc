/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

const ESTADOS = {
  aprobado: { clase: 'ok', texto: () => '¡Aprobado! Ya aseguraste la nota mínima.' },
  'en-camino': { clase: 'en-camino', texto: (n) => `En camino: necesitas ${n.toFixed(2)} en lo que falta.` },
  'en-riesgo': { clase: 'riesgo', texto: (n) => `En riesgo: necesitas ${n.toFixed(2)} en lo que falta.` },
  imposible: { clase: 'imposible', texto: () => 'Imposible aprobar con las notas actuales.' },
};

const redondear2 = (n) => Math.round(n * 100) / 100;

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    const q = (selector) => raiz.querySelector(selector);
    this.#el = {
      form: q('#form'),
      nombre: q('#nombre'),
      peso: q('#peso'),
      nota: q('#nota'),
      error: q('#error'),
      tabla: q('#tabla'),
      vacio: q('#vacio'),
      acumulado: q('#acumulado'),
      pesoCalificado: q('#pesoCalificado'),
      pesoPendiente: q('#pesoPendiente'),
      necesaria: q('#necesaria'),
      estado: q('#estado'),
    };
    // Observer: cada vez que el Modelo cambia, la Vista se redibuja sola.
    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece
  // El Controlador se registra aquí. La Vista no decide qué hacer: solo avisa "el usuario hizo esto".

  alAgregar(manejador) {
    this.#el.form.addEventListener('submit', (evento) => {
      evento.preventDefault(); // sin esto el formulario recargaría la página
      manejador(this.leerFormulario());
    });
  }

  // EJEMPLO RESUELTO (para que hagas alAgregar y alCalificar igual): un solo escuchador en la tabla
  // sirve para todas las filas (delegación de eventos); el id viaja en el atributo data-eliminar.
  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    this.#el.tabla.addEventListener('change', (evento) => {
      const campo = evento.target.closest('input[data-nota]');
      if (campo) manejador(Number(campo.dataset.nota), campo.value);
    });
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece

  leerFormulario() {
    return { nombre: this.#el.nombre.value, peso: this.#el.peso.value, nota: this.#el.nota.value };
  }

  limpiarFormulario() {
    this.#el.nombre.value = '';
    this.#el.peso.value = '';
    this.#el.nota.value = '';
  }

  mostrarError(mensaje) {
    this.#el.error.textContent = mensaje;
  }

  limpiarError() {
    this.#el.error.textContent = '';
  }

  // ---------------------------------------------------------- 3D · Dibujar

  /** Dibuja TODO a partir del Modelo. No decide nada: solo presenta. */
  render() {
    const evaluaciones = this.#modelo.evaluaciones;
    this.#dibujarTabla(evaluaciones);
    this.#el.vacio.hidden = evaluaciones.length > 0;
    this.#dibujarResumen(this.#modelo.resumen());
  }

  #dibujarTabla(evaluaciones) {
    // Se arman nodos con createElement/textContent: el nombre lo escribió el usuario y no debe leerse como HTML.
    const filas = evaluaciones.map((e) => {
      const fila = document.createElement('tr');
      const celda = (contenido) => {
        const td = document.createElement('td');
        if (typeof contenido === 'string') td.textContent = contenido;
        else td.append(contenido);
        fila.append(td);
      };

      const campoNota = document.createElement('input');
      campoNota.type = 'number';
      campoNota.step = 'any';
      campoNota.value = e.nota === null ? '' : e.nota;
      campoNota.dataset.nota = e.id;

      const botonEliminar = document.createElement('button');
      botonEliminar.type = 'button';
      botonEliminar.textContent = 'Eliminar';
      botonEliminar.dataset.eliminar = e.id;

      celda(e.nombre);
      celda(`${e.peso} %`);
      celda(campoNota);
      celda(e.nota === null ? '—' : ((e.peso * e.nota) / 100).toFixed(2));
      celda(botonEliminar);
      return fila;
    });
    this.#el.tabla.replaceChildren(...filas);
  }

  #dibujarResumen(r) {
    this.#el.acumulado.textContent = r.acumulado.toFixed(2);
    this.#el.pesoCalificado.textContent = `${redondear2(r.pesoCalificado)} %`;
    this.#el.pesoPendiente.textContent = `${redondear2(r.pesoPendiente)} %`;
    this.#el.necesaria.textContent = r.notaNecesaria === null ? '—' : r.notaNecesaria.toFixed(2);

    const estado = ESTADOS[r.estado];
    this.#el.estado.textContent = estado.texto(r.notaNecesaria);
    this.#el.estado.className = `estado ${estado.clase}`;
  }
}
