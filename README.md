# 🏎️ Masterclass: Creación de Landing Pages de Alto Impacto con IA (Sin Saber Programar)

¡Bienvenido/a al repositorio oficial de la clase! 

Este proyecto —un **Showroom Interactivo en 1080p del Audi R8 V10 Performance quattro**— fue construido íntegramente conversando con Inteligencia Artificial en lenguaje natural. El objetivo de este repositorio es que puedas **ver el resultado funcionando en tu computadora** y, sobre todo, que tengas a la mano **las plantillas de Prompts Maestros** para crear páginas web del mismo nivel para tus propios proyectos, marcas o negocios.

---

## 🧠 El Secreto Pedagógico: No programes, dirige como un Director de Arte

Cuando alguien le pide a la IA: *"Hazme una página web bonita para vender un auto"*, la IA responde con una página genérica, plana y aburrida.

Para obtener resultados que parecen de una agencia de diseño de **$20,000 USD** (como las webs de Apple, Porsche o Tesla), **no necesitas saber escribir código**, solo necesitas incluir **4 ingredientes en lenguaje natural** dentro de tu prompt:

| Ingrediente | ❌ Cómo lo pide un principiante | ✅ Cómo lo pide un Director de Arte con IA |
| :--- | :--- | :--- |
| **1. Referente de Lujo** | *"Que se vea profesional"* | *"Diseña con la estética de Apple, Porsche y sitios ganadores de Awwwards"* |
| **2. Atmósfera Visual** | *"Ponle colores oscuros"* | *"Modo oscuro en tonos negro carbono, paneles de cristal esmerilado (glassmorphism) y acentos en rojo carmesí"* |
| **3. Verbos de Interacción** | *"Que sea dinámica y moderna"* | *"Tarjetas que se inclinen en 3D al pasar el ratón, botones magnéticos y video que avance al hacer scroll"* |
| **4. El Candado Técnico** | *(No pone nada)* | *"Constrúyelo usando Astro 5, Svelte 5 y Tailwind CSS v4"* *(1 sola línea que obliga a la IA a usar tecnología de punta)* |

---

## 🚀 Los 4 Prompts Maestros (Copia, Pega y Adapta)

A continuación encontrarás los **4 Prompts Maestros** diseñados para esta clase. Están pensados para utilizarse de forma progresiva o según lo que necesites lograr en cada momento.

---

### 🎬 Prompt Maestro 1: "El Todo-en-Uno Cinemático"
**¿Cuándo utilizarlo?**
Úsalo al **iniciar un proyecto desde cero** cuando quieras que la IA construya toda la estructura completa de la landing page de un solo golpe, con múltiples secciones interactivas coherentes entre sí.

