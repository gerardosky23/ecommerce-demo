<script lang="ts">
  import emblaCarousel from 'embla-carousel-svelte';
  import type { EmblaCarouselType } from 'embla-carousel';

  const cards = [
    {
      title: 'Contabilidad y cierre',
      desc: 'Libros electrónicos para SUNAT, cierre mensual automático, balance de comprobación y control estricto de detracciones, retenciones y SIRE.',
      bullets: ['Libros electrónicos para SUNAT (SIRE / PLE)', 'Cierre mensual y estados financieros', 'Detracciones, retenciones y percepciones'],
      href: '/localizacion/contabilidad',
      iconColor: 'bg-brand-magenta/10 text-brand-magenta'
    },
    {
      title: 'Facturación electrónica',
      desc: 'Emisión inmediata de facturas, boletas, notas de crédito y guías de remisión UBL 2.1 con OSE certificado o conexión directa.',
      bullets: ['Facturas, boletas y notas electrónicas', 'Con OSE o PSE homologado', 'Consulta en línea de RUC y DNI'],
      href: '/localizacion/facturacion-electronica',
      iconColor: 'bg-rose-500/10 text-rose-600'
    },
    {
      title: 'Planillas (Planiflex)',
      desc: 'Módulo integral de recursos humanos para calcular gratificaciones, CTS, vacaciones y generar archivos para PLAME y AFPnet.',
      bullets: ['Planilla y boletas de pago por correo', 'Control de asistencias y vacaciones', 'Exportación automática a PDT Plame y AFPnet'],
      href: '/planiflex',
      iconColor: 'bg-pink-500/10 text-pink-600'
    },
    {
      title: 'Kardex e inventario',
      desc: 'Kardex valorizado permanente según formato 13.1 de la SUNAT bajo método de costo promedio ponderado.',
      bullets: ['Kardex 13.1 oficial para auditorías', 'Cálculo de costo de ventas automático', 'Trazabilidad por lote y serie'],
      href: '/localizacion/kardex-valorizado',
      iconColor: 'bg-brand-cyan/15 text-cyan-700'
    },
    {
      title: 'Importaciones',
      desc: 'Prorrateo automatizado de gastos de importación (flete, seguro, aduanas) para obtener el costo unitario real en almacén.',
      bullets: ['Registro y liquidación de DUA / DAM', 'Prorrateo por peso, volumen o valor', 'Costeo de inventario exacto'],
      href: '/localizacion/importaciones',
      iconColor: 'bg-amber-500/10 text-amber-600'
    },
    {
      title: 'Caja chica y rendiciones',
      desc: 'Administración de fondos fijos y entregas a rendir con validación de comprobantes para evitar gastos no deducibles.',
      bullets: ['Rendición vinculada a facturas SUNAT', 'Reposición de fondos con 1 clic', 'Reporte de gastos por centro de costos'],
      href: '/funcionalidades/tesoreria',
      iconColor: 'bg-emerald-500/10 text-emerald-600'
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

<section id="localizacion" class="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-y border-brand-border overflow-hidden">
  <div class="max-w-7xl mx-auto">
    <!-- Header with controls -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div class="max-w-3xl">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-brand-dark tracking-tight mb-4">
          La normativa peruana, <span class="font-normal text-brand-magenta">resuelta dentro del sistema</span>
        </h2>
        <p class="text-brand-muted text-base sm:text-lg leading-relaxed font-light">
          Cada área tiene sus reglas. Flexone las tiene implementadas y probadas en empresas reales, para que contabilidad y RR. HH. trabajen dentro de Odoo, sin hojas de cálculo aparte.
        </p>
      </div>

      <!-- Navigation Arrows -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="w-11 h-11 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-brand-dark hover:bg-neutral-100 hover:border-brand-magenta transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          onclick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Anterior normativa"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          class="w-11 h-11 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-brand-dark hover:bg-neutral-100 hover:border-brand-magenta transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          onclick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Siguiente normativa"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
        {#each cards as c}
          <div class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6 min-w-0">
            <article class="h-full p-8 rounded-2xl bg-white border border-brand-border flex flex-col justify-between hover:shadow-lg hover:border-brand-magenta/40 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div class={`w-12 h-12 rounded-xl ${c.iconColor} flex items-center justify-center mb-6`}>
                  <svg class="w-6 h-6 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 class="text-xl font-medium text-brand-dark mb-3">{c.title}</h3>
                <p class="text-brand-muted text-sm leading-relaxed mb-6 font-light">{c.desc}</p>

                <ul class="space-y-2 mb-8">
                  {#each c.bullets as b}
                    <li class="flex items-center gap-2 text-xs text-brand-dark font-light">
                      <span class="w-1.5 h-1.5 rounded-full bg-brand-magenta"></span>
                      <span>{b}</span>
                    </li>
                  {/each}
                </ul>
              </div>

              <div class="pt-4 border-t border-neutral-100">
                <a href={c.href} class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-magenta hover:text-brand-magenta-dark transition-colors">
                  <span>Conoce más</span>
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

    <!-- Dots indicator -->
    <div class="flex items-center justify-center gap-2">
      {#each scrollSnaps as _, i}
        <button
          type="button"
          class="h-2 rounded-full transition-all duration-300 {selectedIndex === i ? 'w-8 bg-brand-magenta' : 'w-2 bg-neutral-300 hover:bg-neutral-400'}"
          onclick={() => scrollTo(i)}
          aria-label={`Ir a tarjeta ${i + 1}`}
        ></button>
      {/each}
    </div>
  </div>
</section>
