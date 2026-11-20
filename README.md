# Aventuras Mágicas 🗺️✨

"Elige tu propia aventura" para aprender inglés (6-8 años). El niño siente que decide
libremente, pero la historia es una **red de nodos finita**: un grafo sin ciclos donde
todos los caminos terminan en uno de los finales.

| Mundo | Lugares | Finales | Caminos posibles |
|---|---|---|---|
| 🦖🚀 El Viaje en el Tiempo (gratis) | 35 | 7 | 3.240 |
| 🧙‍♂️🐉 El Reino de la Fantasía (2,99€) | 10 | 5 | 106 |

## Cómo se crea la ilusión de libertad

1. **Ramas y cuellos de botella**: los caminos se separan y vuelven a juntarse en nodos hub
   (`p_nest`, `f_tower`, `portal`, `finale`), así la historia crece sin explotar.
2. **Memoria de decisiones** (`vars`): amabilidad, valentía, curiosidad, objetos y amigo.
3. **Texto que cambia** (`extras`): un mismo lugar cuenta cosas distintas según lo que hiciste.
4. **Opciones con candado** (`if` + `hint`): se ven con 🔒 y una pista → ganas de rejugar.
5. **Ruta secreta**: el 💎 del volcán abre el fondo del mar y el final "Leyenda del Tiempo".
6. **Router invisible** (`route`): elige el final según todo lo que hizo el niño.
7. **Mapa de constelación**: los lugares visitados se iluminan; los finales se coleccionan.

## Estructura

```
www/
  index.html          pantallas (menú, juego, final, mapa, ventanas)
  css/styles.css
  js/engine.js        motor de la red: condiciones, efectos, routers, validación
  js/storage.js       progreso, finales, partida guardada, compras, ajustes
  js/speech.js        voz en inglés (Web Speech API / plugin nativo de Android)
  js/billing.js       compra simulada → sustituir por Google Play Billing
  js/map.js           mapa de constelación (SVG)
  js/app.js           interfaz y flujo
  stories/world1.js   historia del Mundo 1 (formato documentado al inicio)
  stories/world2.js   historia del Mundo 2
tools/validate.js     comprueba todas las historias
```

## Añadir o editar escenas

Edita `www/stories/*.js` y después ejecuta el validador. Comprueba que no haya ciclos,
callejones sin salida, nodos inalcanzables ni finales imposibles, y cuenta los caminos:

```bash
npm run validate
```

Para crear un mundo nuevo, copia `world2.js`, cambia `id`/`order` y añade su `<script>` en `index.html`.

## Probar en el ordenador

```bash
npm run serve
```

Abre http://localhost:8080 (mejor en Chrome, con la vista de tablet de DevTools).

## Publicar en Android (Play Store)

Requisitos: Node 18+, Android Studio.

```bash
npm install
npm run android:add
npm run android:sync
npm run android:open
```

Pendiente antes de publicar:

- **Voz**: el WebView de Android no trae `speechSynthesis`; la app usa el plugin
  `@capacitor-community/text-to-speech` automáticamente. Las tablets necesitan una voz en inglés
  instalada (Ajustes → Salida de texto a voz).
- **Pagos**: `js/billing.js` simula la compra. Hay que integrar Google Play Billing
  (p. ej. `cordova-plugin-purchase` o RevenueCat), crear el producto `world2_fantasy` en
  Play Console y añadir "Restaurar compras".
- **Familias**: las apps para niños deben cumplir la política "Diseñado para familias" de Google Play
  (sin anuncios inadecuados, compras tras control parental, política de privacidad).
- **Orientación / icono**: configúralos en `android/` tras `cap add android`.
