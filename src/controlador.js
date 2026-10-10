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

    // TODO 4A: regístrate en la Vista (vista.alAgregar, vista.alEliminar, vista.alCalificar).
    //          Cada manejador convierte los datos (la Vista entrega TEXTO; el Modelo espera números y null)
    //          y le da la orden al Modelo.
  }

  // TODO 4B: un método privado que ejecute una orden al Modelo y, si lanza un ErrorDeReglas, le pida a la Vista
  //          que muestre el mensaje (y que se redibuje, para deshacer lo que el usuario escribió y el Modelo no aceptó).
  //          Los errores que NO sean de reglas no se esconden: se vuelven a lanzar.
  //          Si todo sale bien: limpia el error. Para "agregar", además limpia el formulario.
}
