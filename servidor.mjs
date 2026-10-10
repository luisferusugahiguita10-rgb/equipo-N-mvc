// Servidor estático mínimo, sin dependencias: sirve esta carpeta en http://localhost:3000
// (necesario porque los módulos ES —import/export— no funcionan abriendo el archivo con doble clic).
//
//   npm start                 → puerto 3000
//   PORT=4000 npm start       → otro puerto (en Windows PowerShell: $env:PORT=4000; npm start)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('.', import.meta.url));
const PUERTO = Number(process.env.PORT) || 3000;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let ruta = normalize(decodeURIComponent(url.pathname));
    if (ruta.endsWith(sep) || ruta === '/') ruta = join(ruta, 'index.html');
    const archivo = join(RAIZ, ruta);
    if (!archivo.startsWith(RAIZ)) throw Object.assign(new Error('fuera de la carpeta'), { code: 'ENOENT' });
    const contenido = await readFile(archivo);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store', // para ver siempre tus últimos cambios
    });
    res.end(contenido);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' || e.code === 'EISDIR' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(e.code === 'ENOENT' || e.code === 'EISDIR' ? 'No encontrado' : 'Error del servidor');
  }
});

servidor.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`El puerto ${PUERTO} está ocupado. Prueba con otro: PORT=${PUERTO + 1} npm start`);
    process.exit(1);
  }
  throw e;
});

servidor.listen(PUERTO, () => {
  console.log('Servidor listo. Abre estas direcciones en el navegador:');
  console.log(`  Tu app MVC ........ http://localhost:${PUERTO}/`);
  console.log(`  Versión espagueti . http://localhost:${PUERTO}/espagueti.html`);
  console.log(`  Pruebas (navegador) http://localhost:${PUERTO}/pruebas/pruebas.html`);
  console.log('Para detenerlo: Ctrl + C');
});
