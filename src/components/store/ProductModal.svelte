<script lang="ts">
  import { store } from '../../lib/store.svelte';

  let quantity = $state(1);

  const product = $derived(store.selectedProduct);

  function closeModal() {
    store.selectedProduct = null;
    quantity = 1;
  }

  function handleAddToCart() {
    if (product && product.stock >= quantity) {
      store.addToCart(product, quantity);
      closeModal();
    }
  }

  function increment() {
    if (product && quantity < product.stock) {
      quantity += 1;
    }
  }

  function decrement() {
    if (quantity > 1) {
      quantity -= 1;
    }
  }
</script>

{#if product}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
    <!-- Click outside -->
    <div class="absolute inset-0" onclick={closeModal}></div>

    <div class="relative bg-[#0d111a] border border-white/10 rounded-lg max-w-3xl w-full overflow-hidden shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2">
      <!-- Close button -->
      <button
        onclick={closeModal}
        class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Image Column -->
      <div class="bg-slate-950 aspect-square md:aspect-auto flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 p-6">
        <img
          src={product.image}
          alt={product.title}
          class="max-h-80 w-auto object-contain rounded"
        />
      </div>

      <!-- Details Column -->
      <div class="p-6 sm:p-8 flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="space-y-1">
            <span class="text-[10px] font-mono uppercase tracking-widest text-sky-400">{product.category}</span>
            <h2 class="text-2xl font-serif font-bold text-white tracking-tight leading-snug">
              {product.title}
            </h2>
          </div>

          <div class="flex items-baseline space-x-3">
            <span class="text-2xl font-bold text-white tabular-nums">
              ${product.price.toFixed(2)} CAD
            </span>
            {#if product.compareAt}
              <span class="text-sm text-slate-500 line-through tabular-nums">
                ${product.compareAt.toFixed(2)} CAD
              </span>
            {/if}
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            {product.description}
          </p>

          <div class="bg-[#131722] border border-white/10 rounded-md p-3 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Disponibilidad en almacén:</span>
              <span class="font-bold tabular-nums {product.stock < 5 ? 'text-amber-400' : 'text-emerald-400'}">
                {product.stock} unidades
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Origen de cosecha:</span>
              <span class="text-slate-200">Ontario, Canadá</span>
            </div>
          </div>
        </div>

        <!-- Add Actions -->
        <div class="space-y-3 pt-4 border-t border-white/10">
          <div class="flex items-center space-x-3">
            <div class="flex items-center border border-white/10 rounded-md bg-[#131722]">
              <button
                onclick={decrement}
                disabled={quantity <= 1}
                class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span class="w-10 text-center font-bold text-xs text-white tabular-nums">
                {quantity}
              </span>
              <button
                onclick={increment}
                disabled={quantity >= product.stock}
                class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              onclick={handleAddToCart}
              disabled={product.stock <= 0}
              class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.stock > 0 ? `Añadir • $${(product.price * quantity).toFixed(2)} CAD` : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
