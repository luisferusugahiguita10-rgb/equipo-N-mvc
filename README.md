# Laboratorio MVC · Notas del semestre

Laboratorio del curso de **Arquitectura de Software** (Tema: patrón MVC). Partes de una aplicación que
funciona pero está escrita como *código espagueti* (todo mezclado en un solo archivo) y la separas en
**Modelo**, **Vista** y **Controlador**, con pruebas que te dicen si vas bien.

- **Duración:** ≈ 2 h 20 min (7 partes) · en parejas o equipos de 3, un repositorio por equipo
- **Qué necesitas:** un navegador, un editor (VS Code recomendado), Git y [Node.js](https://nodejs.org) 18 o superior
- **Sin dependencias:** no hay `npm install`; no se descarga nada más

## Empieza aquí

1. Lee la **guía del laboratorio** (pasos, tiempos, rúbrica): https://mvc-notas-lab.vercel.app/guia.html
2. Revisa la **presentación** del tema: https://mvc-notas-lab.vercel.app/presentacion.html
3. Crea el repositorio de tu equipo con **Use this template** (botón verde de esta página) y clónalo.

```bash
npm start            # abre http://localhost:3000  (tu app)  y  /espagueti.html  (la versión de partida)
npm test             # todas las pruebas (Modelo + arquitectura)
npm run test:modelo  # solo las del Modelo
npm run arquitectura # solo las reglas de arquitectura
```

> ¿Sin Node? También puedes usar la extensión **Live Server** de VS Code y abrir
> `pruebas/pruebas.html`: son las mismas pruebas, en el navegador.

## Qué hay en cada carpeta

```text
espagueti.html          La versión de partida (no la modifiques: léela y analízala)
index.html              Tu app MVC: el HTML estático de la pantalla (no tiene lógica)
estilos.css             Estilos compartidos (no hace falta tocarlos)
src/
  modelo.js             PARTE 2 · tu trabajo: datos y reglas        (esqueleto con TODO)
  vista.js              PARTE 3 · tu trabajo: dibujar y escuchar    (esqueleto con TODO)
  controlador.js        PARTE 4 · tu trabajo: conectar              (esqueleto con TODO)
  almacen.js            Dónde se guardan los datos (ya escrito; en 5C agregas uno)
  main.js               Ensambla las tres piezas (en 5B y 5C vuelves aquí)
pruebas/
  modelo.pruebas.js     Especificación ejecutable del Modelo
  arquitectura.pruebas.js  Reglas: "el Modelo no toca la pantalla", "la Vista no decide reglas"...
  pruebas.html          Las mismas pruebas, en el navegador
ENTREGA.md              Lo que entregas: mapa, olores, flujo, evidencias, reflexión
```

## Comandos útiles de Git

```bash
git add -A
git commit -m "Parte 2: Modelo con las reglas de las notas"
git pull && git push
```

Haz un **commit por parte**: en la Parte 5 los usarás como evidencia de qué archivos tocó cada cambio.
