<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    compareAt?: number;
    category: string;
    stock: number;
    initialStock: number;
    image: string;
    description: string;
    featured: boolean;
  }

  interface OrderItem {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    subtotal: number;
    image: string;
  }

  interface Order {
    id: string;
    customerName: string;
    items: OrderItem[];
    totalItems: number;
    total: number;
    status: string;
    cardLast4: string;
    createdAt: string;
  }

  interface Customer {
    name: string;
    ordersCount: number;
    totalSpent: number;
    lastOrderAt: string;
  }

  interface Stats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalUnitsSold: number;
    totalStockLeft: number;
  }

  let activeTab = $state<'inventory' | 'sales' | 'customers'>('inventory');
  let products = $state<Product[]>([]);
  let orders = $state<Order[]>([]);
  let customers = $state<Customer[]>([]);
  let stats = $state<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalUnitsSold: 0,
    totalStockLeft: 0,
  });

  let isLoading = $state(true);
  let isResetting = $state(false);
  let showResetModal = $state(false);
  let notification = $state<string | null>(null);
  let eventSource: EventSource | null = null;
  let pollInterval: any = null;

  const API_BASE = 'http://localhost:8080/api';

  async function fetchData() {
    try {
      const [prodRes, ordersRes, custRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/products`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/orders`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/customers`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({
          totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalUnitsSold: 0, totalStockLeft: 0
        })),
      ]);

      if (Array.isArray(prodRes) && prodRes.length > 0) products = prodRes;
      if (Array.isArray(ordersRes)) orders = ordersRes;
      if (Array.isArray(custRes)) customers = custRes;
      if (statsRes) stats = statsRes;
      isLoading = false;
    } catch (err) {
      console.error('Error fetching backoffice data:', err);
      isLoading = false;
    }
  }

  async function triggerReset() {
    isResetting = true;
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (res.ok) {
        showResetModal = false;
        notification = 'Inventario y métricas restauradas al estado inicial.';
        setTimeout(() => notification = null, 3500);
        await fetchData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      isResetting = false;
    }
  }

  function formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  }

  function formatDate(isoStr: string): string {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' +
           d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  onMount(() => {
    fetchData();

    // Setup SSE for real-time reactivity
    try {
      eventSource = new EventSource(`${API_BASE}/events`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === 'order_created' || data.action === 'demo_reset') {
            fetchData();
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('SSE no disponible, usando polling de respaldo.');
    }

    // Safety polling fallback every 3s
    pollInterval = setInterval(fetchData, 3000);
  });

  onDestroy(() => {
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

<div class="min-h-screen bg-[#090a0f] text-slate-200 font-sans antialiased selection:bg-sky-500/20">
  <!-- Top Navigation Bar -->
  <header class="border-b border-white/10 bg-[#0d111a]/90 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-md bg-slate-900 border border-sky-500/30 flex items-center justify-center text-sky-400 font-semibold text-sm">
          TB
        </div>
        <div>
          <span class="text-white font-semibold text-sm tracking-tight">Terre Bleu Backoffice</span>
          <span class="text-xs text-slate-400 ml-2 hidden sm:inline border-l border-white/10 pl-2">Engine: Go HTTP + Svelte 5 Runes</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-3">
        <a
          href="/"
          class="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-white/10 bg-[#131722] hover:bg-[#171d2b] transition-colors"
        >
          ← Ir a la Tienda
        </a>

        <button
          onclick={() => showResetModal = true}
          class="text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-md border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 transition-colors flex items-center space-x-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reiniciar Demo</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Live Toast Notification -->
  {#if notification}
    <div class="fixed bottom-6 right-6 z-50 bg-[#131722] border border-sky-500/30 text-white px-4 py-3 rounded-lg shadow-xl text-xs flex items-center space-x-2">
      <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
      <span>{notification}</span>
    </div>
  {/if}

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Real-time KPI Metric Row -->
    <section class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div class="bg-[#0d111a] border border-white/10 rounded-lg p-4">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block">Ingresos Totales</span>
        <span class="text-2xl font-bold text-white tabular-nums tracking-tight mt-1 block">
          {formatCurrency(stats.totalRevenue)}
        </span>
      </div>

      <div class="bg-[#0d111a] border border-white/10 rounded-lg p-4">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block">Ventas Registradas</span>
        <span class="text-2xl font-bold text-white tabular-nums tracking-tight mt-1 block">
          {stats.totalOrders}
        </span>
      </div>

      <div class="bg-[#0d111a] border border-white/10 rounded-lg p-4">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block">Clientes Únicos</span>
        <span class="text-2xl font-bold text-white tabular-nums tracking-tight mt-1 block">
          {stats.totalCustomers}
        </span>
      </div>

      <div class="bg-[#0d111a] border border-white/10 rounded-lg p-4">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block">Unidades Vendidas</span>
        <span class="text-2xl font-bold text-sky-400 tabular-nums tracking-tight mt-1 block">
          {stats.totalUnitsSold}
        </span>
      </div>

      <div class="bg-[#0d111a] border border-white/10 rounded-lg p-4 col-span-2 md:col-span-1">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block">Stock Total en Almacén</span>
        <span class="text-2xl font-bold text-slate-300 tabular-nums tracking-tight mt-1 block">
          {stats.totalStockLeft} <span class="text-xs text-slate-400 font-normal">uds</span>
        </span>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="flex items-center justify-between border-b border-white/10 pb-3">
      <div class="flex space-x-1 bg-[#0d111a] p-1 rounded-lg border border-white/10">
        <button
          onclick={() => activeTab = 'inventory'}
          class="px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'inventory' ? 'bg-[#171d2b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
        >
          Inventario y Stock ({products.length})
        </button>

        <button
          onclick={() => activeTab = 'sales'}
          class="px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'sales' ? 'bg-[#171d2b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
        >
          Historial de Ventas ({orders.length})
        </button>

        <button
          onclick={() => activeTab = 'customers'}
          class="px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'customers' ? 'bg-[#171d2b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
        >
          Directorio de Clientes ({customers.length})
        </button>
      </div>

      <div class="text-xs text-slate-400 flex items-center space-x-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Conexión en vivo activa (:8080)</span>
      </div>
    </div>

    <!-- TAB 1: INVENTARIO -->
    {#if activeTab === 'inventory'}
      <div class="bg-[#0d111a] border border-white/10 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white">Catálogo de Productos y Existencias</h2>
          <span class="text-xs text-slate-400">El stock se reduce de manera síncrona en cada orden completada</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-[#131722] text-slate-400 uppercase font-medium border-b border-white/10">
              <tr>
                <th class="py-3 px-4">Producto</th>
                <th class="py-3 px-4">Categoría</th>
                <th class="py-3 px-4 text-right">Precio</th>
                <th class="py-3 px-4 text-center">Stock Inicial</th>
                <th class="py-3 px-4 text-center">Stock Actual</th>
                <th class="py-3 px-4 text-center">Estado Almacén</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              {#each products as p (p.id)}
                <tr class="hover:bg-white/[0.02] transition-colors">
                  <td class="py-3 px-4 flex items-center space-x-3">
                    <img src={p.image} alt={p.title} class="w-9 h-9 rounded object-cover border border-white/10 bg-slate-900" />
                    <div>
                      <span class="font-medium text-white block">{p.title}</span>
                      <span class="text-[11px] text-slate-400 block truncate max-w-xs">{p.description}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-slate-400">{p.category}</td>
                  <td class="py-3 px-4 text-right font-medium text-white tabular-nums">{formatCurrency(p.price)}</td>
                  <td class="py-3 px-4 text-center text-slate-400 tabular-nums">{p.initialStock} uds</td>
                  <td class="py-3 px-4 text-center">
                    <span class="font-bold tabular-nums {p.stock < 5 ? 'text-rose-400' : 'text-emerald-400'}">
                      {p.stock} uds
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    {#if p.stock === 0}
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950/40 text-rose-300 border border-rose-800/40">Agotado</span>
                    {:else if p.stock < 5}
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/40 text-amber-300 border border-amber-800/40">Bajo Stock</span>
                    {:else}
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">Disponible</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- TAB 2: VENTAS (ÓRDENES) -->
    {#if activeTab === 'sales'}
      <div class="bg-[#0d111a] border border-white/10 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white">Registro Cronológico de Ventas</h2>
          <span class="text-xs text-slate-400">Total transacciones: {orders.length}</span>
        </div>

        {#if orders.length === 0}
          <div class="p-12 text-center text-slate-400 text-xs">
            <p>No se han registrado compras aún.</p>
            <p class="mt-1 text-slate-400">Abre la tienda, realiza un checkout ficticio ingresando un nombre y observa cómo aparece aquí en vivo.</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-[#131722] text-slate-400 uppercase font-medium border-b border-white/10">
                <tr>
                  <th class="py-3 px-4">ID Orden</th>
                  <th class="py-3 px-4">Fecha / Hora</th>
                  <th class="py-3 px-4">Cliente</th>
                  <th class="py-3 px-4">Artículos Comprados</th>
                  <th class="py-3 px-4 text-right">Monto Total</th>
                  <th class="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                {#each orders as o (o.id)}
                  <tr class="hover:bg-white/[0.02] transition-colors">
                    <td class="py-3 px-4 font-mono text-sky-400 font-semibold">{o.id}</td>
                    <td class="py-3 px-4 text-slate-400 tabular-nums">{formatDate(o.createdAt)}</td>
                    <td class="py-3 px-4 font-medium text-white">{o.customerName}</td>
                    <td class="py-3 px-4">
                      <div class="space-y-1">
                        {#each o.items as it}
                          <div class="flex items-center space-x-1.5 text-[11px] text-slate-300">
                            <span class="text-slate-400 font-mono">{it.quantity}x</span>
                            <span>{it.title}</span>
                            <span class="text-slate-400 tabular-nums font-mono">({formatCurrency(it.subtotal)})</span>
                          </div>
                        {/each}
                      </div>
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-white tabular-nums">{formatCurrency(o.total)}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-950/40 text-sky-300 border border-sky-800/40">Completada (•••• {o.cardLast4})</span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}

    <!-- TAB 3: CLIENTES -->
    {#if activeTab === 'customers'}
      <div class="bg-[#0d111a] border border-white/10 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white">Directorio Acumulado de Clientes</h2>
          <span class="text-xs text-slate-400">Total clientes registrados: {customers.length}</span>
        </div>

        {#if customers.length === 0}
          <div class="p-12 text-center text-slate-400 text-xs">
            <p>Ningún cliente ha realizado transacciones todavía.</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-[#131722] text-slate-400 uppercase font-medium border-b border-white/10">
                <tr>
                  <th class="py-3 px-4">Nombre del Cliente</th>
                  <th class="py-3 px-4 text-center">Órdenes Totales</th>
                  <th class="py-3 px-4 text-right">Gasto Acumulado</th>
                  <th class="py-3 px-4 text-right">Última Compra</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                {#each customers as c (c.name)}
                  <tr class="hover:bg-white/[0.02] transition-colors">
                    <td class="py-3 px-4 font-medium text-white flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-sky-400">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td class="py-3 px-4 text-center font-semibold text-slate-300 tabular-nums">{c.ordersCount}</td>
                    <td class="py-3 px-4 text-right font-bold text-white tabular-nums">{formatCurrency(c.totalSpent)}</td>
                    <td class="py-3 px-4 text-right text-slate-400 tabular-nums">{formatDate(c.lastOrderAt)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <!-- Reset Confirmation Modal -->
  {#if showResetModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div class="bg-[#131722] border border-white/10 rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4">
        <h3 class="text-sm font-bold text-white">¿Reiniciar Datos de la Demostración?</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Esta acción restaurará el stock inicial de todos los productos y vaciará el historial de órdenes y clientes de prueba. Es ideal para preparar la siguiente presentación comercial.
        </p>

        <div class="flex items-center justify-end space-x-2 pt-2">
          <button
            onclick={() => showResetModal = false}
            class="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-md border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>

          <button
            onclick={triggerReset}
            disabled={isResetting}
            class="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors disabled:opacity-50"
          >
            {isResetting ? 'Reiniciando...' : 'Confirmar Reinicio'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
