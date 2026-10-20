# 📐 Estándares de Maquetación y Despeje de Subpáginas (Anti-Overlap Rule)

En arquitecturas web modernas con cabecera transparente flotante (`HeaderIsland` posicionado como `absolute` o `fixed` con alturas acumuladas de ~98px en móvil y ~120px en desktop), el mayor riesgo de diseño es la colisión visual entre los enlaces del menú y el título H1 o categoría de la página.

---

## 🚫 Regla de Oro: Prohibido `pt-16` o `pt-20` en Subpáginas

Bajo ninguna circunstancia se debe iniciar una subpágina con un padding convencional de `pt-16` o `pt-20`. Esto causa que el menú tape el texto.

### Estándar Obligatorio de Padding Superior:
```html
pt-44 sm:pt-44 lg:pt-48
```
- **En móvil (<640px):** `pt-44` equivale a 176px. Con un navbar de ~98px (incluyendo banner), deja un margen libre superior de **>78px**, garantizando cero solapamiento.
- **En desktop (>=1024px):** `pt-48` equivale a 192px. Con el navbar extendido a ~120px, deja un margen libre de **>72px**.

---

## 🏛️ Especificación del Componente `<SubpageHero />`

Todo archivo en `src/pages/[categoria]/[slug].astro` debe iniciar su contenido invocando `<SubpageHero />`:

```astro
---
interface Props {
  category: string;
  categoryHref?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  badge?: string;
}

const {
  category,
  categoryHref = "#",
  title,
  description,
  ctaText = "Solicitar información",
  ctaHref = "/contacto",
  badge
} = Astro.props;
---

<section class="relative bg-[#161618] text-white pt-44 sm:pt-44 lg:pt-48 pb-20 overflow-hidden border-b border-white/10">
  <!-- Subtle decorative ambient background glows -->
  <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-1/2 -right-24 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
    <!-- Breadcrumb / Category Pill -->
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-primary mb-6">
      <a href={categoryHref} class="hover:underline opacity-80">{category}</a>
      <span class="opacity-40">/</span>
      <span>{badge || "Solución Oficial"}</span>
    </div>

    <!-- H1 Title -->
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
      {title}
    </h1>

    <!-- Lead Paragraph -->
    <p class="text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed mb-8">
      {description}
    </p>

    <!-- CTAs -->
    <div class="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
      <a
        href={ctaHref}
        class="px-6 py-3 rounded-xl bg-brand-primary text-slate-900 font-bold text-sm hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all"
      >
        {ctaText}
      </a>
      <a
        href="/contacto"
        class="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
      >
        Hablar con un consultor
      </a>
    </div>
  </div>
</section>
```

---

## 🍱 Grilla Bento para Secciones de Contenido

Para presentar características de forma visual y moderna, la skill empleará el patrón **Bento Grid**:

```html
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Bento Card 1: 2 columnas span -->
      <div class="md:col-span-2 p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-brand-primary">Característica Clave</span>
          <h3 class="text-2xl font-bold text-slate-900 mt-2 mb-4">Automatización de Flujos</h3>
          <p class="text-slate-600 text-sm leading-relaxed">Conexión directa sin intervención manual.</p>
        </div>
        <!-- Mockup o ilustración -->
      </div>

      <!-- Bento Card 2: 1 columna span -->
      <div class="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-brand-cyan">Métrica de Éxito</span>
          <div class="text-5xl font-extrabold my-4">99.9%</div>
          <p class="text-white/70 text-sm">Disponibilidad y cumplimiento normativo garantizado.</p>
        </div>
      </div>

    </div>
  </div>
</section>
```
