/**
 * CONTROLADOR · Notas del semestre                                       (PARTE 4 de la guía)
 *
 * SABE: traducir lo que hace el usuario (eventos de la Vista) en órdenes para el Modelo,
 *       y qué mostrar cuando el Modelo rechaza una orden.
 * NO SABE: HTML ni DOM (eso es de la Vista), ni las reglas del negocio (eso es del Modelo).
 *
 * Es "delgado": cada método hace tres cosas como máximo (leer → ordenar → reaccionar).
 */

import { ErrorDeReglas } from './modelo.js';

export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    // 4A · Me registro en la Vista. Ella entrega TEXTO; el Modelo espera números y null (nota vacía = sin nota).
    vista.alAgregar(({ nombre, peso, nota }) => {
      this.#intentar(() => {
        this.#modelo.agregar({ nombre, peso: parseFloat(peso), nota: this.#aNota(nota) });
        this.#vista.limpiarFormulario();
      });
    });

    vista.alEliminar((id) => {
      this.#intentar(() => this.#modelo.eliminar(id));
    });

    vista.alCalificar((id, texto) => {
      this.#intentar(() => this.#modelo.calificar(id, this.#aNota(texto)));
    });
  }

  /** Traduce el texto de una nota: vacío → null (sin nota); lo demás → número (NaN si no lo es; el Modelo lo rechaza). */
  #aNota(texto) {
    return String(texto).trim() === '' ? null : parseFloat(texto);
  }

  /**
   * 4B · Ejecuta una orden al Modelo. Si el Modelo la rechaza (ErrorDeReglas) la Vista muestra el mensaje y se
   * redibuja, así el campo vuelve al valor que el Modelo sí aceptó. Si sale bien, se limpia el error.
   * Los errores que NO son de reglas no se esconden: se vuelven a lanzar.
   */
  #intentar(orden) {
    try {
      orden();
      this.#vista.limpiarError();
    } catch (error) {
      if (!(error instanceof ErrorDeReglas)) throw error;
      this.#vista.mostrarError(error.message);
      this.#vista.render();
    }
  }
}
