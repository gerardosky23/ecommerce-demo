<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import NavIcon from './NavIcon.svelte';

  let scrollY = $state(0);
  let activeDropdown = $state<string | null>(null);
  let isMobileOpen = $state(false);
  let mobileSection = $state<string | null>(null);
  let isBannerVisible = $state(true);
  let closeTimeout: any = null;

  let isScrolled = $derived(scrollY > 50);

  $effect(() => {
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollY = window.scrollY;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        activeDropdown = null;
        isMobileOpen = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  });

  function openMenu(name: string) {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    activeDropdown = name;
  }

  function scheduleClose() {
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      activeDropdown = null;
    }, 120);
  }

  function toggleDropdown(name: string) {
    activeDropdown = activeDropdown === name ? null : name;
  }

  function toggleMobileSection(name: string) {
    mobileSection = mobileSection === name ? null : name;
  }
</script>

<!-- Outer Header Wrapper: absolute at top, transitions to fixed on scroll -->
<header
  class="w-full z-50 transition-all duration-300 {isScrolled ? 'fixed top-0 left-0 bg-[#161618] border-b border-white/10 shadow-2xl' : 'absolute top-0 left-0 bg-transparent'}"
>
  <!-- 1. Top Announcement Banner -->
  {#if isBannerVisible && !isScrolled}
    <div data-content="banner" class="bg-[#d6255c] text-white text-[11px] sm:text-[13px] py-1.5 sm:py-2 px-3 sm:px-4 transition-all">
      <div class="max-w-[1300px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div class="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-center font-medium leading-tight">
          <NavIcon name="stars" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" />
          <span data-content="banner-text" class="hidden sm:inline">Odoo 20 ya está disponible. Lo mostramos con los datos de tu empresa, sin compromiso.</span>
          <span data-content="banner-text" class="sm:hidden">Odoo 20 ya disponible para tu empresa.</span>
          <a
            data-content="banner-cta"
            href="/contacto"
            class="ml-1 sm:ml-2 inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-white text-[#191b1d] font-semibold text-[11px] sm:text-xs hover:bg-neutral-100 transition-colors shadow-sm flex-shrink-0"
          >
            Pedir demostración
          </a>
        </div>
        <button
          type="button"
          onclick={() => (isBannerVisible = false)}
          class="text-white/70 hover:text-white p-1 transition-colors flex-shrink-0"
          aria-label="Cerrar aviso"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- 2. Main Navigation Bar -->
  <nav
    class="relative transition-all duration-300 {isScrolled ? 'h-16' : 'h-16 sm:h-20 lg:h-24'}"
    aria-label="Navegación principal"
  >
    <div class="max-w-[1300px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-6">
      <!-- Logo -->
      <a href="/" class="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-cyan rounded p-1" aria-label="Flexone inicio">
        <img
          data-brand="logo"
          data-brand-variant="dark"
          src="/images/flexone/logo-negativo-480.webp"
          alt="Flexone Logo"
          width="135"
          height="35"
          class="w-auto max-w-[180px] object-contain transition-all duration-300 {isScrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-9'}"
          loading="eager"
        />
      </a>

      <!-- Desktop Nav Links -->
      <div class="hidden lg:flex items-center gap-1 xl:gap-2">
        <!-- Trigger 1: Soluciones -->
        <div
          class="relative"
          onmouseenter={() => openMenu('soluciones')}
          onmouseleave={scheduleClose}
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium transition-colors {activeDropdown === 'soluciones' ? 'text-brand-cyan' : 'text-white/85 hover:text-white'}"
            aria-expanded={activeDropdown === 'soluciones'}
            onclick={() => toggleDropdown('soluciones')}
          >
            <span>Soluciones</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200 {activeDropdown === 'soluciones' ? 'rotate-180 text-brand-cyan' : 'text-white/60'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Trigger 2: Localización Perú -->
        <div
          class="relative"
          onmouseenter={() => openMenu('localizacion')}
          onmouseleave={scheduleClose}
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium transition-colors {activeDropdown === 'localizacion' ? 'text-brand-cyan' : 'text-white/85 hover:text-white'}"
            aria-expanded={activeDropdown === 'localizacion'}
            onclick={() => toggleDropdown('localizacion')}
          >
            <span>Localización Perú</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200 {activeDropdown === 'localizacion' ? 'rotate-180 text-brand-cyan' : 'text-white/60'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Trigger 3: Industrias -->
        <div
          class="relative"
          onmouseenter={() => openMenu('industrias')}
          onmouseleave={scheduleClose}
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium transition-colors {activeDropdown === 'industrias' ? 'text-brand-cyan' : 'text-white/85 hover:text-white'}"
            aria-expanded={activeDropdown === 'industrias'}
            onclick={() => toggleDropdown('industrias')}
          >
            <span>Industrias</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200 {activeDropdown === 'industrias' ? 'rotate-180 text-brand-cyan' : 'text-white/60'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Trigger 4: Servicios -->
        <div
          class="relative"
          onmouseenter={() => openMenu('servicios')}
          onmouseleave={scheduleClose}
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium transition-colors {activeDropdown === 'servicios' ? 'text-brand-cyan' : 'text-white/85 hover:text-white'}"
            aria-expanded={activeDropdown === 'servicios'}
            onclick={() => toggleDropdown('servicios')}
          >
            <span>Servicios</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200 {activeDropdown === 'servicios' ? 'rotate-180 text-brand-cyan' : 'text-white/60'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Trigger 5: Recursos -->
        <div
          class="relative"
          onmouseenter={() => openMenu('recursos')}
          onmouseleave={scheduleClose}
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium transition-colors {activeDropdown === 'recursos' ? 'text-brand-cyan' : 'text-white/85 hover:text-white'}"
            aria-expanded={activeDropdown === 'recursos'}
            onclick={() => toggleDropdown('recursos')}
          >
            <span>Recursos</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200 {activeDropdown === 'recursos' ? 'rotate-180 text-brand-cyan' : 'text-white/60'}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Desktop Right Controls -->
      <div class="hidden lg:flex items-center gap-4">
        <!-- Theme Toggle Icon Mockup (Half black / half white circle) -->
        <div class="w-5 h-5 rounded-full border border-white/40 overflow-hidden flex cursor-pointer opacity-80 hover:opacity-100 transition-opacity" title="Tema">
          <div class="w-1/2 h-full bg-white"></div>
          <div class="w-1/2 h-full bg-transparent"></div>
        </div>

        <!-- CTA Button -->
        <a
          href="/contacto"
          class="px-5 py-2.5 rounded-md bg-brand-cyan text-[#06222b] font-semibold text-[13px] hover:bg-[#2ac5f5] hover:shadow-[0_0_20px_rgba(42,197,245,0.4)] transition-all"
        >
          Hablemos
        </a>
      </div>

      <!-- Mobile Hamburger Button -->
      <div class="lg:hidden flex items-center">
        <button
          type="button"
          class="p-2 text-white/90 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          onclick={() => (isMobileOpen = !isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-label="Abrir menú de navegación"
        >
          <svg class="w-6 h-6 transition-transform duration-200 {isMobileOpen ? 'rotate-90 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if isMobileOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- 3. Desktop Full-Width Mega Menus Container -->
  {#if activeDropdown}
    <div
      transition:fade={{ duration: 140 }}
      class="hidden lg:block absolute top-full left-0 right-0 z-50 pt-2"
      onmouseenter={() => { if (closeTimeout) clearTimeout(closeTimeout); }}
      onmouseleave={scheduleClose}
      role="region"
      aria-label="Submenú desplegable"
    >
      <div class="max-w-[1300px] mx-auto px-4 sm:px-6">
        <!-- ======================= 1. SOLUCIONES ======================= -->
        {#if activeDropdown === 'soluciones'}
          <div class="bg-[#191b1d] border border-white/[0.08] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7">
            <div class="grid grid-cols-12 gap-8">
              <!-- Columna 1: Más soluciones -->
              <div class="col-span-3 flex flex-col justify-between border-r border-white/5 pr-4">
                <div>
                  <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Más soluciones</h3>
                  <ul class="space-y-1">
                    <li>
                      <a href="/funcionalidades/tesoreria" class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                        <NavIcon name="bank" class="w-4 h-4 text-white/60" />
                        <span>Tesorería</span>
                      </a>
                    </li>
                    <li>
                      <a href="/funcionalidades/ventas" class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                        <NavIcon name="graph" class="w-4 h-4 text-white/60" />
                        <span>Ventas y CRM</span>
                      </a>
                    </li>
                    <li>
                      <a href="/funcionalidades/compras-inventario" class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                        <NavIcon name="box" class="w-4 h-4 text-white/60" />
                        <span>Compras e inventario</span>
                      </a>
                    </li>
                    <li>
                      <a href="/funcionalidades/sitio-web" class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                        <NavIcon name="globe" class="w-4 h-4 text-white/60" />
                        <span>Sitio web y e-commerce</span>
                      </a>
                    </li>
                    <li>
                      <a href="/funcionalidades/servicios-proyectos" class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                        <NavIcon name="kanban" class="w-4 h-4 text-white/60" />
                        <span>Servicios y proyectos</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="mt-4 pt-3 border-t border-white/5">
                  <a href="/contacto" class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0c2a33] border border-cyan-500/30 text-xs font-medium text-brand-cyan hover:bg-[#10343f] transition-colors">
                    <NavIcon name="stars" class="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Odoo 20, listo para probar</span>
                  </a>
                </div>
              </div>

              <!-- Columna 2: Principales (Tarjetas enriquecidas) -->
              <div class="col-span-5 space-y-3">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Principales</h3>
                
                <!-- Tarjeta 1: Finanzas -->
                <a href="/funcionalidades/finanzas" class="group flex items-center justify-between p-3.5 rounded-lg bg-[#202226] hover:bg-[#26282d] border border-white/5 hover:border-white/10 transition-all">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan transition-colors">
                      <NavIcon name="cash-coin" class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="text-[15px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Finanzas y contabilidad</div>
                      <p class="text-xs text-white/60 mt-0.5 line-clamp-1">Contabilidad con localización peruana, SUNAT, detracciones y tesorería.</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-white/40 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <!-- Tarjeta 2: RR. HH. y planillas (Destacado) -->
                <a href="/funcionalidades/rrhh" class="group flex items-center justify-between p-3.5 rounded-lg bg-[#14262d] hover:bg-[#172f37] border border-brand-cyan/70 shadow-[0_0_15px_rgba(42,197,245,0.15)] transition-all">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center flex-shrink-0 text-brand-cyan">
                      <NavIcon name="people" class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-[15px] font-semibold text-white group-hover:text-brand-cyan transition-colors">RR. HH. y planillas</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-cyan text-[#06222b]">Destacado</span>
                      </div>
                      <p class="text-xs text-white/60 mt-0.5 line-clamp-1">Planilla peruana, asistencias, beneficios sociales y reclutamiento.</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-brand-cyan group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <!-- Tarjeta 3: Manufactura -->
                <a href="/funcionalidades/manufactura" class="group flex items-center justify-between p-3.5 rounded-lg bg-[#202226] hover:bg-[#26282d] border border-white/5 hover:border-white/10 transition-all">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan transition-colors">
                      <NavIcon name="gear" class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="text-[15px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Manufactura</div>
                      <p class="text-xs text-white/60 mt-0.5 line-clamp-1">Órdenes de fabricación, listas de materiales y costeo.</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-white/40 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              <!-- Columna 3: Tarjeta destacada con Banner -->
              <div class="col-span-4 pl-4 border-l border-white/5 flex flex-col justify-between">
                <div>
                  <div class="rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-neutral-900 border border-white/10">
                    <img
                      src="/banners/elegir-aplicaciones-odoo.webp"
                      alt="Elegir aplicaciones Odoo"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p class="text-xs sm:text-[13px] text-white/80 leading-relaxed">
                    Una demostración con datos del rubro de la empresa, sin compromiso.
                  </p>
                </div>
                <div class="mt-3">
                  <a href="/contacto" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-cyan hover:underline group">
                    <span>Pedir demostración</span>
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- ======================= 2. LOCALIZACIÓN PERÚ ======================= -->
        {#if activeDropdown === 'localizacion'}
          <div class="bg-[#191b1d] border border-white/[0.08] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7">
            <div class="grid grid-cols-12 gap-8">
              <!-- Columna 1: Contabilidad y SUNAT -->
              <div class="col-span-4 space-y-2 border-r border-white/5 pr-4">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Contabilidad y SUNAT</h3>
                
                <a href="/localizacion/contabilidad" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="journal-check" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Contabilidad que cuadra</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Libros electrónicos, cierre mensual y estados financieros.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/localizacion/facturacion-electronica" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="receipt" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Facturación electrónica</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Facturas, boletas y notas con OSE o PSE como Nubefact.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/localizacion/detracciones-retenciones" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="percent" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Detracciones y retenciones</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Detracciones, retenciones, percepciones y SIRE.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/localizacion/contabilidad#multimoneda" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="currency" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Multimoneda</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Operaciones en dólares con el tipo de cambio de SUNAT.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>
              </div>

              <!-- Columna 2: Operación y personas -->
              <div class="col-span-4 space-y-2 border-r border-white/5 pr-4">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Operación y personas</h3>

                <a href="/localizacion/planillas" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="people" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Planillas</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Planilla, asistencias, vacaciones y boletas de pago.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/localizacion/kardex-valorizado" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="box" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Kardex valorizado</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Inventario permanente valorizado, listo para SUNAT.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/localizacion/importaciones" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="globe" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Importaciones</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Fletes, seguros y aduanas en el costo real del producto.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>

                <a href="/funcionalidades/tesoreria#rendiciones" class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:text-brand-cyan">
                      <NavIcon name="wallet" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Caja chica y rendiciones</div>
                      <p class="text-[11px] text-white/60 line-clamp-1">Rendiciones con foto desde el celular, directo a contabilidad.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-white/40 group-hover:text-brand-cyan" />
                </a>
              </div>

              <!-- Columna 3: Contabilidad sin parches -->
              <div class="col-span-4 pl-4 flex flex-col justify-between">
                <div>
                  <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Contabilidad sin parches</h3>
                  <div class="rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-neutral-900 border border-white/10">
                    <img
                      src="/banners/configurar-sistema-odoo-erp.webp"
                      alt="Configurar sistema Odoo ERP"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p class="text-xs sm:text-[13px] text-white/80 leading-relaxed">
                    El contador trabaja dentro de Odoo, no alrededor de él. Especialistas contables en el equipo.
                  </p>
                </div>
                <div class="mt-3">
                  <a href="/contacto" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-cyan hover:underline group">
                    <span>Hablar con un especialista</span>
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- ======================= 3. INDUSTRIAS ======================= -->
        {#if activeDropdown === 'industrias'}
          <div class="bg-[#191b1d] border border-white/[0.08] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7">
            <div class="grid grid-cols-12 gap-8">
              <!-- Izquierda: Con experiencia (9 tarjetas en 3 columnas) -->
              <div class="col-span-9 border-r border-white/5 pr-6">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Con experiencia</h3>
                <div class="grid grid-cols-3 gap-3">
                  <!-- Subcol 1 -->
                  <div class="space-y-2">
                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="cone" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Obras públicas</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Cargos, cuadernos de obra, asistencia en campo y concursos.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="bus" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Turismo y transporte</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Files, viajes, flota, liquidaciones por operador y app para conductores.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="box" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Plásticos y empaque</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Extrusión, impresión, laminado y corte con listas multinivel.</p>
                    </div>
                  </div>

                  <!-- Subcol 2 -->
                  <div class="space-y-2">
                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="bank" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Sector público</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Planeamiento, presupuesto y capacitación para el Estado.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="heart" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Salud</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Ventas, regulatorio y finanzas para distribuidores y clínicas.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="eyedropper" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Laboratorios</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">CRM, rendiciones de gastos y control de servicios.</p>
                    </div>
                  </div>

                  <!-- Subcol 3 -->
                  <div class="space-y-2">
                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="minecart" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Minería</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Costos por centro de costo, compras y personal en unidad.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="truck" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Logística y flotas</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Flota con GPS, combustible, mantenimiento y sala de control.</p>
                    </div>

                    <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div class="flex items-center gap-2.5 mb-1">
                        <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/80">
                          <NavIcon name="bag" class="w-4 h-4" />
                        </div>
                        <span class="text-[13px] font-semibold text-white">Moda y e-commerce</span>
                      </div>
                      <p class="text-[11px] text-white/60 leading-tight">Tienda en línea, catálogo por estilos y configurador de prendas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Derecha: También atendemos (Lista limpia) -->
              <div class="col-span-3 pl-2">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">También atendemos</h3>
                <ul class="space-y-1 text-xs">
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="box" class="w-3.5 h-3.5 text-white/50" />
                    <span>Distribuidoras</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="shop" class="w-3.5 h-3.5 text-white/50" />
                    <span>Retail</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="egg" class="w-3.5 h-3.5 text-white/50" />
                    <span>Alimentos</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="building" class="w-3.5 h-3.5 text-white/50" />
                    <span>Constructoras</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="graduation" class="w-3.5 h-3.5 text-white/50" />
                    <span>Educación</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="briefcase" class="w-3.5 h-3.5 text-white/50" />
                    <span>Servicios profesionales</span>
                  </li>
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                    <NavIcon name="rocket" class="w-3.5 h-3.5 text-white/50" />
                    <span>Startups</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/if}

        <!-- ======================= 4. SERVICIOS ======================= -->
        {#if activeDropdown === 'servicios'}
          <div class="bg-[#191b1d] border border-white/[0.08] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7">
            <div class="grid grid-cols-12 gap-8">
              <!-- Columna 1: A tu medida -->
              <div class="col-span-4 space-y-2.5 border-r border-white/5 pr-4">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">A tu medida</h3>

                <a href="/servicios/desarrollo" class="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-cyan transition-colors">
                    <NavIcon name="code" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Desarrollo a medida</div>
                    <p class="text-[11px] text-white/60">Odoo se adapta a tus procesos, no al revés.</p>
                  </div>
                </a>

                <a href="/servicios/desarrollo" class="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-cyan transition-colors">
                    <NavIcon name="phone" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Apps móviles</div>
                    <p class="text-[11px] text-white/60">Personal de campo, conductores y rendiciones.</p>
                  </div>
                </a>

                <!-- Implementación (Destacado) -->
                <a href="/servicios/implementacion" class="group flex items-center justify-between p-2.5 rounded-lg bg-[#14262d] border border-brand-cyan/70 shadow-[0_0_12px_rgba(42,197,245,0.12)]">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                      <NavIcon name="rocket" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[14px] font-semibold text-white group-hover:text-brand-cyan">Implementación</span>
                        <span class="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-brand-cyan text-[#06222b]">Destacado</span>
                      </div>
                      <p class="text-[11px] text-white/60">Metodología probada, del diagnóstico al arranque.</p>
                    </div>
                  </div>
                  <NavIcon name="chevron-right" class="w-3.5 h-3.5 text-brand-cyan group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <!-- Columna 2: Acompañamiento -->
              <div class="col-span-4 space-y-2.5 border-r border-white/5 pr-4">
                <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Acompañamiento</h3>

                <a href="/servicios/consultoria" class="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-cyan transition-colors">
                    <NavIcon name="compass" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Consultoría</div>
                    <p class="text-[11px] text-white/60">Procesos y alcance antes de elegir módulos.</p>
                  </div>
                </a>

                <a href="/servicios/capacitaciones" class="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-cyan transition-colors">
                    <NavIcon name="graduation" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Capacitaciones</div>
                    <p class="text-[11px] text-white/60">Usuarios clave y equipos listos para operar.</p>
                  </div>
                </a>

                <a href="/servicios/soporte" class="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <div class="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-cyan transition-colors">
                    <NavIcon name="lifebuoy" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-[14px] font-semibold text-white group-hover:text-brand-cyan transition-colors">Soporte</div>
                    <p class="text-[11px] text-white/60">Mesa de ayuda en Lima después del arranque.</p>
                  </div>
                </a>
              </div>

              <!-- Columna 3: Banner No es un sistema enlatado -->
              <div class="col-span-4 pl-4 flex flex-col justify-between">
                <div>
                  <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">No es un sistema enlatado</h3>
                  <div class="rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-neutral-900 border border-white/10">
                    <img
                      src="/banners/empezar-con-datos-demo-odoo-erp.webp"
                      alt="Datos demo Odoo ERP"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p class="text-xs sm:text-[13px] text-white/80 leading-relaxed">
                    Reportes, flujos y apps a la medida de cada operación, sobre la misma base de Odoo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- ======================= 5. RECURSOS ======================= -->
        {#if activeDropdown === 'recursos'}
          <div class="flex justify-end">
            <div class="w-80 bg-[#191b1d] border border-white/[0.08] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-3">
              <ul class="space-y-1">
                <li>
                  <a href="/casos" class="flex items-center gap-3 p-2.5 rounded-lg text-white/85 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                    <NavIcon name="trophy" class="w-4 h-4 text-white/60" />
                    <span>Casos de éxito</span>
                  </a>
                </li>
                <li>
                  <a href="/blog" class="flex items-center gap-3 p-2.5 rounded-lg text-white/85 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                    <NavIcon name="journal" class="w-4 h-4 text-white/60" />
                    <span>Blog</span>
                  </a>
                </li>
                <li>
                  <a href="/#proinnovate" class="flex items-center gap-3 p-2.5 rounded-lg text-white/85 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                    <NavIcon name="cash-coin" class="w-4 h-4 text-white/60" />
                    <span>Financiamiento Pro Innóvate</span>
                  </a>
                </li>
                <li>
                  <a href="/#preguntas" class="flex items-center gap-3 p-2.5 rounded-lg text-white/85 hover:text-white hover:bg-white/5 transition-colors text-[14px]">
                    <NavIcon name="question" class="w-4 h-4 text-white/60" />
                    <span>Preguntas frecuentes</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</header>

<!-- Mobile Navigation Drawer -->
{#if isMobileOpen}
  <div
    transition:fade={{ duration: 180 }}
    class="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
    onclick={() => (isMobileOpen = false)}
    role="presentation"
  ></div>

  <aside
    transition:slide={{ duration: 220 }}
    class="fixed top-0 right-0 bottom-0 w-84 max-w-[85vw] bg-[#161618] border-l border-white/10 p-6 overflow-y-auto z-50 flex flex-col justify-between lg:hidden shadow-2xl"
    aria-label="Menú móvil"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <img
          data-brand="logo"
          data-brand-variant="dark"
          src="/images/flexone/logo-negativo-480.webp"
          alt="Flexone Logo"
          width="120"
          height="32"
          class="h-7 w-auto max-w-[150px] object-contain"
        />
        <button
          type="button"
          onclick={() => (isMobileOpen = false)}
          class="p-1.5 rounded-lg text-white/60 hover:text-white"
          aria-label="Cerrar menú"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Section: Soluciones -->
      <div class="border-b border-white/5 pb-2">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white"
          onclick={() => toggleMobileSection('soluciones')}
        >
          <span>Soluciones</span>
          <svg class="w-4 h-4 transition-transform {mobileSection === 'soluciones' ? 'rotate-180 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if mobileSection === 'soluciones'}
          <div transition:slide class="pl-2 py-1 space-y-1">
            <a href="/funcionalidades/finanzas" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Finanzas y contabilidad</a>
            <a href="/funcionalidades/rrhh" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>RR. HH. y planillas</a>
            <a href="/funcionalidades/manufactura" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Manufactura</a>
            <a href="/funcionalidades/tesoreria" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Tesorería</a>
            <a href="/funcionalidades/ventas" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Ventas y CRM</a>
            <a href="/funcionalidades/compras-inventario" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Compras e inventario</a>
            <a href="/funcionalidades/sitio-web" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Sitio web y e-commerce</a>
            <a href="/funcionalidades/servicios-proyectos" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Servicios y proyectos</a>
          </div>
        {/if}
      </div>

      <!-- Section: Localización Perú -->
      <div class="border-b border-white/5 pb-2">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white"
          onclick={() => toggleMobileSection('localizacion')}
        >
          <span>Localización Perú</span>
          <svg class="w-4 h-4 transition-transform {mobileSection === 'localizacion' ? 'rotate-180 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if mobileSection === 'localizacion'}
          <div transition:slide class="pl-2 py-1 space-y-1">
            <a href="/localizacion/contabilidad" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Contabilidad que cuadra</a>
            <a href="/localizacion/facturacion-electronica" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Facturación electrónica</a>
            <a href="/localizacion/detracciones-retenciones" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Detracciones y retenciones</a>
            <a href="/localizacion/planillas" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Planillas</a>
            <a href="/localizacion/kardex-valorizado" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Kardex valorizado</a>
            <a href="/localizacion/importaciones" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Importaciones</a>
          </div>
        {/if}
      </div>

      <!-- Section: Industrias -->
      <div class="border-b border-white/5 pb-2">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white"
          onclick={() => toggleMobileSection('industrias')}
        >
          <span>Industrias</span>
          <svg class="w-4 h-4 transition-transform {mobileSection === 'industrias' ? 'rotate-180 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if mobileSection === 'industrias'}
          <div transition:slide class="pl-2 py-1 space-y-1">
            <div class="text-[11px] font-semibold text-white/40 uppercase tracking-wider py-1">Con experiencia</div>
            <span class="block py-1 text-xs text-white/80">Obras públicas</span>
            <span class="block py-1 text-xs text-white/80">Turismo y transporte</span>
            <span class="block py-1 text-xs text-white/80">Plásticos y empaque</span>
            <span class="block py-1 text-xs text-white/80">Sector público</span>
            <span class="block py-1 text-xs text-white/80">Salud</span>
            <span class="block py-1 text-xs text-white/80">Laboratorios</span>
            <span class="block py-1 text-xs text-white/80">Minería</span>
            <span class="block py-1 text-xs text-white/80">Logística y flotas</span>
            <span class="block py-1 text-xs text-white/80">Moda y e-commerce</span>
            <div class="text-[11px] font-semibold text-white/40 uppercase tracking-wider pt-2 pb-1">También atendemos</div>
            <span class="block py-1 text-xs text-white/70">Distribuidoras</span>
            <span class="block py-1 text-xs text-white/70">Retail</span>
            <span class="block py-1 text-xs text-white/70">Alimentos</span>
            <span class="block py-1 text-xs text-white/70">Constructoras</span>
            <span class="block py-1 text-xs text-white/70">Educación</span>
            <span class="block py-1 text-xs text-white/70">Servicios profesionales</span>
            <span class="block py-1 text-xs text-white/70">Startups</span>
          </div>
        {/if}
      </div>

      <!-- Section: Servicios -->
      <div class="border-b border-white/5 pb-2">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white"
          onclick={() => toggleMobileSection('servicios')}
        >
          <span>Servicios</span>
          <svg class="w-4 h-4 transition-transform {mobileSection === 'servicios' ? 'rotate-180 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if mobileSection === 'servicios'}
          <div transition:slide class="pl-2 py-1 space-y-1">
            <a href="/servicios/implementacion" class="block py-1.5 text-xs text-brand-cyan font-semibold flex items-center justify-between" onclick={() => (isMobileOpen = false)}>
              <span>Implementación</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-cyan/20 text-brand-cyan">Destacado</span>
            </a>
            <a href="/servicios/desarrollo" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Desarrollo a medida</a>
            <a href="/servicios/desarrollo" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Apps móviles</a>
            <a href="/servicios/consultoria" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Consultoría</a>
            <a href="/servicios/capacitaciones" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Capacitaciones</a>
            <a href="/servicios/soporte" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Soporte</a>
          </div>
        {/if}
      </div>

      <!-- Section: Recursos -->
      <div class="border-b border-white/5 pb-2">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white"
          onclick={() => toggleMobileSection('recursos')}
        >
          <span>Recursos</span>
          <svg class="w-4 h-4 transition-transform {mobileSection === 'recursos' ? 'rotate-180 text-brand-cyan' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if mobileSection === 'recursos'}
          <div transition:slide class="pl-2 py-1 space-y-1">
            <a href="/casos" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Casos de éxito</a>
            <a href="/blog" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Blog</a>
            <a href="/#proinnovate" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Financiamiento Pro Innóvate</a>
            <a href="/#preguntas" class="block py-1.5 text-xs text-white/80 hover:text-brand-cyan" onclick={() => (isMobileOpen = false)}>Preguntas frecuentes</a>
          </div>
        {/if}
      </div>
    </div>

    <div class="pt-6">
      <a
        href="/contacto"
        class="block w-full py-3 text-center rounded bg-brand-cyan text-[#06222b] font-bold text-xs uppercase tracking-wider hover:bg-[#2ac5f5] transition-colors shadow-lg"
        onclick={() => (isMobileOpen = false)}
      >
        Hablemos
      </a>
    </div>
  </aside>
{/if}
