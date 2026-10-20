# 📄 BRIEF DEL CLIENTE: Plantilla de Entrada Estándar

Utiliza esta plantilla para definir la identidad, oferta comercial y arquitectura web de cualquier nuevo cliente o negocio. La skill `site-craft-pro` consumirá este archivo para generar el sitio web completo con arquitectura Astro 5 + Svelte 5 + Tailwind v4.

---

```markdown
# BRIEF DEL CLIENTE: [Nombre de la Empresa o Marca]

## 1. Identidad de Marca y Design Tokens
- Nombre Comercial: "Ejemplo S.A.C."
- Eslogan / Propuesta de Valor: "Transformando negocios con soluciones tecnológicas de vanguardia."
- Tono Visual: Corporativo / Tecnológico / Minimalista / Sofisticado / Alta Fidelidad
- Paleta de Colores:
  * Primary Accent: #009ce0 (o color de marca principal)
  * Secondary Accent: #e11d48 (o color de contraste para CTAs destacados)
  * Dark Base (Headers, Hero, Subpage Hero): #161618
  * Dark Secondary (Footer, Tarjetas oscuras): #202124
  * Light Background (Cuerpo de secciones): #ffffff o #f8fafc
  * Text Ink Principal: #0f172a
  * Text Muted / Subtítulos: #64748b
- Tipografía Sugerida: Inter, Plus Jakarta Sans, Outfit o Montserrat
- Logotipos:
  * Logo Dark Mode (para Navbar y Footer oscuros): /uploads/[slug]/logo-blanco.png
  * Logo Light Mode (para fondos blancos): /uploads/[slug]/logo-negro.png
  * Favicon: /favicon.ico

## 2. Catálogo de Productos y Servicios
### Oferta 1: [Nombre del Producto / Solución]
- Categoría: [Solución / Servicio / Software / Consultoría]
- Resumen en 1 línea: [Propuesta directa de valor]
- Descripción detallada: [Explicación de características, cómo resuelve el dolor del cliente]
- Puntos Clave / Beneficios:
  * Beneficio 1 (con métrica o resultado medible)
  * Beneficio 2
  * Beneficio 3
- Llamada a la acción (CTA): "Solicitar Demostración" -> Enlace: /contacto

### Oferta 2: [Nombre del Segundo Producto / Solución]
...

### Oferta 3: [Nombre del Tercer Producto / Solución]
...

### Preguntas Frecuentes (FAQ):
1. **Pregunta 1:** ¿Cómo se implementa el servicio?
   - **Respuesta:** Detalle claro y directo del proceso de trabajo o tiempos de entrega.
2. **Pregunta 2:** ¿Qué garantías o soporte incluye?
   - **Respuesta:** Cobertura de soporte, SLAs y canales de atención.
3. **Pregunta 3:** ¿Cómo es el modelo de precios o contratación?
   - **Respuesta:** Explicación transparente de planes o esquemas a medida.

## 3. Arquitectura Web y Megamenú
### Navegación Superior (Desktop Header & Mobile Drawer)
- **Menú Desplegable 1:** "Soluciones"
  - Columnas: 2 a 4 columnas temáticas
  - Elementos por columna: [Título, Icono SVG sugerido, Descripción corta, Enlace]
- **Menú Desplegable 2:** "Servicios"
  - Elementos destacados con tarjetas visuales y enlaces directos
- **Enlaces Directos en Barra:**
  * "Nosotros" -> /nosotros
  * "Casos de Éxito" -> /casos
  * "Blog / Recursos" -> /blog
- **Botón CTA Principal:** "Hablemos" o "Pedir Demo" -> /contacto

### Índice de Rutas a Generar:
- `/`: Página principal con Hero impactante, Bento grid de soluciones, carrusel interactivo, estadísticas, testimonios/clientes, FAQ y formulario de contacto.
- `/soluciones/[slug]`: Páginas detalladas para cada producto con `<SubpageHero />` anti-solapamiento.
- `/servicios/[slug]`: Páginas de servicio con alcance, entregables y formulario de cotización.
- `/nosotros`: Historia, equipo, valores y presencia geográfica.
- `/contacto`: Formulario reactivo en Svelte 5 con validación en vivo y honeypot.
- `/privacidad`: Términos de privacidad y protección de datos.

## 4. Configuración del Backoffice Multitenant (Opcional)
- Site ID / Slug: "ejemplo-pe"
- Teléfono de Contacto: "+51 987 654 321"
- Enlace directo de WhatsApp: "https://wa.me/51987654321?text=Hola,%20solicito%20información"
- Backoffice Host URL: "http://localhost:8090" (o dominio de producción)
- Chatwoot Token: "CW_WIDGET_TOKEN" (si aplica)
```
