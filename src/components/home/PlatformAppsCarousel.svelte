<script lang="ts">
  import emblaCarousel from 'embla-carousel-svelte';
  import Autoplay from 'embla-carousel-autoplay';
  import type { EmblaCarouselType } from 'embla-carousel';

  interface AreaSlide {
    title: string;
    img: string;
    href: string;
    items: string[];
  }

  const slides: AreaSlide[] = [
    {
      title: 'Finanzas',
      img: '/areas/finanzas.webp',
      href: '/funcionalidades/finanzas',
      items: [
        'Contabilidad y libros electrónicos',
        'Facturación electrónica',
        'Tesorería y bancos',
        'Estados financieros',
        'Activos fijos',
        'Presupuestos'
      ]
    },
    {
      title: 'Ventas',
      img: '/areas/ventas.webp',
      href: '/funcionalidades/ventas',
      items: [
        'CRM',
        'Cotizaciones y pedidos',
        'Punto de venta',
        'Listas de precios',
        'Suscripciones',
        'Comisiones'
      ]
    },
    {
      title: 'Cadena de suministro',
      img: '/areas/suministro.webp',
      href: '/funcionalidades/compras-inventario',
      items: [
        'Compras',
        'Inventario y kardex',
        'Importaciones',
        'Varios almacenes',
        'Producción',
        'Mantenimiento'
      ]
    },
    {
      title: 'Recursos humanos',
      img: '/areas/recursos-humanos.webp',
      href: '/funcionalidades/rrhh',
      items: [
        'Planillas',
        'Asistencias',
        'Vacaciones y permisos',
        'Reclutamiento',
        'Evaluaciones',
        'Gastos del personal'
      ]
    },
    {
      title: 'Servicios',
      img: '/areas/servicios.webp',
      href: '/funcionalidades/servicios-proyectos',
      items: [
        'Proyectos y tareas',
        'Partes de horas',
        'Servicio de campo',
        'Mesa de ayuda',
        'Planificación',
        'Facturación por avance'
      ]
    },
    {
      title: 'Productividad',
      img: '/areas/productividad.webp',
      href: '/funcionalidades/servicios-proyectos',
      items: [
        'Documentos',
        'Firma electrónica',
        'Conocimiento',
        'Hojas de cálculo (BI)',
        'Conversaciones',
        'Aprobaciones'
      ]
    },
    {
      title: 'Sitio web',
      img: '/areas/sitio-web.webp',
      href: '/funcionalidades/sitio-web',
      items: [
        'Página web',
        'Tienda en línea',
        'Pagos en línea',
        'Blog',
        'Chat en vivo',
        'Formularios'
      ]
    },
    {
      title: 'Marketing',
      img: '/areas/marketing.webp',
      href: '/funcionalidades/ventas',
      items: [
        'Email marketing',
        'Automatización',
        'Redes sociales',
        'Eventos',
        'Encuestas',
        'SMS'
      ]
    }
  ];

  let emblaApi = $state<EmblaCarouselType | null>(null);
  let selectedIndex = $state(0);
  let scrollSnaps = $state<number[]>([]);
  let canScrollPrev = $state(true);
  let canScrollNext = $state(true);

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

<section id="soluciones" class="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#191b1d] text-white overflow-hidden" data-bs-theme="dark">
  <div class="max-w-[1300px] mx-auto">
    <!-- Header with controls matching flexone.pe -->
    <div class="grid grid-cols-1 md:grid-cols-12 items-end justify-between gap-6 mb-12">
      <div class="md:col-span-7 lg:col-span-6">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight">
          Todo tu negocio en una <span class="font-normal text-brand-magenta">sola plataforma</span>
        </h2>
      </div>

      <div class="md:col-span-5 lg:col-span-5 lg:col-start-8">
        <p class="text-white/70 text-sm sm:text-base leading-relaxed font-light mb-4">
          Queremos que tu gente deje de perder tiempo buscando datos y empiece a tomar decisiones con información real.<br class="hidden sm:inline" />
          ¿Qué gestionarás con nuestro ERP?
        </p>

        <!-- Slider Arrows -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            onclick={scrollPrev}
            aria-label="Diapositiva anterior"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            onclick={scrollNext}
            aria-label="Siguiente diapositiva"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Embla Carousel Viewport with exact flexone.pe cards and hover overlay -->
    <div
      class="overflow-hidden cursor-grab active:cursor-grabbing mb-8 -mx-3"
      use:emblaCarousel={{
        options: {
          loop: true,
          align: 'start',
          slidesToScroll: 1
        },
        plugins: [Autoplay({ delay: 6000, stopOnInteraction: true })]
      }}
      onemblaInit={onInit}
    >
      <div class="flex">
        {#each slides as slide}
          <div class="flex-[0_0_85%] sm:flex-[0_0_46%] md:flex-[0_0_36%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] px-3 min-w-0">
            <div class="relative rounded-2xl overflow-hidden bg-[#242629] border border-white/[0.08] shadow-lg group aspect-[875/1050]">
              <!-- Base Area Image (scales & blurs on hover) -->
              <img
                src={slide.img}
                alt={slide.title}
                width="875"
                height="1050"
                class="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:blur-[5px] group-hover:brightness-[0.4]"
                loading="lazy"
                decoding="async"
              />

              <!-- Hover Element Overlay (Reveals module checklist & CTA) -->
              <div
                class="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between items-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none group-hover:pointer-events-auto bg-black/45 backdrop-blur-[3px]"
              >
                <!-- Title inside hover -->
                <div class="pt-2">
                  <h3 class="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {slide.title}
                  </h3>
                </div>

                <!-- Feature checklist -->
                <ul class="w-full space-y-2 text-left my-auto px-2">
                  {#each slide.items as item}
                    <li class="flex items-center text-xs sm:text-[13px] text-white/90 font-light leading-snug">
                      <svg class="w-4 h-4 text-brand-magenta flex-shrink-0 mr-2" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.637-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z"/>
                      </svg>
                      <span>{item}</span>
                    </li>
                  {/each}
                </ul>

                <!-- Button CTA -->
                <div class="pb-2 w-full">
                  <a
                    href={slide.href}
                    class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#191b1d] font-semibold text-xs hover:bg-neutral-100 hover:shadow-lg transition-all"
                  >
                    <span>Ver más sobre {slide.title}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Dots Navigation -->
    <div class="flex items-center justify-center gap-2 mb-10">
      {#each scrollSnaps as _, i}
        <button
          type="button"
          class="h-1.5 rounded-full transition-all duration-300 {selectedIndex === i ? 'w-8 bg-brand-magenta' : 'w-2 bg-white/20 hover:bg-white/40'}"
          onclick={() => scrollTo(i)}
          aria-label={`Ir a diapositiva ${i + 1}`}
        ></button>
      {/each}
    </div>

    <!-- Bottom Contact Bar matching flexone.pe -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
      <div class="flex items-center gap-3">
        <span class="text-xl">💬</span>
        <span class="text-sm text-white/80 font-light text-center sm:text-left">
          ¿Tienes un proceso que no encaja en ninguna de estas áreas?
        </span>
      </div>
      <a
        href="/contacto"
        class="flex-shrink-0 px-5 py-2.5 rounded-lg bg-brand-cyan text-[#06222b] text-xs font-bold uppercase tracking-wider hover:bg-[#2ac5f5] transition-colors shadow-sm"
      >
        Cuéntanos tu requerimiento
      </a>
    </div>
  </div>
</section>
