// Ejecuta las pruebas en la terminal.
//
//   npm test                 → todas
//   npm run test:modelo      → solo las del Modelo
//   npm run arquitectura     → solo las de arquitectura
//   npm test -- --todo       → muestra TODOS los fallos (por defecto solo el primer grupo con fallos)

import { ejecutar } from './mini.js';

const argumentos = process.argv.slice(2);
const verTodo = argumentos.includes('--todo');
const suite = argumentos.find((a) => !a.startsWith('--'));

if (!suite || suite === 'modelo') await import('./modelo.pruebas.js');
if (!suite || suite === 'arquitectura') await import('./arquitectura.pruebas.js');

const resultado = await ejecutar();

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const pintar = (codigo, texto) => (color ? `\x1b[${codigo}m${texto}\x1b[0m` : texto);
const verde = (t) => pintar('32', t);
const rojo = (t) => pintar('31', t);
const gris = (t) => pintar('90', t);
const negrita = (t) => pintar('1', t);

console.log('');
for (const nombreSuite of ['modelo', 'arquitectura']) {
  const grupos = resultado.grupos.filter((g) => g.suite === nombreSuite);
  if (grupos.length === 0) continue;
  console.log(negrita(nombreSuite.toUpperCase()));
  for (const g of grupos) {
    const total = g.resultados.length;
    const ok = g.pasan === total;
    const marca = ok ? verde('✓') : g.pasan === 0 ? rojo('✗') : rojo('◐');
    const puntos = '.'.repeat(Math.max(2, 46 - g.nombre.length));
    console.log(`  ${marca} ${g.nombre} ${gris(puntos)} ${ok ? verde(`${g.pasan}/${total}`) : rojo(`${g.pasan}/${total}`)}`);
  }
  console.log('');
}

// Detalle: por defecto, solo el primer grupo con fallos que no sea de la Parte 5 (si no hay otro, el de la Parte 5).
const conFallos = resultado.grupos.filter((g) => g.pasan < g.resultados.length);
const principales = conFallos.filter((g) => !g.extension);
const mostrar = verTodo ? conFallos : [principales[0] ?? conFallos[0]].filter(Boolean);

for (const g of mostrar) {
  console.log(negrita(`Para arreglar ahora: ${g.nombre}`));
  for (const r of g.resultados.filter((x) => !x.ok)) {
    console.log(`  ${rojo('✗')} ${r.nombre}`);
    for (const linea of String(r.mensaje).split('\n')) console.log(gris(`      ${linea.trim() ? linea.trim() : ''}`));
  }
  console.log('');
}

const resumen = `${resultado.pasan} de ${resultado.total} pruebas pasan.`;
console.log(resultado.fallan === 0 ? verde(`✓ ${resumen}`) : rojo(`✗ ${resumen}`));
if (resultado.fallan > 0 && !verTodo && conFallos.length > mostrar.length) {
  console.log(gris('  (Se muestra un grupo a la vez. Con "npm test -- --todo" ves todos los fallos.)'));
}
console.log('');
process.exit(resultado.fallan === 0 ? 0 : 1);
