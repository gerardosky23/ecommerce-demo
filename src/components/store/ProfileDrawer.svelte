<script lang="ts">
  import { store } from '../../lib/store.svelte';

  let customSearchName = $state(store.activeCustomerName);

  function closeProfile() {
    store.isProfileOpen = false;
  }

  function handleFilterCustomer() {
    store.activeCustomerName = customSearchName.trim();
  }

  function formatDate(isoStr: string): string {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) + ' • ' +
           d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
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
      <div class="w-screen max-w-md bg-white border-l border-slate-200 shadow-md flex flex-col justify-between">
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

        <!-- Customer Identity Bar & Selector -->
        <div class="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-700">
              {store.activeCustomerName ? store.activeCustomerName.slice(0, 2).toUpperCase() : 'TB'}
            </div>
            <div>
              <span class="text-sm font-bold text-slate-900 block">
                {store.activeCustomerName || 'Sin compras recientes'}
              </span>
              <span class="text-[11px] text-slate-500">
                {store.customerOrders.length} {store.customerOrders.length === 1 ? 'pedido completado' : 'pedidos completados'}
              </span>
            </div>
          </div>

          <!-- Quick switcher to view any client's history during presentations -->
          <div class="space-y-1.5 pt-2 border-t border-slate-200">
            <label for="profile-cust-search" class="block text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Consultar Historial de Cliente:
            </label>
            <div class="flex space-x-2">
              <input
                id="profile-cust-search"
                type="text"
                bind:value={customSearchName}
                placeholder="Ingresa nombre de cliente"
                class="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-800"
              />
              <button
                onclick={handleFilterCustomer}
                class="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>

          <!-- Total Spent Metric -->
          <div class="pt-2 flex justify-between items-center text-xs border-t border-slate-200">
            <span class="text-slate-500">Total acumulado invertido:</span>
            <span class="font-bold text-slate-900 tabular-nums">
              ${customerTotalSpent.toFixed(2)} CAD
            </span>
          </div>
        </div>

        <!-- Orders History -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <h3 class="text-xs font-mono uppercase tracking-wider text-slate-400">Órdenes Realizadas</h3>

          {#if store.customerOrders.length === 0}
            <div class="p-8 text-center text-xs text-slate-500 space-y-2">
              <p>No se encontraron pedidos registrados para este nombre.</p>
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
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Entregado
                    </span>
                  </div>

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

        <!-- Backoffice Shortcut -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <a
            href="/admin"
            target="_blank"
            class="block w-full py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
          >
            Ver métricas globales en Backoffice →
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
