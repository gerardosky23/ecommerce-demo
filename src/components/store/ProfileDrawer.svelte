<script lang="ts">
  import { store, type Order } from '../../lib/store.svelte';

  let loginNameInput = $state('');

  function closeProfile() {
    store.isProfileOpen = false;
  }

  function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (loginNameInput.trim()) {
      store.login(loginNameInput.trim());
      loginNameInput = '';
    }
  }

  function handleLogout() {
    store.logout();
  }

  function formatDate(isoStr: string): string {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) + ' • ' +
             d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoStr;
    }
  }

  const customerTotalSpent = $derived(
    store.customerOrders.reduce((sum, o) => sum + o.total, 0)
  );
</script>

{#if store.isProfileOpen}
  <div class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <button
      type="button"
      aria-label="Cerrar perfil"
      class="absolute inset-0 bg-slate-900/40 transition-opacity w-full h-full border-none p-0 cursor-default"
      onclick={closeProfile}
    ></button>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-white border-l border-slate-200 shadow-sm flex flex-col justify-between">
        <!-- Header -->
        <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div class="flex items-center space-x-2">
            <h2 class="text-base font-semibold text-slate-900">Mi Perfil & Compras</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar perfil de usuario"
            onclick={closeProfile}
            class="w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Customer Identity Section -->
        <div class="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          {#if store.activeCustomerName}
            <!-- LOGGED IN USER -->
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold font-serif">
                  {store.activeCustomerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span class="text-sm font-bold text-slate-950 block">
                    {store.activeCustomerName}
                  </span>
                  <span class="text-[11px] text-slate-500">
                    {store.customerOrders.length} {store.customerOrders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                  </span>
                </div>
              </div>

              <button
                onclick={handleLogout}
                class="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded transition-colors cursor-pointer"
                title="Cerrar sesión actual"
              >
                Cerrar Sesión
              </button>
            </div>

            <!-- Total Spent Metric -->
            <div class="pt-2 flex justify-between items-center text-xs border-t border-slate-200">
              <span class="text-slate-500">Total acumulado invertido:</span>
              <span class="font-bold text-slate-900 tabular-nums">
                ${customerTotalSpent.toFixed(2)} CAD
              </span>
            </div>
          {:else}
            <!-- GUEST / LOGIN PROMPT -->
            <form onsubmit={handleLogin} class="space-y-3">
              <div>
                <span class="text-xs font-bold text-slate-900 block">Iniciar Sesión / Identificarse</span>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Ingresa tu nombre para consultar tus compras o realizar seguimiento a tus pedidos.
                </p>
              </div>

              <div class="flex space-x-2">
                <input
                  type="text"
                  bind:value={loginNameInput}
                  placeholder="Tu Nombre Completo"
                  required
                  class="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600"
                />
                <button
                  type="submit"
                  class="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Acceder
                </button>
              </div>
            </form>
          {/if}
        </div>

        <!-- Orders History -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono uppercase tracking-wider text-slate-400">Historial de Órdenes</h3>
            {#if store.customerOrders.length > 0}
              <span class="text-[11px] font-mono text-slate-400">{store.customerOrders.length} registros</span>
            {/if}
          </div>

          {#if store.customerOrders.length === 0}
            <div class="p-8 text-center text-xs text-slate-500 space-y-2">
              <p>No se encontraron pedidos registrados para esta cuenta.</p>
              <p class="text-slate-400">Realiza una compra en la tienda para ver cómo se refleja aquí al instante.</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each store.customerOrders as order (order.id)}
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-mono font-bold text-slate-900 text-xs block">{order.id}</span>
                      <span class="text-[10px] text-slate-500 tabular-nums">{formatDate(order.createdAt)}</span>
                    </div>

                    <button
                      onclick={() => store.openTracking(order)}
                      class="px-2.5 py-1 text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer flex items-center space-x-1"
                      title="Ver seguimiento de este pedido"
                    >
                      <svg class="w-3 h-3 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>Seguimiento</span>
                    </button>
                  </div>

                  {#if order.shippingAddress}
                    <div class="text-[11px] text-slate-600 bg-white border border-slate-200 rounded p-2 space-y-0.5">
                      <div class="text-[10px] font-mono text-slate-400 uppercase">Dirección de Envío:</div>
                      <div class="font-medium text-slate-900 truncate">{order.shippingAddress}</div>
                      {#if order.shippingCity}
                        <div class="text-[10px] text-slate-500">{order.shippingCity}</div>
                      {/if}
                    </div>
                  {/if}

                  <!-- Items in Order -->
                  <div class="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                    {#each order.items as item}
                      <div class="flex items-center justify-between text-slate-700">
                        <span class="truncate max-w-[200px]">{item.quantity}x {item.title}</span>
                        <span class="font-mono tabular-nums text-slate-500">${item.subtotal.toFixed(2)} CAD</span>
                      </div>
                    {/each}
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                    <span>Monto Total</span>
                    <span class="tabular-nums">${order.total.toFixed(2)} CAD</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}