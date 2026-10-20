<script lang="ts">
  import { store, type Order } from '../../lib/store.svelte';

  let customerName = $state(store.activeCustomerName || '');
  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);
  let completedOrder = $state<Order | null>(null);

  function closeModal() {
    store.isCheckoutOpen = false;
    errorMessage = null;
    completedOrder = null;
  }

  async function handlePay() {
    if (!customerName.trim()) {
      errorMessage = 'Por favor ingresa tu nombre para registrar la compra.';
      return;
    }

    isSubmitting = true;
    errorMessage = null;

    const res = await store.submitCheckout(customerName);
    isSubmitting = false;

    if (res.success && res.order) {
      completedOrder = res.order;
    } else {
      errorMessage = res.error || 'Ocurrió un error al procesar el pago ficticio.';
    }
  }

  function viewProfile() {
    closeModal();
    store.isProfileOpen = true;
  }
</script>

{#if store.isCheckoutOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
    <div class="absolute inset-0" onclick={closeModal}></div>

    <div class="relative bg-[#0d111a] border border-white/10 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl z-10 p-6 sm:p-8 space-y-6">
      <!-- Close button -->
      <button
        onclick={closeModal}
        class="absolute top-4 right-4 w-7 h-7 rounded-md text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {#if completedOrder}
        <!-- SUCCESS STATE -->
        <div class="text-center space-y-5 py-4">
          <div class="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1">
            <h3 class="text-xl font-serif font-bold text-white">¡Compra Demo Confirmada!</h3>
            <p class="text-xs text-slate-300">
              Orden registrada exitosamente con el ID: <strong class="text-sky-400 font-mono">{completedOrder.id}</strong>
            </p>
          </div>

          <div class="bg-[#131722] border border-white/10 rounded-lg p-4 text-xs text-left space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Cliente Registrado:</span>
              <span class="font-bold text-white">{completedOrder.customerName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total Facturado:</span>
              <span class="font-bold text-sky-400 tabular-nums">${completedOrder.total.toFixed(2)} CAD</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Artículos Comprados:</span>
              <span class="text-slate-300">{completedOrder.items.length} productos ({completedOrder.totalItems} uds)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Impacto en Backoffice:</span>
              <span class="text-emerald-400 font-mono">Stock descontado & Venta en vivo</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onclick={viewProfile}
              class="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Ver en Mi Perfil
            </button>

            <a
              href="/admin"
              target="_blank"
              class="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-white bg-[#171d2b] hover:bg-[#1e2638] rounded-md border border-sky-500/30 transition-colors text-center"
            >
              Ver en Backoffice →
            </a>
          </div>
        </div>
      {:else}
        <!-- CHECKOUT FORM -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-sky-400">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>Checkout Express de Demostración</span>
          </div>
          <h3 class="text-2xl font-serif font-bold text-white">Finalizar Orden</h3>
          <p class="text-xs text-slate-400">
            Ingresa tu nombre para ver cómo el Backoffice en Go registra tu compra y actualiza el inventario en tiempo real.
          </p>
        </div>

        {#if errorMessage}
          <div class="p-3 bg-rose-950/40 border border-rose-900/60 rounded-md text-xs text-rose-300">
            {errorMessage}
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Customer Name Input -->
          <div class="space-y-1.5">
            <label for="cust-name" class="block text-xs font-medium text-slate-300">
              Nombre Completo del Comprador <span class="text-sky-400">*</span>
            </label>
            <input
              id="cust-name"
              type="text"
              bind:value={customerName}
              placeholder="Ej: Carlos Medina o Valeria Gómez"
              class="w-full bg-[#131722] border border-white/10 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              autocomplete="name"
            />
          </div>

          <!-- Mock Card Details (Read-only simulation) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-300">
              Método de Pago Ficticio
            </label>
            <div class="bg-[#131722] border border-white/10 rounded-md p-3 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2.5">
                <div class="w-8 h-5 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-[9px] font-mono font-bold text-sky-400">
                  VISA
                </div>
                <span class="font-mono text-slate-300">•••• •••• •••• 4242</span>
              </div>
              <span class="text-[10px] text-emerald-400 font-mono">Modo Simulado</span>
            </div>
          </div>

          <!-- Order Summary Mini -->
          <div class="bg-[#131722]/60 border border-white/5 rounded-md p-3 space-y-1 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Artículos en carrito:</span>
              <span class="text-white font-medium">{store.cartTotalItems} unidades</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Monto Total a debitar:</span>
              <span class="font-bold text-white tabular-nums">${store.cartSubtotal.toFixed(2)} CAD</span>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button
            onclick={handlePay}
            disabled={isSubmitting || store.cart.length === 0}
            class="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {#if isSubmitting}
              <span class="w-3.5 h-3.5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></span>
              <span>Procesando Orden...</span>
            {:else}
              <span>Pagar ${store.cartSubtotal.toFixed(2)} CAD (Demo)</span>
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
