<script lang="ts">
  import emblaCarousel from 'embla-carousel-svelte';
  import type { EmblaCarouselType } from 'embla-carousel';

  const articles = [
    {
      title: 'Factura, boleta o nota de crédito: qué comprobante emitir en cada caso según SUNAT',
      category: 'Facturación electrónica',
      date: '04/12/2025',
      desc: 'Elegir mal un comprobante cuesta dinero. Si emites una boleta a una empresa, tu cliente pierde el crédito fiscal y te pedirá que la anules. En esta guía explicamos la diferencia entre factura y boleta, cuándo corresponde una nota de crédito y cómo evitar los errores que más rechazos generan ante SUNAT.',
      slug: 'diferencia-entre-factura-y-boleta'
    },
    {
      title: 'El rol del gerente en 2026: menos control, más estrategia',
      category: 'Gestión y transformación digital',
      date: '04/12/2025',
      desc: 'Durante décadas, el rol del gerente estuvo asociado al control: supervisar tareas, validar resultados, autorizar decisiones y asegurar que los procesos se cumplan. En 2026, las empresas líderes delegan la supervisión mecánica a Odoo para concentrarse en la rentabilidad.',
      slug: 'el-rol-del-gerente-en-2026-menos-control-mas-estrategia'
    },
    {
      title: 'Cómo se están preparando las empresas para competir en 2026',
      category: 'Estrategia y ERP',
      date: '28/11/2025',
      desc: 'El mercado no perdona a quienes operan con islas de información. Conoce cómo la integración de inventario, finanzas y ventas en una plataforma unificada permite responder a las demandas del mercado con máxima velocidad.',
      slug: 'como-se-estan-preparando-las-empresas-para-competir-en-2026'
    }
  ];

  let emblaApi = $state<EmblaCarouselType | null>(null);
  let selectedIndex = $state(0);
  let scrollSnaps = $state<number[]>([]);
  let canScrollPrev = $state(false);
  let canScrollNext = $state(false);

  function onInit(event: CustomEvent<EmblaCarouselType>) {
    emblaApi = event.detail;
    scrollSnaps = emblaApi.scrollSnapList();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }

  function onSelect() {
    if (!emblaApi) return;
    selectedIndex = emblaApi.selectedScrollSnap();
    canScrollPrev = emblaApi.canScrollPrev();
    canScrollNext = emblaApi.canScrollNext();
  }

  function scrollPrev() {
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    emblaApi?.scrollNext();
  }

  function scrollTo(index: number) {
    emblaApi?.scrollTo(index);
  }
</script>

<section class="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-brand-border text-brand-dark overflow-hidden">
  <div class="max-w-7xl mx-auto">
    <!-- Header with Link and controls -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
      <div class="max-w-xl">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-brand-dark tracking-tight mb-3">
          Lo último del <span class="font-normal text-brand-magenta">blog</span>
        </h2>
        <p class="text-brand-muted text-base font-light">
          Artículos sobre Odoo, gestión y tecnología para empresas del Perú: casos, buenas prácticas y novedades.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <a
          href="/blog"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-magenta hover:underline"
        >
          <span>Ver todos los artículos</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>

        <!-- Arrows -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-brand-dark hover:bg-neutral-100 hover:border-brand-magenta transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            onclick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Artículo anterior"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-brand-dark hover:bg-neutral-100 hover:border-brand-magenta transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            onclick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Siguiente artículo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Embla Viewport -->
    <div
      class="overflow-hidden cursor-grab active:cursor-grabbing mb-8"
      use:emblaCarousel={{
        options: {
          loop: false,
          align: 'start',
          slidesToScroll: 1
        }
      }}
      onemblaInit={onInit}
    >
      <div class="flex -ml-6">
        {#each articles as art}
          <div class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6 min-w-0">
            <article class="h-full p-8 rounded-2xl bg-white border border-brand-border flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div>
                <div class="flex items-center justify-between gap-2 mb-4">
                  <span class="text-[11px] font-semibold text-brand-dark bg-neutral-100 px-2.5 py-1 rounded">
                    {art.category}
                  </span>
                  <span class="text-xs text-brand-muted">{art.date}</span>
                </div>

                <h3 class="text-lg sm:text-xl font-light text-brand-dark mb-4 leading-snug group-hover:text-brand-magenta transition-colors line-clamp-2">
                  <a href={`/blog/${art.slug}`}>{art.title}</a>
                </h3>

                <p class="text-xs sm:text-sm text-brand-muted leading-relaxed font-light mb-6 line-clamp-3">
                  {art.desc}
                </p>
              </div>

              <div class="pt-4 border-t border-neutral-100">
                <a
                  href={`/blog/${art.slug}`}
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-magenta group-hover:underline"
                >
                  <span>Leer artículo completo</span>
                  <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </article>
          </div>
        {/each}
      </div>
    </div>

    <!-- Dots -->
    <div class="flex items-center justify-center gap-2">
      {#each scrollSnaps as _, i}
        <button
          type="button"
          class="h-2 rounded-full transition-all duration-300 {selectedIndex === i ? 'w-8 bg-brand-magenta' : 'w-2 bg-neutral-300 hover:bg-neutral-400'}"
          onclick={() => scrollTo(i)}
          aria-label={`Ir a artículo ${i + 1}`}
        ></button>
      {/each}
    </div>
  </div>
</section>
