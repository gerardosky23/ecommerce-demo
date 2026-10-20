# Directivas de Ingeniería UI/UX (Astro + Svelte) — Política Estricta Anti-Slop (Edición Claude Opus / Linear)

## 1. Patrones Prohibidos ("AI Slop" Blacklist)
Queda estrictamente prohibido introducir o mantener en archivos `.astro` o `.svelte` cualquiera de los siguientes elementos:
- **Ornamentación de Vanidad:** Badges decorativos, "eyebrows" (píldoras o etiquetas pequeñas encima de los H1/H2/H3), emojis en títulos o botones, divisores con brillo y anillos decorativos (`ring-indigo-500/20`).
- **Métricas y Social Proof Falso:** Contadores estáticos o inventados ("+10k usuarios", "99.9% uptime"), grupos de avatares falsos apilados, estrellas de reseñas estáticas o barras de logos de relleno.
- **Clichés Visuales de LLM & Tech Neón:** 
  - Prohibido el estilo ciberpunk / tech neón saturado (verde neón, morados chillones, cian flúor).
  - Textos con gradiente (`bg-clip-text`, `text-transparent`), manchas borrosas de fondo (`blur-2xl`, `blur-3xl`, `blur-[*]`, gradient blobs).
  - Sombras difusas pesadas (`shadow-lg`, `shadow-xl`, `shadow-2xl`).
- **Redondez Excesiva ("Bubbly / Cartoon Slop"):** Prohibido el uso de `rounded-3xl` (24px) o contenedores burbuja (`rounded-[22px]`, `rounded-[28px]`). La arquitectura debe ser precisa y nítida.
- **Layouts Redundantes:** Grillas simétricas de 3 tarjetas con "icono dentro de un círculo de color + título + 2 líneas de descripción". Contenedores anidados innecesarios ("cajas dentro de cajas" o `div` soup).
- **Copywriting Hiperbólico:** Palabras vacías de marketing como "Revoluciona", "Potencia", "Sin fisuras", "Desbloquea", "Del futuro" o "Impulsado por IA". Usar microcopy técnico, directo y conciso.

## 2. Principios de Diseño Funcionalista (Estilo Claude Opus / Linear / Stripe)
- **Tipografía Sans-Serif de Alta Seriedad:**
  - Pila tipográfica estricta: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.
  - Escala tipográfica sobria, jerarquía clara mediante pesos (`font-semibold` vs `font-normal`) y color de texto contrastado (`text-white` vs `text-slate-400`).
  - Aplicar `tabular-nums` en todas las cifras, fechas, tablas y métricas reales.
- **Paleta de Color Refinada (Azul Celeste, Blanco, Negro y Slate):**
  - **Superficie Principal:** Negro neutro profundo (`#090a0f`) y pizarra profunda (`#0d111a`).
  - **Superficies Secundarias (Cards, Modales):** Slate oscuro (`#131722`) y grafito (`#171d2b`).
  - **Bordes:** Nítidos de 1px con bajo contraste (`border-white/10` o `border-slate-800`).
  - **Color Primario Interactivo (Azul Celeste / Azure):** `sky-500` (`#0ea5e9`), `sky-600` (`#0284c7`), con toques sutiles de celeste claro (`#38bdf8`) para indicadores técnicos.
  - **Texto:** Blanco puro (`#ffffff`) para titulares principales; `slate-300` / `slate-400` para cuerpo de texto y descripciones.
- **Bordes y Radios Arquitectónicos (Precision Radius):**
  - Botones, inputs y chips: `rounded-md` (6px) o `rounded-lg` (8px).
  - Tarjetas y ventanas técnicas: `rounded-lg` (8px) o `rounded-xl` (12px máximo).
  - Sin esquinas infladas ni curvaturas excesivas que resten seriedad corporativa.
- **Ley de Sustracción:** Cada nodo del DOM debe justificar su existencia. Si un elemento decorativo se elimina y el usuario aún puede comprender la vista y completar su flujo, ese elemento debe ser eliminado.

## 3. Reglas de Integridad para Arquitectura Astro + Svelte (CRÍTICO)
1. **Hidratación de Islas Intocable:** En archivos `.astro`, NUNCA elimines ni alteres las directivas de cliente (`client:load`, `client:visible`, `client:idle`, `client:only`, `client:media`) ni las directivas de `ViewTransitions` / `ClientRouter` (`transition:name`, `transition:animate`).
2. **Respeto Estricto a la Versión de Svelte:** Svelte 5 Runes exclusivamente (`$state`, `$derived`, `$effect`, `$props`, `{@render}`). Prohibido código legacy (`export let`, `$:`) o mezclar sintaxis.
3. **Preservación de Bindings y Stores:** En archivos `.svelte`, prohibido romper `bind:*`, `use:*` (actions), `on:*` / `onclick`, lecturas de Svelte Stores (`$store`) o el paso de `<slot />`.
4. **Frontera Astro vs. Svelte:** No rompas las props de entrada entre `.astro` y `.svelte`. Limpia cualquier bloque `<style>` scoped que quede con selectores huérfanos tras borrar nodos HTML (evita warnings `css-unused-selector` de Svelte).

