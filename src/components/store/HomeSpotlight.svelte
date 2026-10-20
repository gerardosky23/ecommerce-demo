<script lang="ts">
  import { store, type Product } from '../../lib/store.svelte';

  const spotlightProducts = $derived(store.products.slice(0, 4));

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

<section class="py-20 bg-[#fbfbf9] text-slate-900 border-b border-slate-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <h2 class="text-3xl font-serif font-bold text-slate-950 tracking-tight">Esencias Destacadas</h2>
      </div>

      <a
        href="/tienda"
        class="text-xs font-semibold uppercase tracking-wider text-slate-900 hover:text-sky-600 flex items-center space-x-1.5 transition-colors"
      >
        <span>Ver todos los productos ({store.products.length})</span>
        <span>→</span>
      </a>
    </div>

    <!-- Static Grid: Zero movement, zero carousel -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each spotlightProducts as product (product.id)}
        <div
          role="button"
          tabindex="0"
          onclick={() => handleProductClick(product)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProductClick(product); }}
          class="group bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer text-left"
        >
          <div class="aspect-square bg-slate-100 relative overflow-hidden">
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

          <div class="p-4 flex flex-col flex-1 justify-between space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">{product.category}</span>
              <h3 class="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                {product.title}
              </h3>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-sm font-bold text-slate-900 tabular-nums">
                ${product.price.toFixed(2)} CAD
              </span>

              <button
                onclick={(e) => handleQuickAdd(e, product)}
                disabled={product.stock <= 0}
                class="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-40"
              >
                + Añadir
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
