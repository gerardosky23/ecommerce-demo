<script lang="ts">
  import { store } from '../../lib/store.svelte';

  let isScrolled = $state(false);
  let isMegaMenuOpen = $state(false);

  function handleScroll() {
    isScrolled = window.scrollY > 20;
  }

  function scrollToSection(id: string) {
    isMegaMenuOpen = false;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<svelte:window onscroll={handleScroll} />

<header class="fixed top-0 left-0 right-0 z-40 transition-colors duration-200 {isScrolled ? 'bg-white/95 dark:bg-[#0d111a]/95 backdrop-blur-md shadow-xs border-b border-black/5 dark:border-white/10' : 'bg-transparent border-b border-black/5 dark:border-white/5'}">
  <!-- Top announcement bar -->
  <div class="bg-[#1b2234] text-slate-300 text-[11px] font-medium py-1.5 px-4 text-center tracking-wider uppercase border-b border-white/5">
    Envío gratuito en órdenes superiores a $65 CAD • Cosecha Botánica Orgánica
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Left Navigation / Megamenu trigger -->
    <nav class="hidden md:flex items-center space-x-8 text-xs font-medium tracking-widest uppercase text-slate-700 dark:text-slate-300">
      <button
        onclick={() => scrollToSection('hero')}
        class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer py-2"
      >
        Inicio
      </button>

      <button
        onclick={() => scrollToSection('catalog')}
        class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer py-2 flex items-center space-x-1"
      >
        <span>Colección</span>
      </button>

      <button
        onclick={() => scrollToSection('curated')}
        class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer py-2"
      >
        The Comfort Edit
      </button>

      <div class="relative group">
        <button
          onclick={() => isMegaMenuOpen = !isMegaMenuOpen}
          class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer py-2 flex items-center space-x-1"
        >
          <span>Explorar</span>
          <svg class="w-3 h-3 transition-transform {isMegaMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {#if isMegaMenuOpen}
          <div class="absolute left-0 top-full mt-1 w-72 bg-white dark:bg-[#131722] border border-black/10 dark:border-white/10 rounded-lg shadow-xl p-4 space-y-3 z-50">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categorías Botánicas</div>
            <div class="space-y-1.5 text-xs">
              <button onclick={() => scrollToSection('catalog')} class="block w-full text-left py-1 text-slate-700 dark:text-slate-300 hover:text-sky-500">
                🌱 Signature Sets & Regalos
              </button>
              <button onclick={() => scrollToSection('catalog')} class="block w-full text-left py-1 text-slate-700 dark:text-slate-300 hover:text-sky-500">
                🌿 Cuidado Corporal & Manos
              </button>
              <button onclick={() => scrollToSection('catalog')} class="block w-full text-left py-1 text-slate-700 dark:text-slate-300 hover:text-sky-500">
                🌸 Flores Secas & Ramilletes
              </button>
              <button onclick={() => scrollToSection('catalog')} class="block w-full text-left py-1 text-slate-700 dark:text-slate-300 hover:text-sky-500">
                ☕ Galletas & Tés Culinarios
              </button>
            </div>
          </div>
        {/if}
      </div>
    </nav>

    <!-- Center Logo -->
    <div class="flex items-center justify-center">
      <a href="/" class="flex flex-col items-center group">
        <span class="text-xl sm:text-2xl font-serif tracking-widest text-slate-900 dark:text-white uppercase font-bold group-hover:text-sky-500 transition-colors">
          Terre Bleu
        </span>
        <span class="text-[9px] tracking-widest uppercase text-slate-500 dark:text-slate-400 -mt-1 font-sans">
          Lavande Pure • Ontario
        </span>
      </a>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-4 sm:space-x-6 text-slate-700 dark:text-slate-300">
      <!-- Backoffice Direct Link -->
      <a
        href="/admin"
        target="_blank"
        class="hidden lg:flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[#171d2b] text-sky-400 border border-sky-500/30 hover:bg-[#1e2638] transition-colors"
        title="Abrir Backoffice de Ventas e Inventario"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Backoffice</span>
      </a>

      <!-- Profile Button -->
      <button
        onclick={() => store.isProfileOpen = true}
        class="flex items-center space-x-1.5 text-xs font-medium hover:text-sky-500 transition-colors cursor-pointer"
        title="Ver Mi Perfil de Cliente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="hidden sm:inline">
          {store.activeCustomerName ? store.activeCustomerName.split(' ')[0] : 'Perfil'}
        </span>
      </button>

      <!-- Cart Button -->
      <button
        onclick={() => store.isCartOpen = true}
        class="flex items-center space-x-2 text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3.5 py-1.5 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span class="hidden sm:inline">Carrito</span>
        <span class="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold tabular-nums">
          {store.cartTotalItems}
        </span>
      </button>
    </div>
  </div>
</header>
