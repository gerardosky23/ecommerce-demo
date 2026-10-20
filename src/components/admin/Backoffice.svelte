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
    shippingAddress?: string;
    shippingCity?: string;
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

  // Auth State
  let isAuthenticated = $state(false);
  let loginUsername = $state('');
  let loginPassword = $state('');
  let loginError = $state<string | null>(null);

  // Dashboard State
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

  const isLocalAstro = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
    (window.location.port === '4321' || window.location.port === '3000');
  const API_BASE = isLocalAstro ? 'http://localhost:8080/api' : '/api';

  function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (loginUsername.trim() === 'demo' && loginPassword.trim() === 'demo') {
      isAuthenticated = true;
      loginError = null;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tb_admin_session', 'true');
      }
      fetchData();
    } else {
      loginError = 'Usuario o contraseña incorrectos. Utiliza demo / demo.';
    }
  }

  function handleLogout() {
    isAuthenticated = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tb_admin_session');
    }
  }

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

  async function toggleProductSoldOut(product: Product) {
    try {
      const res = await fetch(`${API_BASE}/products/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, action: 'toggle' })
      });
      if (res.ok) {
        const data = await res.json();
        const isNowSoldOut = data.product?.stock === 0;
        notification = isNowSoldOut 
          ? `"${product.title}" marcado como AGOTADO (Sold Out). Reflejado en tienda.`
          : `Stock de "${product.title}" REPUESTO a ${data.product?.stock} uds.`;
        setTimeout(() => notification = null, 3500);
        await fetchData();
      }
    } catch (err) {
      console.error('Error toggling stock:', err);
    }
  }

  async function triggerReset() {
    isResetting = true;
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (res.ok) {
        showResetModal = false;
        notification = 'Inventario y registros restablecidos correctamente.';
        setTimeout(() => notification = null, 3000);
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
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) + ' ' +
           d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onMount(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('tb_admin_session') === 'true') {
      isAuthenticated = true;
    }

    fetchData();

    try {
      eventSource = new EventSource(`${API_BASE}/events`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === 'order_created' || data.action === 'demo_reset' || data.action === 'stock_updated') {
            fetchData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    pollInterval = setInterval(fetchData, 3000);
  });

  onDestroy(() => {
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

{#if !isAuthenticated}
  <!-- LOGIN VIEW (Styled identically to project design) -->
  <div class="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 antialiased text-slate-800">
    <div class="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 shadow-sm space-y-6">
      <!-- Brand Header -->
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-sm font-bold font-serif mx-auto">
          TB
        </div>
        <h1 class="text-xl font-bold font-serif text-slate-950 tracking-tight">Terre Bleu ERP</h1>
        <p class="text-xs text-slate-500 font-sans">Panel Administrativo de Gestión Comercial</p>
      </div>

      <!-- Error message -->
      {#if loginError}
        <div class="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-md text-xs">
          {loginError}
        </div>
      {/if}

      <!-- Form -->
      <form onsubmit={handleLogin} class="space-y-4">
        <div class="space-y-1.5">
          <label for="login-username" class="block text-xs font-medium text-slate-700">
            Usuario
          </label>
          <input
            id="login-username"
            type="text"
            bind:value={loginUsername}
            placeholder="demo"
            required
            class="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
            autocomplete="username"
          />
        </div>

        <div class="space-y-1.5">
          <label for="login-password" class="block text-xs font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            bind:value={loginPassword}
            placeholder="••••"
            required
            class="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 shadow-2xs"
            autocomplete="current-password"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>

      <!-- Credentials Hint -->
      <div class="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-mono">
        Credenciales de acceso: <strong class="text-slate-600">demo</strong> / <strong class="text-slate-600">demo</strong>
      </div>
    </div>
  </div>
{:else}
  <!-- AUTHENTICATED DASHBOARD WITH LEFT SIDEBAR -->
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-slate-200">
    <!-- Left Sidebar -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
      <div>
        <!-- Brand -->
        <div class="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-serif">
              TB
            </div>
            <div>
              <span class="text-sm font-bold text-slate-900 block leading-tight">Terre Bleu</span>
              <span class="text-[10px] text-slate-500 font-mono">Gestión Comercial</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-3 space-y-1">
          <button
            onclick={() => activeTab = 'inventory'}
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer {activeTab === 'inventory' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
          >
            <div class="flex items-center space-x-2.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Inventario</span>
            </div>
            <span class="text-[11px] tabular-nums text-slate-500">{products.length}</span>
          </button>

          <button
            onclick={() => activeTab = 'sales'}
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer {activeTab === 'sales' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
          >
            <div class="flex items-center space-x-2.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Ventas</span>
            </div>
            <span class="text-[11px] tabular-nums text-slate-500">{orders.length}</span>
          </button>

          <button
            onclick={() => activeTab = 'customers'}
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer {activeTab === 'customers' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
          >
            <div class="flex items-center space-x-2.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Clientes</span>
            </div>
            <span class="text-[11px] tabular-nums text-slate-500">{customers.length}</span>
          </button>
        </nav>

        <div class="p-3 border-t border-slate-200 space-y-1">
          <a
            href="/"
            class="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ir a la Tienda</span>
          </a>

          <button
            onclick={() => showResetModal = true}
            class="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reiniciar Demo</span>
          </button>
        </div>
      </div>

      <!-- Sidebar footer with Logout -->
      <div class="p-3 border-t border-slate-200 space-y-2">
        <button
          onclick={handleLogout}
          class="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>

        <div class="px-3 text-[11px] text-slate-400 flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Sesión activa: demo</span>
        </div>
      </div>
    </aside>

    <!-- Main Content View -->
    <main class="flex-1 p-6 md:p-8 space-y-6 overflow-x-hidden">
      <!-- Top Metrics Summary -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-white border border-slate-200 rounded-lg p-3.5">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Ingresos</span>
          <span class="text-xl font-bold text-slate-900 tabular-nums block mt-0.5">
            {formatCurrency(stats.totalRevenue)}
          </span>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-3.5">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Ventas</span>
          <span class="text-xl font-bold text-slate-900 tabular-nums block mt-0.5">
            {stats.totalOrders}
          </span>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-3.5">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Clientes</span>
          <span class="text-xl font-bold text-slate-900 tabular-nums block mt-0.5">
            {stats.totalCustomers}
          </span>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-3.5">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Unidades</span>
          <span class="text-xl font-bold text-slate-900 tabular-nums block mt-0.5">
            {stats.totalUnitsSold}
          </span>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-3.5 col-span-2 md:col-span-1">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Stock Total</span>
          <span class="text-xl font-bold text-slate-900 tabular-nums block mt-0.5">
            {stats.totalStockLeft} <span class="text-xs font-normal text-slate-500">uds</span>
          </span>
        </div>
      </div>

      <!-- TAB 1: INVENTARIO (WITH SOLD OUT TOGGLE) -->
      {#if activeTab === 'inventory'}
        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900">Catálogo de Productos y Existencias</h2>
            <span class="text-xs text-slate-500">{products.length} productos registrados</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-4">Producto</th>
                  <th class="py-2.5 px-4">Categoría</th>
                  <th class="py-2.5 px-4 text-right">Precio</th>
                  <th class="py-2.5 px-4 text-center">Inicial</th>
                  <th class="py-2.5 px-4 text-center">Actual</th>
                  <th class="py-2.5 px-4 text-center">Estado</th>
                  <th class="py-2.5 px-4 text-center">Control Sold Out</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {#each products as p (p.id)}
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-3 px-4 flex items-center space-x-3">
                      <img src={p.image} alt={p.title} class="w-8 h-8 rounded object-cover border border-slate-200 bg-slate-100 shrink-0" />
                      <div>
                        <span class="font-medium text-slate-900 block">{p.title}</span>
                        <span class="text-[11px] text-slate-500 block truncate max-w-xs">{p.category}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-slate-600">{p.category}</td>
                    <td class="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(p.price)}</td>
                    <td class="py-3 px-4 text-center text-slate-500 tabular-nums">{p.initialStock}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="font-bold tabular-nums {p.stock === 0 ? 'text-rose-600' : 'text-slate-900'}">
                        {p.stock}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      {#if p.stock === 0}
                        <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">Agotado</span>
                      {:else if p.stock < 5}
                        <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Bajo Stock</span>
                      {:else}
                        <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Disponible</span>
                      {/if}
                    </td>
                    <td class="py-3 px-4 text-center">
                      {#if p.stock > 0}
                        <button
                          onclick={() => toggleProductSoldOut(p)}
                          class="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                          title="Simular agotamiento de stock"
                        >
                          Agotar
                        </button>
                      {:else}
                        <button
                          onclick={() => toggleProductSoldOut(p)}
                          class="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer"
                          title="Reponer stock del producto"
                        >
                          Reponer
                        </button>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- TAB 2: VENTAS -->
      {#if activeTab === 'sales'}
        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900">Registro Cronológico de Ventas</h2>
            <span class="text-xs text-slate-500">{orders.length} pedidos</span>
          </div>

          {#if orders.length === 0}
            <div class="p-12 text-center text-slate-500 text-xs">
              <p>No se han registrado transacciones todavía.</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">ID Orden</th>
                    <th class="py-2.5 px-4">Fecha / Hora</th>
                    <th class="py-2.5 px-4">Cliente</th>
                    <th class="py-2.5 px-4">Dirección de Envío</th>
                    <th class="py-2.5 px-4">Artículos</th>
                    <th class="py-2.5 px-4 text-right">Total</th>
                    <th class="py-2.5 px-4 text-center">Pago</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {#each orders as o (o.id)}
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-3 px-4 font-mono font-medium text-slate-900">{o.id}</td>
                      <td class="py-3 px-4 text-slate-500 tabular-nums">{formatDate(o.createdAt)}</td>
                      <td class="py-3 px-4 font-medium text-slate-900">{o.customerName}</td>
                      <td class="py-3 px-4 text-slate-600 text-[11px]">
                        <span class="font-medium text-slate-800">{o.shippingAddress || 'No especificada'}</span>
                        {#if o.shippingCity}
                          <br><span class="text-slate-400 text-[10px]">{o.shippingCity}</span>
                        {/if}
                      </td>
                      <td class="py-3 px-4">
                        <div class="space-y-0.5">
                          {#each o.items as it}
                            <div class="text-[11px] text-slate-600">
                              <span class="font-mono text-slate-500">{it.quantity}x</span>
                              <span>{it.title}</span>
                              <span class="text-slate-400 tabular-nums">({formatCurrency(it.subtotal)})</span>
                            </div>
                          {/each}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(o.total)}</td>
                      <td class="py-3 px-4 text-center">
                        <span class="text-slate-600 font-mono text-[11px]">•••• {o.cardLast4}</span>
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
        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900">Directorio de Clientes</h2>
            <span class="text-xs text-slate-500">{customers.length} clientes</span>
          </div>

          {#if customers.length === 0}
            <div class="p-12 text-center text-slate-500 text-xs">
              <p>Ningún cliente registrado aún.</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">Nombre</th>
                    <th class="py-2.5 px-4 text-center">Órdenes</th>
                    <th class="py-2.5 px-4 text-right">Total Acumulado</th>
                    <th class="py-2.5 px-4 text-right">Última Transacción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {#each customers as c (c.name)}
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-3 px-4 font-medium text-slate-900 flex items-center space-x-2">
                        <div class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </td>
                      <td class="py-3 px-4 text-center font-medium text-slate-800 tabular-nums">{c.ordersCount}</td>
                      <td class="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(c.totalSpent)}</td>
                      <td class="py-3 px-4 text-right text-slate-500 tabular-nums">{formatDate(c.lastOrderAt)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      {/if}
    </main>

    <!-- Live Toast Notification -->
    {#if notification}
      <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-lg text-xs flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>{notification}</span>
      </div>
    {/if}

    <!-- Reset Confirmation Modal -->
    {#if showResetModal}
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div class="bg-white border border-slate-200 rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4">
          <h3 class="text-sm font-bold text-slate-900">¿Restablecer Demostración?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Esta acción restaurará el stock inicial de todos los artículos y eliminará el historial de órdenes y clientes creados en esta sesión de prueba.
          </p>

          <div class="flex items-center justify-end space-x-2 pt-2">
            <button
              onclick={() => showResetModal = false}
              class="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onclick={triggerReset}
              disabled={isResetting}
              class="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors disabled:opacity-50"
            >
              {isResetting ? 'Restableciendo...' : 'Restablecer'}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