```text
Actúa como un Director de Arte de marcas de lujo como Porsche y Apple. Quiero que construyas una landing page completa, futurista y altamente interactiva en español para el superdeportivo "Audi R8 V10 Performance".

ESTILO VISUAL:
- Modo oscuro elegante (tonos negro carbono, gris titanio y paneles con efecto de cristal esmerilado).
- Colores de acento: Rojo Audi Sport (#f50537) y Azul Eléctrico (#2563eb).
- Tipografía moderna, grande y audaz con números técnicos estilo velocímetro.

ESTRUCTURA E INTERACTIVIDAD (Quiero que todo reaccione al ratón y al scroll):
1. Barra superior flotante: Con efecto de vidrio translúcido, el logo de los 4 aros de Audi y un botón "Reservar Test Drive" que tenga efecto magnético al acercar el cursor.
2. Portada (Hero) de pantalla completa: Usa un video local (/hero-loop.mp4) reproduciéndose en bucle de fondo. Incluye el título principal, 3 tarjetas con estadísticas clave (620 CV, 3.1 seg, 331 km/h) y un botón interactivo para "Acelerar el motor V10" que al mantener el cursor aumente la velocidad del video y anime un gráfico de revoluciones.
3. Sección Showroom Scrollable: Una sección fija donde el video del auto (/audi-source.mp4) avance y retroceda suavemente a medida que el usuario mueve la rueda del ratón (efecto Scrollytelling tipo Apple), mostrando 4 etapas de ingeniería y un velocímetro en vivo.
4. Cuadrícula Bento de Ingeniería (4 tarjetas 3D): Tarjetas sobre el Motor V10, Chasis de Carbono, Frenos Cerámicos y Aerodinámica. Haz que cada tarjeta se incline ligeramente en 3D y proyecte un brillo de luz siguiendo la posición del ratón.
5. Simulador de Modos de Manejo: Un panel donde el usuario pueda hacer clic entre 4 modos (Comfort, Auto, Dynamic, Performance) y vea cómo cambian con animaciones suaves las barras de potencia, suspensión y una gráfica curva.
6. Comparador de Precios y Reserva VIP: Un selector donde el usuario marque paquetes extra (Fibra de carbono, Frenos cerámicos, Escape de titanio), vea cómo baja el peso del auto y sube el precio con números animados, y un formulario corto que genere un "Pase VIP de Pista" al enviarse.

PARÁMETROS TÉCNICOS:
Constrúyelo usando Astro 5, Svelte 5 (con animaciones fluidas nativas) y Tailwind CSS v4. Configura todo listo para ejecutarse.
```

---

### 🖱️ Prompt Maestro 2: "El Efecto Apple" (Video controlado por la rueda del ratón)
**¿Cuándo utilizarlo?**
Úsalo cuando **ya tengas una página creada** y quieras agregarle una sección espectacular de **Scrollytelling** (donde un video avanza o retrocede suavemente al hacer scroll sin congelarse ni verse borroso).

```text
Quiero agregar una sección interactiva estilo Apple a mi página donde el video de mi producto (/audi-source.mp4) se controle con el scroll del ratón.

Necesito que lo hagas de forma profesional para que no se trabe ni tenga retraso al subir o bajar:
1. Crea un comando automático con FFmpeg que convierta mi video en una secuencia de imágenes WebP de alta calidad y nitidez.
2. Dibuja esas imágenes dentro de un lienzo (<canvas>) de alta definición que ocupe toda la pantalla mientras haces scroll.
3. Agrega física de suavizado para que cuando el usuario frene el scroll, el movimiento desacelere suavemente con inercia real.
4. Mientras el usuario baja por la sección, haz que cambien 4 tarjetas de texto explicando los beneficios del producto y muestra una barra de progreso en vivo.
5. Incluye un botón arriba para que el usuario pueda elegir entre "Controlar con el Scroll" o "Reproducción Automática".
```

---

### ✨ Prompt Maestro 3: "Inyección de Micro-Interacciones y Efectos 3D"
**¿Cuándo utilizarlo?**
Úsalo cuando **tu página ya tenga toda la información pero se sienta estática o sin vida**. Este prompt le pide a la IA que agregue físicas de movimiento, brillos que siguen al ratón e inclinación 3D en las tarjetas.

```text
Mi página ya tiene buen diseño, pero se siente estática. Quiero que le agregues las animaciones y efectos al pasar el ratón (hover) más modernos y profesionales posibles:

1. Efecto Spotlight y 3D en tarjetas: Haz que todas las tarjetas de información se inclinen sutilmente en 3D hacia donde esté mi puntero y que una luz suave ilumine el borde por donde pasa el ratón.
2. Botones Magnéticos: Haz que los botones principales sientan una ligera atracción magnética hacia el cursor cuando me acerco a ellos, con un rebote suave.
3. Números y Barras Vivas: En lugar de mostrar datos fijos, haz que las barras de porcentaje, métricas y precios se animen suavemente cuando el usuario haga clic o pase el ratón por encima.
4. Rendimiento y Accesibilidad: Asegúrate de que todas las animaciones vayan a 60 cuadros por segundo sin poner lenta la página.
```

