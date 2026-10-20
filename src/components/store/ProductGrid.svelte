<script lang="ts">
  import { store, type Product } from '../../lib/store.svelte';

  let selectedCategory = $state<string>('Todos');

  const categories = ['Todos', 'Signature Sets', 'Body & Care', 'Wellness', 'Botanicals', 'Culinary', 'Bath & Spa'];

  const filteredProducts = $derived(
    selectedCategory === 'Todos'
      ? store.products
      : store.products.filter(p => p.category === selectedCategory)
  );

  function handleProductClick(product: Product) {
    store.selectedProduct = product;
  }

  function handleQuickAdd(e: MouseEvent, product: Product) {
    e.stopPropagation();
    if (product.stock > 0) {
      store.addToCart(product, 1);
    }
  }
</script>

<section id="catalog" class="py-20 bg-[#090a0f] text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
      <div>
        <span class="text-xs font-mono uppercase tracking-widest text-sky-400 block mb-1">Catálogo Oficial</span>
        <h2 class="text-3xl font-serif font-bold text-white tracking-tight">Colección Botánica Completa</h2>
        <p class="text-xs text-slate-400 mt-1">Existencias conectadas en tiempo real con el servidor central de inventario</p>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="flex flex-wrap gap-1.5 bg-[#0d111a] p-1 rounded-lg border border-white/10">
        {#each categories as cat}
          <button
            onclick={() => selectedCategory = cat}
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer {selectedCategory === cat ? 'bg-[#171d2b] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each filteredProducts as product (product.id)}
        <div
          onclick={() => handleProductClick(product)}
          class="group bg-[#0d111a] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer"
        >
          <!-- Thumbnail -->
          <div class="aspect-square bg-slate-900 relative overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              loading="lazy"
            />
            {#if product.stock <= 0}
              <div class="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                <span class="text-xs font-bold text-rose-300 uppercase tracking-wider bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800/60">
                  Agotado
                </span>
              </div>
            {:else if product.stock < 5}
              <div class="absolute top-2.5 right-2.5">
                <span class="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  Últimas {product.stock} uds
                </span>
              </div>
            {/if}
          </div>

          <!-- Info -->
          <div class="p-4 flex flex-col flex-1 justify-between space-y-4">
            <div class="space-y-1.5">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">{product.category}</span>
              <h3 class="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors leading-snug">
                {product.title}
              </h3>
              <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div class="pt-2 border-t border-white/5 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-base font-bold text-white tabular-nums">
                  ${product.price.toFixed(2)} CAD
                </span>
                <span class="text-[10px] text-slate-400 font-mono">
                  Stock: <strong class="text-slate-300">{product.stock}</strong>
                </span>
              </div>

              <button
                onclick={(e) => handleQuickAdd(e, product)}
                disabled={product.stock <= 0}
                class="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>+ Añadir</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
