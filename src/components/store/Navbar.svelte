<script lang="ts">
  import { store } from '../../lib/store.svelte';

  let isMegaMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
  <!-- Top announcement bar -->
  <div class="bg-[#f8fafc] text-slate-600 text-[11px] font-medium py-1.5 px-4 text-center tracking-wider uppercase border-b border-slate-200">
    Envío gratuito en órdenes superiores a $65 CAD
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Left Navigation -->
    <nav class="hidden md:flex items-center space-x-8 text-xs font-medium tracking-wider uppercase text-slate-700">
      <a
        href="/"
        class="hover:text-sky-600 transition-colors py-2"
      >
        Inicio
      </a>

      <a
        href="/tienda"
        class="hover:text-sky-600 transition-colors py-2 flex items-center space-x-1"
      >
        <span>Tienda & Catálogo</span>
      </a>

      <a
        href="/#curated"
        class="hover:text-sky-600 transition-colors py-2"
      >
        The Comfort Edit
      </a>

      <div class="relative group">
        <button
          onclick={() => isMegaMenuOpen = !isMegaMenuOpen}
          class="hover:text-sky-600 transition-colors py-2 flex items-center space-x-1 cursor-pointer"
        >
          <span>Colecciones</span>
          <svg class="w-3 h-3 transition-transform {isMegaMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {#if isMegaMenuOpen}
          <div class="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-2 z-50">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categorías Botánicas</div>
            <div class="space-y-1 text-xs">
              <a href="/tienda?cat=Signature Sets" class="block py-1 text-slate-700 hover:text-sky-600">
                Signature Sets & Regalos
              </a>
              <a href="/tienda?cat=Body & Care" class="block py-1 text-slate-700 hover:text-sky-600">
                Cuidado Corporal & Manos
              </a>
              <a href="/tienda?cat=Wellness" class="block py-1 text-slate-700 hover:text-sky-600">
                Bienestar & Aromaterapia
              </a>
              <a href="/tienda?cat=Botanicals" class="block py-1 text-slate-700 hover:text-sky-600">
                Flores Secas & Ramilletes
              </a>
              <a href="/tienda?cat=Culinary" class="block py-1 text-slate-700 hover:text-sky-600">
                Galletas & Tés Culinarios
              </a>
            </div>
          </div>
        {/if}
      </div>
    </nav>

    <!-- Center Logo -->
    <div class="flex items-center justify-center">
      <a href="/" class="flex flex-col items-center group">
        <span class="text-xl sm:text-2xl font-serif tracking-widest text-slate-900 uppercase font-bold group-hover:text-sky-600 transition-colors">
          Terre Bleu
        </span>
        <span class="text-[9px] tracking-widest uppercase text-slate-500 -mt-1 font-sans">
          Lavande Pure • Ontario
        </span>
      </a>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-3 sm:space-x-5 text-slate-700">
      <!-- Backoffice Direct Link -->
      <a
        href="/admin"
        target="_blank"
        class="hidden lg:flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-colors"
        title="Abrir Backoffice Administrativo"
      >
        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Backoffice</span>
      </a>

      <!-- Profile Button -->
      <button
        onclick={() => store.isProfileOpen = true}
        class="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-sky-600 transition-colors cursor-pointer"
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
        class="flex items-center space-x-2 text-xs font-medium bg-slate-900 text-white px-3.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span class="hidden sm:inline">Carrito</span>
        <span class="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold tabular-nums">
          {store.cartTotalItems}
        </span>
      </button>
    </div>
  </div>
</header>
