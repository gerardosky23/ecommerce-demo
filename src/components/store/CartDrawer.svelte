<script lang="ts">
  import { store } from '../../lib/store.svelte';

  function closeCart() {
    store.isCartOpen = false;
  }

  function proceedToCheckout() {
    store.isCartOpen = false;
    store.isCheckoutOpen = true;
  }
</script>

{#if store.isCartOpen}
  <div class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      onclick={closeCart}
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-[#0d111a] border-l border-white/10 shadow-2xl flex flex-col justify-between">
        <!-- Header -->
        <div class="p-6 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h2 class="text-base font-semibold text-white">Carrito de Compras</h2>
            <span class="text-xs font-mono text-slate-400">({store.cartTotalItems} artículos)</span>
          </div>
          <button
            onclick={closeCart}
            class="w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Free shipping indicator -->
        <div class="bg-[#131722] px-6 py-3 border-b border-white/5 text-xs">
          {#if store.cartSubtotal >= 65}
            <div class="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Felicidades! Tienes envío gratuito a todo Canadá y Perú</span>
            </div>
          {:else}
            <div class="text-slate-300">
              Agrega <strong class="text-sky-400 tabular-nums">${(65 - store.cartSubtotal).toFixed(2)} CAD</strong> más para obtener envío gratuito
            </div>
          {/if}
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-white/5">
          {#if store.cart.length === 0}
            <div class="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
              <div class="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-white">Tu carrito está vacío</p>
              <p class="text-xs text-slate-400 max-w-xs">Explora nuestra colección botánica y añade productos cosechados artesanalmente.</p>
              <button
                onclick={closeCart}
                class="mt-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Ver Productos
              </button>
            </div>
          {:else}
            {#each store.cart as item (item.product.id)}
              <div class="pt-4 first:pt-0 flex space-x-4">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  class="w-16 h-16 rounded object-cover border border-white/10 bg-slate-900 shrink-0"
                />

                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-xs font-semibold text-white leading-tight">{item.product.title}</h4>
                      <span class="text-[10px] text-slate-400 font-mono">${item.product.price.toFixed(2)} c/u</span>
                    </div>

                    <button
                      onclick={() => store.removeFromCart(item.product.id)}
                      class="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                      title="Eliminar artículo"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex justify-between items-center pt-2">
                    <div class="flex items-center border border-white/10 rounded bg-[#131722]">
                      <button
                        onclick={() => store.updateQuantity(item.product.id, -1)}
                        class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span class="w-7 text-center font-bold text-[11px] text-white tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onclick={() => store.updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>

                    <span class="text-xs font-bold text-white tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)} CAD
                    </span>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <!-- Footer / Checkout CTA -->
        {#if store.cart.length > 0}
          <div class="p-6 border-t border-white/10 bg-[#131722] space-y-4">
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span class="font-bold text-white tabular-nums">${store.cartSubtotal.toFixed(2)} CAD</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Envío Estimado</span>
                <span class="text-slate-300">{store.cartSubtotal >= 65 ? 'Gratis' : '$9.50 CAD'}</span>
              </div>
              <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Estimado</span>
                <span class="tabular-nums text-sky-400">
                  ${(store.cartSubtotal + (store.cartSubtotal >= 65 ? 0 : 9.50)).toFixed(2)} CAD
                </span>
              </div>
            </div>

            <button
              onclick={proceedToCheckout}
              class="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Completar Compra Ficticia</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <p class="text-[10px] text-center text-slate-400">
              Modo Demo: Solo requerirá tu nombre para registrar la orden en el Backoffice.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
