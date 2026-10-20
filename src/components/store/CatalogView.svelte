<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { store, getApiBaseUrl, type Product } from '../../lib/store.svelte';
  import Navbar from './Navbar.svelte';
  import Footer from './Footer.svelte';
  import ProductModal from './ProductModal.svelte';
  import CartDrawer from './CartDrawer.svelte';
  import CheckoutModal from './CheckoutModal.svelte';
  import ProfileDrawer from './ProfileDrawer.svelte';
  import OrderTrackingModal from './OrderTrackingModal.svelte';

  let searchQuery = $state('');
  let selectedCategory = $state('Todos');
  let sortBy = $state<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const categories = ['Todos', 'Sets Exclusivos', 'Cuidado Corporal', 'Bienestar', 'Botánica y Hogar', 'Gourmet y Culinario', 'Baño y Spa'];

  const filteredProducts = $derived.by(() => {
    let list = store.products;

    // Filter by category
    if (selectedCategory !== 'Todos') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  });

  function handleProductClick(product: Product) {
    store.selectedProduct = product;
  }

  function handleQuickAdd(e: MouseEvent, product: Product) {
    e.stopPropagation();
    if (product.stock > 0) {
      store.addToCart(product, 1);
    }
  }

  let eventSource: EventSource | null = null;
  let pollInterval: any = null;

  onMount(() => {
    store.fetchProducts();
    store.fetchOrders();

    // Parse URL category parameter if present
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam && categories.includes(catParam)) {
      selectedCategory = catParam;
    }

    try {
      eventSource = new EventSource(`${getApiBaseUrl()}/events`);
      eventSource.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.action === 'order_created' || data.action === 'demo_reset') {
            store.fetchProducts();
          }
        } catch (e) {}
      };
    } catch (e) {}

    pollInterval = setInterval(() => {
      store.fetchProducts();
    }, 4000);
  });

  onDestroy(() => {
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

<div class="min-h-screen bg-white text-slate-900 antialiased selection:bg-sky-500/10">
  <Navbar />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Breadcrumb & Title -->
    <div class="space-y-2 border-b border-slate-200 pb-6">
      <div class="flex items-center space-x-2 text-xs text-slate-500">
        <a href="/" class="hover:text-slate-900">Inicio</a>
        <span>/</span>
        <span class="text-slate-900 font-medium">Tienda & Catálogo</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-serif font-bold text-slate-950 tracking-tight">
        Catálogo de Productos
      </h1>
      <p class="text-xs text-slate-600">
        Colección completa de fórmulas botánicas y lavanda pura.
      </p>
    </div>

    <!-- Search & Filter Controls (Shopify / Odoo style) -->
    <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <input
            type="search"
            bind:value={searchQuery}
            placeholder="Buscar por nombre, categoría o descripción..."
            class="w-full bg-white border border-slate-300 rounded-md pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center space-x-2">
          <label for="sort" class="text-xs text-slate-600 font-medium shrink-0">Ordenar por:</label>
          <select
            id="sort"
            bind:value={sortBy}
            class="bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-600 shadow-2xs cursor-pointer"
          >
            <option value="featured">Recomendados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre: A - Z</option>
          </select>
        </div>
      </div>

      <!-- Categories Filter Pills -->
      <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
        {#each categories as cat}
          <button
            onclick={() => selectedCategory = cat}
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer {selectedCategory === cat ? 'bg-slate-900 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- Results Count -->
    <div class="flex justify-between items-center text-xs text-slate-600">
      <span>Mostrando <strong class="text-slate-900 tabular-nums">{filteredProducts.length}</strong> de {store.products.length} productos</span>
      {#if selectedCategory !== 'Todos' || searchQuery !== ''}
        <button
          onclick={() => { selectedCategory = 'Todos'; searchQuery = ''; }}
          class="text-sky-600 hover:underline cursor-pointer"
        >
          Limpiar filtros
        </button>
      {/if}
    </div>

    <!-- Static Professional Product Grid (NO CAROUSEL, NO MOVEMENT) -->
    {#if filteredProducts.length === 0}
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs space-y-2">
        <p class="font-medium text-slate-900">No se encontraron productos que coincidan con la búsqueda.</p>
        <p>Prueba con otros términos o selecciona "Todos" en las categorías.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each filteredProducts as product (product.id)}
          <div
            role="button"
            tabindex="0"
            onclick={() => handleProductClick(product)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProductClick(product); }}
            class="group bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer text-left"
          >
            <!-- Thumbnail -->
            <div class="aspect-square bg-slate-50 relative overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                class="w-full h-full object-cover"
                loading="lazy"
              />
              {#if product.stock <= 0}
                <div class="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <span class="text-xs font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                    Agotado
                  </span>
                </div>
              {/if}
            </div>

            <!-- Card Info -->
            <div class="p-4 flex flex-col flex-1 justify-between space-y-3">
              <div class="space-y-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">{product.category}</span>
                <h3 class="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                  {product.title}
                </h3>
                <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-base font-bold text-slate-950 tabular-nums">
                  ${product.price.toFixed(2)} CAD
                </span>

                <button
                  onclick={(e) => handleQuickAdd(e, product)}
                  disabled={product.stock <= 0}
                  class="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  + Añadir
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <Footer />

  <!-- Modals & Drawers -->
  <ProductModal />
  <CartDrawer />
  <CheckoutModal />
  <ProfileDrawer />
  <OrderTrackingModal />
</div>
