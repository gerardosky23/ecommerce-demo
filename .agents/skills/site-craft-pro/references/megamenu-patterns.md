# 🏛️ Patrón Arquitectónico de Megamenú & Header (`HeaderIsland.svelte`)

El componente `HeaderIsland.svelte` es el corazón de la experiencia de navegación en los sitios generados por `site-craft-pro`. Combina un anuncio superior plegable, navegación desktop con dropdowns de alta densidad, drawer móvil táctil e hidratación segura con Svelte 5 Runes.

---

## 📐 Estructura de Estados con Runas de Svelte 5

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';

  // Props tipadas con Runas
  let { isBannerVisible = $bindable(true) } = $props<{ isBannerVisible?: boolean }>();

  // Estado reactivo local
  let activeDropdown = $state<string | null>(null);
  let isMobileOpen = $state(false);
  let isScrolled = $state(false);
  let closeTimeout: number | undefined;

  // Manejo de eventos de ratón con anti-cierre accidental
  function openMenu(menuId: string) {
    if (closeTimeout) clearTimeout(closeTimeout);
    activeDropdown = menuId;
  }

  function scheduleClose() {
    closeTimeout = window.setTimeout(() => {
      activeDropdown = null;
    }, 200);
  }

  function toggleDropdown(menuId: string) {
    activeDropdown = activeDropdown === menuId ? null : menuId;
  }

  // Detección de scroll con passthrough pasivo
  $effect(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 40;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>
```

---

## 🎨 Contenedor Principal y Transición de Desplazamiento

```svelte
<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {isScrolled
    ? 'bg-[#161618]/95 backdrop-blur-md shadow-2xl border-b border-white/10'
    : 'bg-transparent'}"
>
  <!-- 1. Top Announcement Banner (Opcional / Plegable) -->
  {#if isBannerVisible}
    <div class="bg-brand-secondary text-white py-2 px-4 text-xs font-medium text-center flex items-center justify-between">
      <span class="mx-auto flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
        Nueva versión disponible. ¡Descubre nuestras innovaciones!
      </span>
      <button onclick={() => (isBannerVisible = false)} class="p-1 hover:opacity-75" aria-label="Cerrar aviso">×</button>
    </div>
  {/if}

  <!-- 2. Navbar Principal -->
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 lg:h-24 flex items-center justify-between transition-all {isScrolled ? '!h-16' : ''}">
    <!-- Logo Sincronizado con Backoffice -->
    <a href="/" class="flex items-center gap-2" aria-label="Inicio">
      <img
        data-brand="logo"
        data-brand-variant="dark"
        src="/images/logo-blanco.png"
        alt="Logo Corporativo"
        width="140"
        height="36"
        class="h-8 sm:h-9 w-auto max-w-[180px] object-contain transition-all"
      />
    </a>

    <!-- Desktop Navigation Links -->
    <div class="hidden lg:flex items-center gap-6">
      <!-- Trigger 1: Soluciones -->
      <div class="relative" onmouseenter={() => openMenu('soluciones')} onmouseleave={scheduleClose}>
        <button
          type="button"
          class="flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white py-2 transition-colors {activeDropdown === 'soluciones' ? 'text-brand-primary' : ''}"
          aria-expanded={activeDropdown === 'soluciones'}
          onclick={() => toggleDropdown('soluciones')}
        >
          <span>Soluciones</span>
          <svg class="w-4 h-4 transition-transform {activeDropdown === 'soluciones' ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Megamenu Dropdown Panel -->
        {#if activeDropdown === 'soluciones'}
          <div
            transition:slide={{ duration: 180 }}
            class="absolute top-full left-1/2 -translate-x-1/2 w-[850px] bg-[#161618] border border-white/10 rounded-2xl p-6 shadow-2xl grid grid-cols-3 gap-4"
          >
            <!-- Iterar sobre los productos del catálogo -->
            <a href="/soluciones/ejemplo-1" class="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <!-- SVG Icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">ERP & Gestión</div>
                <p class="text-xs text-white/60 leading-snug mt-1">Control integral de inventarios, compras y ventas.</p>
              </div>
            </a>
            <!-- Más columnas... -->
          </div>
        {/if}
      </div>

      <a href="/nosotros" class="text-sm font-medium text-white/85 hover:text-white transition-colors">Nosotros</a>
      <a href="/casos" class="text-sm font-medium text-white/85 hover:text-white transition-colors">Casos de Éxito</a>
    </div>

    <!-- CTA Directo -->
    <div class="hidden lg:flex items-center gap-4">
      <a href="/contacto" class="px-5 py-2.5 rounded-lg bg-brand-primary text-slate-900 font-semibold text-xs uppercase tracking-wide hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all">
        Agendar Demo
      </a>
    </div>

    <!-- Mobile Hamburger Toggle -->
    <button
      type="button"
      onclick={() => (isMobileOpen = !isMobileOpen)}
      class="lg:hidden p-2 text-white/80 hover:text-white"
      aria-label="Abrir menú de navegación"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </nav>

  <!-- 3. Mobile Slide-in Drawer -->
  {#if isMobileOpen}
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onclick={() => (isMobileOpen = false)} role="presentation"></div>
    <aside
      transition:slide={{ duration: 220 }}
      class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#161618] border-l border-white/10 p-6 z-50 flex flex-col justify-between overflow-y-auto lg:hidden"
    >
      <div class="space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <img data-brand="logo" data-brand-variant="dark" src="/images/logo-blanco.png" alt="Logo" class="h-7 w-auto max-w-[140px] object-contain" />
          <button onclick={() => (isMobileOpen = false)} class="p-1 text-white/60 hover:text-white">✕</button>
        </div>

        <nav class="space-y-3">
          <a href="/" class="block text-white font-medium py-2">Inicio</a>
          <a href="/soluciones" class="block text-white font-medium py-2">Soluciones</a>
          <a href="/nosotros" class="block text-white font-medium py-2">Nosotros</a>
          <a href="/contacto" class="block text-white font-medium py-2">Contacto</a>
        </nav>
      </div>

      <div class="pt-6 border-t border-white/10 space-y-3">
        <a href="/contacto" class="w-full block py-3 rounded-xl bg-brand-primary text-slate-900 font-bold text-center text-sm">
          Solicitar Cotización
        </a>
      </div>
    </aside>
  {/if}
</header>
```
