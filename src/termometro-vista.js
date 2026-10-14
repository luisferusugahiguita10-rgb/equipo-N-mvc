/**
 * SEGUNDA VISTA · Termómetro de aprobación                                (PARTE 5B de la guía)
 *
 * Muestra el MISMO Modelo de otra forma: una barra que se llena según el acumulado y una línea que marca
 * la nota mínima. Es pasiva como la primera: lee del Modelo y se suscribe a sus cambios; no decide nada.
 * El Modelo no se entera de que existe (solo ve un suscriptor más).
 */

import { NOTA_MINIMA, NOTA_MAXIMA } from './modelo.js';

const limitar = (porcentaje) => Math.max(0, Math.min(100, porcentaje));

export class TermometroVista {
  #modelo;
  #relleno;
  #leyenda;

  constructor(raiz, modelo) {
    this.#modelo = modelo;

    // 1. Armo la barra: un div.termometro con un div.relleno y un div.linea, y una leyenda debajo.
    const barra = document.createElement('div');
    barra.className = 'termometro';
    this.#relleno = document.createElement('div');
    this.#relleno.className = 'relleno';
    const linea = document.createElement('div');
    linea.className = 'linea';
    // La línea siempre va en NOTA_MINIMA ÷ NOTA_MAXIMA × 100 %: si cambia la constante, se mueve sola.
    linea.style.left = `${(NOTA_MINIMA / NOTA_MAXIMA) * 100}%`;
    barra.append(this.#relleno, linea);

    this.#leyenda = document.createElement('p');
    this.#leyenda.className = 'leyenda';
    raiz.replaceChildren(barra, this.#leyenda);

    // 2. Me suscribo al Modelo y dibujo una primera vez.
    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  render() {
    const { acumulado } = this.#modelo.resumen();
    this.#relleno.style.width = `${limitar((acumulado / NOTA_MAXIMA) * 100)}%`;
    this.#leyenda.textContent =
      `${acumulado.toFixed(2)} de ${NOTA_MAXIMA.toFixed(1)} · la línea marca el mínimo para aprobar (${NOTA_MINIMA.toFixed(1)})`;
  }
}