---

### 🛠️ Prompt Maestro 4: Plantilla Universal "Rellena los Espacios" (Para tu propio proyecto)
**¿Cuándo utilizarlo?**
Úsalo para **tu ejercicio práctico de clase o para tu propio negocio**. Solo copia este bloque, reemplaza lo que está entre corchetes `[...]` con tu producto (una marca de relojes, zapatillas, arquitectura, cafetería, curso, etc.) y envíaselo a la IA.

```text
Actúa como un diseñador web de élite ganador de premios Awwwards. Crea una landing page interactiva, moderna y en español para [NOMBRE DE TU MARCA O PRODUCTO, ej: un reloj suizo / una cafetería de especialidad / unos auriculares inalámbricos].

1. ESTÉTICA Y COLORES:
- Ambiente: [Ej: Oscuro y futurista / Minimalista cálido color crema / Elegante en negro y dorado].
- Color principal de acento: [Ej: Naranja fuego / Verde esmeralda / Azul cobalto].

2. SECCIONES QUE NECESITO:
- Portada de alto impacto con el video [/hero-loop.mp4] de fondo, título grande y 3 indicadores numéricos clave de mi producto.
- Una sección interactiva donde el usuario pueda hacer scroll para descubrir paso a paso cómo funciona [TU PRODUCTO].
- Una cuadrícula de 4 tarjetas con inclinación 3D al pasar el ratón destacando los mejores materiales o beneficios de [TU PRODUCTO].
- Un personalizador o calculadora interactiva donde el cliente pueda elegir entre 3 versiones o paquetes de [TU PRODUCTO] y ver cómo cambia el resultado o precio en tiempo real con animaciones suaves.
- Un formulario final que al completarse muestre en pantalla una tarjeta de confirmación VIP personalizada con el nombre del cliente.

3. TECNOLOGÍA:
Usa Astro 5, Svelte 5 y Tailwind CSS v4 con animaciones físicas fluidas en todos los botones y tarjetas.
```

---

## 💡 3 Consejos de Oro para Conversar con la IA

1. **Usa verbos de acción, no adjetivos ambiguos:** Decir *"haz que se vea increíble"* confunde a la IA. Decir *"haz que la tarjeta se incline en 3D al mover el ratón y que el precio suba con una animación numérica"* le da una orden exacta.
2. **Dirige por capas (como en el cine):** No intentes corregir 20 detalles al mismo tiempo. Primero genera la página completa (Prompt 1), luego perfecciona la sección del video (Prompt 2) y al final pule los efectos del ratón (Prompt 3).
3. **Corrige describiendo lo que ves:** Si algo falla, no busques en el código. Dile a la IA exactamente lo que tus ojos ven:
   - *"El video de la portada no aparece cuando recargo la página, arréglalo."*
   - *"Los cuadros del video se ven un poco borrosos, súbele la calidad y nitidez al máximo."*

---

## 💻 ¿Cómo descargar y ejecutar este proyecto en tu computadora?

Si quieres correr esta misma página del **Audi R8 V10** en tu máquina:

### 1. Clona el repositorio e instala las dependencias
```bash
git clone https://github.com/gerardosky23/demo-clase1026.git
cd demo-clase1026
npm install
```

### 2. Levanta el servidor de prueba
```bash
npm run dev
```
Abre tu navegador en **`http://localhost:4321`**.

### 3. ¿Cómo cambiar los videos por los tuyos?
Los videos se encuentran dentro de la carpeta **`public/`**:
- **`public/hero-loop.mp4`**: Es el video que se reproduce automáticamente en la primera pantalla (Portada).
- **`public/audi-source.mp4`**: Es el video base para la sección que se controla con el scroll. Si lo reemplazas por otro video `.mp4`, ejecuta en la terminal:
  ```bash
  npm run extract:audi
  ```
  para actualizar automáticamente los fotogramas de alta definición.
