// RAÍZ DE COMPOSICIÓN: el único lugar que conoce las tres piezas y las conecta.
// (Ya viene escrito; en las Partes 5B y 5C vuelves a este archivo.)

import { NotasModelo } from './modelo.js';
import { NotasVista } from './vista.js';
import { NotasControlador } from './controlador.js';
import { AlmacenLocal } from './almacen.js';

// 1. El Modelo, con el almacén que elijamos.
const modelo = new NotasModelo(new AlmacenLocal('notas.v1'));

// 2. La Vista: recibe el Modelo para poder LEERLO y suscribirse a sus cambios.
const vista = new NotasVista(document.getElementById('app'), modelo);

// 3. El Controlador: recibe las dos piezas y las conecta (eventos de la Vista → acciones del Modelo).
new NotasControlador(modelo, vista);

// Parte 5B: aquí montarás la segunda vista (el termómetro).
// Parte 5C: aquí cambiarás el almacén por otro.