## 4. Protocolo de Verificación con Playwright y Chrome DevTools
Ninguna ruta se considera terminada sin pasar estas pruebas en el navegador:
1. **Verificación de Hidratación de Astro (`astro-island`):** Esperar a que las islas visibles se hayan hidratado correctamente y que no queden atributos `data-astro-cid-*` huérfanos.
2. **Integridad de Estado Reactivo en Svelte:** Dispara todos los cambios de estado en componentes `.svelte` (tabs, filtros, sliders, formularios, modales). Verifica que el DOM reaccione exactamente igual.
3. **Inspección Visual y Consola:** Cero errores en `console.error`, cero warnings de compilación de Svelte/Astro, cero clases prohibidas en el DOM renderizado y cero desbordamiento horizontal (`scrollWidth > clientWidth`).

## 5. Compatibilidad Multi-Motor (Firefox / Gecko, WebKit / Safari, Chromium)
Para garantizar una experiencia idéntica en Firefox, Safari y navegadores basados en Chromium, deben cumplirse estrictamente estas directivas:
1. **Regla de Oro de `position: sticky` y `overflow`:**
   - Queda terminantemente prohibido usar `overflow-x: hidden` o `overflow: hidden` en `html`, `body` o cualquier contenedor ancestro de elementos con `position: sticky`. En Gecko (Firefox) y WebKit, `overflow-x: hidden` fuerza `overflow-y: auto`, lo que convierte al contenedor en un scroll container falso y rompe el comportamiento pegajoso.
   - Usar en su lugar `overflow-x: clip; overflow-y: visible;` en `html, body` junto con `max-width: 100vw;` para prevenir desbordamientos horizontales sin romper `position: sticky`.
2. **Robustez en Canvas y Renderizado WebP (Firefox Gecko Strictness):**
   - En Gecko, invocar `ctx.drawImage()` sobre una imagen con `naturalWidth === 0`, `naturalHeight === 0` o valores numéricos no finitos (`NaN`, `Infinity`) arroja una excepción fatal no capturada (`NS_ERROR_NOT_AVAILABLE` o `IndexSizeError`), lo que congela el loop de animación.
   - Todo llamado a `ctx.drawImage()` debe validar previamente `img.naturalWidth > 0 && img.naturalHeight > 0`, verificar `Number.isFinite()` en todas las dimensiones y coordenadas, y envolverse en un bloque `try / catch` defensivo.
   - Forzar la decodificación en memoria vía `await img.decode().catch(() => {})` antes de la asignación y disponer de una imagen `<img class="canvas-fallback" ...>` renderizada en el DOM como seguro contra caídas de red o demoras en la caché de decodificación.
3. **Manejo de Video y Media Autoplay:**
   - En Firefox y navegadores móviles con políticas estrictas de ahorro de datos, los elementos `<video>` deben incluir obligatoriamente los atributos `muted playsinline autoplay loop preload="auto"` y un atributo `poster` estático de alta fidelidad.
   - La llamada `.play()` debe ser siempre gestionada de forma segura mediante promesa (`playPromise.catch(() => {})`) para evitar excepciones por políticas de autoplay del navegador.

## 6. Protocolo Obligatorio de Despliegue CI/CD y Push a GitHub (Dokploy)
Queda estrictamente establecido que cada vez que el usuario ordene realizar un `push` a GitHub, el agente DEBE ejecutar rigurosamente este flujo sin excepción:
1. **Verificación Pre-vuelo (Preflight Build):** Ejecutar `npm run build` localmente y verificar 0 errores de compilación y tipado antes de cualquier commit.
2. **Integridad de Contenedorización:** Asegurar que `Dockerfile` (multi-stage Node 20 Builder + Nginx Alpine Runner), `.dockerignore` y `nginx.conf` estén presentes, actualizados y sin rutas rotas.
3. **Prueba de Build Docker Local:** Si el Docker daemon está activo en el entorno, ejecutar `docker build -t <project>:test .` para garantizar que la imagen compilará sin fallos en el servidor Dokploy.
4. **Staging y Commit Semántico:** Preparar los archivos (`git add .`), verificar el árbol (`git status`) y generar un commit convencional descriptivo (`feat:`, `fix:`, `refactor:`, `chore:`).
5. **Push a la Rama Principal:** Ejecutar `git push origin main` para disparar el Webhook de Dokploy, iniciando el despliegue automático continuo con cero downtime.
