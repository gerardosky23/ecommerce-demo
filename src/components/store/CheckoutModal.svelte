<script lang="ts">
  import { store, type Order } from '../../lib/store.svelte';

  let customerName = $state(store.activeCustomerName || '');
  let shippingAddress = $state(store.customerAddress || '');
  let shippingCity = $state(store.customerCity || '');
  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);
  let completedOrder = $state<Order | null>(null);

  // Sync if activeCustomerName or address changes in store
  $effect(() => {
    if (store.activeCustomerName && !customerName) {
      customerName = store.activeCustomerName;
    }
    if (store.customerAddress && !shippingAddress) {
      shippingAddress = store.customerAddress;
    }
    if (store.customerCity && !shippingCity) {
      shippingCity = store.customerCity;
    }
  });

  function closeModal() {
    store.isCheckoutOpen = false;
    errorMessage = null;
    completedOrder = null;
  }

  async function handlePay() {
    const activeName = (store.activeCustomerName || customerName).trim();
    if (!activeName) {
      errorMessage = 'Por favor ingresa tu nombre completo para registrar la compra.';
      return;
    }

    if (!shippingAddress.trim()) {
      errorMessage = 'Por favor ingresa la dirección de envío (calle y número).';
      return;
    }

    isSubmitting = true;
    errorMessage = null;

    const res = await store.submitCheckout(activeName, shippingAddress, shippingCity);
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
    <button
      type="button"
      aria-label="Cerrar ventana"
      class="absolute inset-0 bg-transparent w-full h-full border-none cursor-default"
      onclick={closeModal}
    ></button>

    <div class="relative bg-white border border-slate-200 rounded-lg max-w-lg w-full overflow-hidden shadow-sm z-10 p-6 sm:p-8 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto">
      <!-- Close button -->
      <button
        type="button"
        aria-label="Cerrar pasarela de pago"
        onclick={closeModal}
        class="absolute top-4 right-4 w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {#if completedOrder}
        <!-- SUCCESS STATE -->
        <div class="text-center space-y-5 py-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1">
            <h3 class="text-xl font-serif font-bold text-slate-950">¡Compra Confirmada!</h3>
            <p class="text-xs text-slate-600">
              Orden registrada exitosamente con el ID: <strong class="text-sky-600 font-mono">{completedOrder.id}</strong>
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-left space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500">Destinatario:</span>
              <span class="font-bold text-slate-900">{completedOrder.customerName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Dirección de Entrega:</span>
              <span class="font-medium text-slate-900 text-right max-w-[240px] truncate">{completedOrder.shippingAddress || 'No especificada'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Total Facturado:</span>
              <span class="font-bold text-sky-600 tabular-nums">${completedOrder.total.toFixed(2)} CAD</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Artículos Comprados:</span>
              <span class="text-slate-800">{completedOrder.items.length} productos ({completedOrder.totalItems} uds)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Estado de Orden:</span>
              <span class="text-emerald-700 font-mono font-medium">Confirmada</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onclick={viewProfile}
              class="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              Ver en Mi Perfil
            </button>

            <button
              onclick={closeModal}
              class="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors text-center cursor-pointer"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      {:else}
        <!-- CHECKOUT FORM -->
        <div class="space-y-1.5">
          <h3 class="text-2xl font-serif font-bold text-slate-950">Finalizar Orden</h3>
          <p class="text-xs text-slate-600">
            Ingresa tus datos de envío para completar el pedido.
          </p>
        </div>

        {#if errorMessage}
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
            {errorMessage}
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Customer Identity Box / Input -->
          {#if store.activeCustomerName}
            <div class="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between text-xs">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-mono">Comprando como:</span>
                <span class="font-bold text-slate-900 text-sm">{store.activeCustomerName}</span>
              </div>
              <button
                type="button"
                onclick={() => { store.activeCustomerName = ''; customerName = ''; }}
                class="text-[11px] text-sky-700 hover:text-sky-900 font-medium underline cursor-pointer"
              >
                Cambiar nombre
              </button>
            </div>
          {:else}
            <div class="space-y-1.5">
              <label for="cust-name" class="block text-xs font-medium text-slate-700">
                Nombre Completo <span class="text-sky-600">*</span>
              </label>
              <input
                id="cust-name"
                type="text"
                bind:value={customerName}
                placeholder="Ej: Carlos Medina o Valeria Gómez"
                class="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
                autocomplete="name"
              />
            </div>
          {/if}

          <!-- Shipping Address Fields (Structured for GPS / Map Geocoding) -->
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label for="shipping-address" class="block text-xs font-medium text-slate-700">
                Dirección de Envío (Calle y Número) <span class="text-sky-600">*</span>
              </label>
              <input
                id="shipping-address"
                type="text"
                bind:value={shippingAddress}
                placeholder="Ej: Av. Las Begonias 441, Depto 502"
                class="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
                autocomplete="street-address"
              />
            </div>

            <div class="space-y-1.5">
              <label for="shipping-city" class="block text-xs font-medium text-slate-700">
                Ciudad / Distrito / Referencia
              </label>
              <input
                id="shipping-city"
                type="text"
                bind:value={shippingCity}
                placeholder="Ej: San Isidro, Lima (Frente al parque)"
                class="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
                autocomplete="address-level2"
              />
            </div>
          </div>

          <!-- Mock Card Details (Read-only simulation) -->
          <div class="space-y-1.5">
            <span class="block text-xs font-medium text-slate-700">
              Método de Pago Ficticio
            </span>
            <div class="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2.5">
                <div class="w-8 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[9px] font-mono font-bold">
                  VISA
                </div>
                <span class="font-mono text-slate-700">•••• •••• •••• 4242</span>
              </div>
              <span class="text-[10px] text-emerald-700 font-mono font-medium">Modo Simulado</span>
            </div>
          </div>

          <!-- Order Summary Mini -->
          <div class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Artículos en carrito:</span>
              <span class="text-slate-900 font-medium">{store.cartTotalItems} unidades</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Monto Total a debitar:</span>
              <span class="font-bold text-slate-950 tabular-nums">${store.cartSubtotal.toFixed(2)} CAD</span>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button
            onclick={handlePay}
            disabled={isSubmitting || store.cart.length === 0}
            class="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-2xs"
          >
            {#if isSubmitting}
              <span class="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
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