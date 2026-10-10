/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    // TODO 3A: busca en `raiz` los elementos que vas a usar (#form, #nombre, #peso, #nota, #error, #tabla,
    //          #vacio, #acumulado, #pesoCalificado, #pesoPendiente, #necesaria, #estado) y guárdalos en this.#el.
    //          Luego: suscríbete al Modelo para redibujarte sola y dibuja una primera vez.
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece
  // El Controlador se registra aquí. La Vista no decide qué hacer: solo avisa "el usuario hizo esto".

  alAgregar(manejador) {
    // TODO 3B: cuando se envíe el formulario (submit, sin recargar la página) llama a manejador(this.leerFormulario()).
  }

  // EJEMPLO RESUELTO (para que hagas alAgregar y alCalificar igual): un solo escuchador en la tabla
  // sirve para todas las filas (delegación de eventos); el id viaja en el atributo data-eliminar.
  // Funciona cuando termines 3A (this.#el.tabla) y 3D (los botones "Eliminar" con data-eliminar).
  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    // TODO 3B: cuando cambie una nota de la tabla, llama a manejador(id, textoEscrito).
    //          Pista: igual que alEliminar, pero con el evento "change" y el id guardado en data-nota
    //          (el <input> de la nota; textoEscrito es su .value).
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece

  leerFormulario() {
    // TODO 3C: devuelve { nombre, peso, nota } con lo que el usuario escribió, TAL CUAL (texto).
  }

  limpiarFormulario() {
    // TODO 3C: vacía los tres campos.
  }

  mostrarError(mensaje) {
    // TODO 3C: muestra el mensaje en #error.
  }

  limpiarError() {
    // TODO 3C: borra el mensaje de #error.
  }

  // ---------------------------------------------------------- 3D · Dibujar

  /** Dibuja TODO a partir del Modelo. No decide nada: solo presenta. */
  render() {
    // TODO 3D: lee this.#modelo.evaluaciones y this.#modelo.resumen() y actualiza la tabla y el resumen.
    //          · Tabla: una fila por evaluación (nombre, peso, un <input> con la nota, aporte, botón Eliminar).
    //            Usa textContent/createElement: el nombre lo escribió el usuario y NO debe interpretarse como HTML.
    //          · #vacio solo se ve si no hay evaluaciones.
    //          · Resumen: acumulado (2 decimales), pesos con " %", nota necesaria (o "—"), y #estado con su texto y clase
    //            (ok / en-camino / riesgo / imposible). Los textos exactos están en la guía y en espagueti.html.
  }
}
