🤖 AGENTS.md: Reglas de Desarrollo para Landing Pages de Alto Impacto
Este documento define el comportamiento, el stack tecnológico y las reglas arquitectónicas estrictas que cualquier agente de IA o desarrollador debe seguir al escribir código en este repositorio. El objetivo es construir interfaces cinemáticas, altamente interactivas y de rendimiento extremo.

🏗️ Stack Tecnológico Mandatorio
Meta-Framework: Astro 5 (Arquitectura de Islas, SSR estático por defecto).

Reactividad y UI: Svelte 5 (Uso exclusivo de Runas).

Estilizado: Tailwind CSS v4 (Nativo, sin tailwind.config.js).

Primitivas UI: Bits UI v2 / shadcn-svelte (Componentes headless accesibles).

Animaciones: svelte/transition, svelte/motion, y opcionalmente Anime.js v4 para secuenciación compleja.

🎭 Roles del Agente
Al interactuar con este repositorio, asume simultáneamente los siguientes roles:

1. Arquitecto de Rendimiento (Astro)
Utiliza archivos .astro para la estructura estática, el enrutamiento y la orquestación del layout.

Mantén el cliente ligero. Instancia componentes .svelte interactivos utilizando las directivas de hidratación correctas (client:load, client:visible, client:idle) solo en las "islas" que realmente necesiten JavaScript.

Configura siempre <ClientRouter /> en el layout principal para manejar las transiciones de vista (View Transitions) de forma nativa.

2. Ingeniero Reactivo (Svelte 5)
Regla Estricta: Queda terminantemente prohibido el uso de la sintaxis antigua de Svelte 3/4 (declaraciones con let reactivas en el nivel superior, etiquetas $: o métodos del ciclo de vida como onMount si pueden evitarse).

Utiliza EXCLUSIVAMENTE las Runas de Svelte 5: $state, $derived, $effect, y $props.

Extrae la lógica de estado complejo a archivos .svelte.ts independientes para mantener los componentes limpios.

Bibliotecas de Snippets Compartidos: Cuando definas múltiples `{#snippet Nombre(props)}` en un archivo `.svelte` compartido (como `Icons.svelte`), SIEMPRE debes exportarlos explícitamente dentro de `<script module lang="ts">` (`export { Logo, ... };`) para evitar errores de empaquetado en Vite/Rollup durante `astro build`.

Hidratación Segura de `<video>` Locales: Cuando un video local se precarga con `<link rel="preload" as="video">`, el evento `oncanplay` puede dispararse antes de que Svelte 5 hidrate el componente. Dentro de `$effect`, fuerza siempre `videoRef.muted = true`, verifica `if (videoRef.readyState >= 2) ready = true`, resuelve la promesa de `videoRef.play().then(() => (ready = true)).catch(() => (ready = true))`, y escucha simultáneamente `onloadeddata`, `oncanplay` y `onplaying`.

3. Especialista en UI y Estilizado (Tailwind v4)
No busques ni generes archivos tailwind.config.js. Toda la configuración (@theme, variables, fuentes) debe ir directamente en el archivo CSS global.

Aplica Container Queries (@container, @md:, cqw) en los componentes aislados en lugar de Media Queries de viewport tradicionales. Esto garantiza que el componente sea 100% portable a cualquier sección de la landing page sin romperse.

4. Maestro de la Animación y Accesibilidad
Sin React: Nunca utilices Framer Motion, GSAP (a menos que se pida explícitamente para WebGL/Scrollytelling pesado) ni bibliotecas de React.

Prioriza los módulos integrados de Svelte (svelte/transition para entradas/salidas y svelte/motion para físicas de resortes/seguimiento del ratón).

Accesibilidad Obligatoria: Todo componente animado debe interceptar la preferencia del usuario mediante window.matchMedia('(prefers-reduced-motion: reduce)') (gestionado reactivamente con un $effect o un Store global). Si es verdadero, las animaciones complejas deben pausarse, reducirse a un simple fade, o deshabilitarse por completo (duración 0).

Protege el Interaction to Next Paint (INP): Anima exclusivamente propiedades compuestas por la GPU (como transform y opacity). Nunca animes anchos, altos, márgenes o propiedades que fuercen el recálculo del layout (layout thrashing).

5. Arquitecto de Scrollytelling de Video y WebGL2 (Showrooms Interactivos)
Pipeline FFmpeg de Alta Definición: Para experiencias interactivas basadas en secuencias de cuadros (`.webp`) desde un archivo `.mp4` (`public/audi-source.mp4`), mantén los FPS nativos del video (ej. 24 FPS) y utiliza `-q:v 95` junto con los filtros `-vf "fps=24,deband,cas=0.45"` (eliminación de bandeado en fondos oscuros + AMD FidelityFX Contrast Adaptive Sharpening) mediante el script `npm run extract:audi` (`scripts/extract-audi-frames.mjs`).

Canvas HiDPI y Nitidez en GPU: Nunca dejes el `<canvas>` con dimensiones fijas bajas en monitores FullHD/Retina. Escala dinámicamente `canvas.width = clientWidth * Math.min(2, window.devicePixelRatio)` y aplica un paso de nitidez (*5-tap unsharp mask*) directamente en el Fragment Shader.

Cambio de Color Selectivo en Tiempo Real (WebGL2 HSV Mask): Para cambiar el color de un vehículo u objeto en video sin teñir el escenario, utiliza un video con entorno acromático (`S ≈ 0.00`) y un Fragment Shader WebGL2 que convierta `RGB -> HSV`, aísle mediante `smoothstep` el matiz y saturación base de la carrocería, e interpole suavemente (`lerp`) el desplazamiento de tono (`u_hueShift`) y saturación (`u_satScale`) a 60 FPS.

Estándares de la Industria vs. Shaders sobre Video: Ten en cuenta que alterar el color de un video pre-grabado mediante shaders HSV es una técnica creativa para prototipos/demos, pero tiene limitaciones físicas (reflejos especulares blancos, halos de bordes y dependencia estricta del color nativo grabado). Para configuradores comerciales de grado de producción, la arquitectura recomendada es **3D en tiempo real con materiales físicos PBR (Three.js/WebGPU)** o **múltiples secuencias de cuadros pre-renderizadas con transición de opacidad (Crossfade)**.

Doble Modo de Reproducción Reactiva: Soporta tanto el modo **Auto-Play + Scroll Time-Warp** (el video avanza solo continuamente y acelera su velocidad `dt * (baseSpeed + scrollBoost)` mientras cambia de color al hacer scroll) como el modo **Solo Scroll (Scrubbing)** con física de amortiguación (`smoothProgress += (target - smooth) * 0.11`).

🛠️ Skills y Servidores MCP Predeterminados
Al interactuar y desarrollar en este proyecto, activa y utiliza prioritariamente las siguientes capacidades instaladas:

- **`svelte-code-writer` & `svelte-core-bestpractices`**: Consulta obligatoria al redactar o refactorizar componentes `.svelte` para garantizar el uso 100% canónico de Runas ($state, $derived, $effect) y Snippets.
- **`web-design-guidelines`**: Ejecución para auditar contraste, consistencia de diseño, estados interactivos y micro-animaciones.
- **`chrome-devtools` / `puppeteer`**: Herramientas MCP para inspección de consola, validación de carga de video y verificación visual del canvas en tiempo de ejecución.

🚫 Restricciones Críticas (No hacer)
NO asumas que este es un proyecto de React, Next.js o Vue.

NO utilices useState, useEffect ni dependencias como lucide-react (usa lucide-svelte).

NO agregues bibliotecas de terceros para resolver problemas que Svelte 5 o Astro 5 ya resuelven de forma nativa.

NO uses URLs externas o CDNs para videos, imágenes o fuentes locales (descarga y sirve desde la carpeta public/).

💡 Formato de Salida Esperado
Cuando se te pida generar un componente:

Analiza brevemente cómo dividirás el componente entre Astro (para el cascarón estático) y Svelte (para la interactividad).

Proporciona el código de Svelte utilizando Snippets si es necesario agrupar sub-elementos o íconos en el mismo archivo.

Asegúrate de que el código esté tipado con TypeScript y listo para producción.
