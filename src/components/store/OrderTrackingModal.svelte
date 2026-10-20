<script lang="ts">
  import { store } from '../../lib/store.svelte';

  function close() {
    store.closeTracking();
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }
</script>

{#if store.isTrackingOpen && store.trackingOrder}
  {@const order = store.trackingOrder}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
    <button
      type="button"
      aria-label="Cerrar seguimiento"
      class="absolute inset-0 bg-transparent w-full h-full border-none cursor-default"
      onclick={close}
    ></button>

    <div class="relative bg-white border border-slate-200 rounded-lg max-w-xl w-full overflow-hidden shadow-sm z-10 p-6 sm:p-8 space-y-6 text-slate-900 max-h-[92vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-xl font-serif font-bold text-slate-950">Seguimiento de Pedido</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              #{order.id}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Monitoreo logístico y despacho programado en tiempo real.
          </p>
        </div>

        <button
          type="button"
          aria-label="Cerrar ventana"
          onclick={close}
          class="w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Order Details Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Destinatario</span>
          <span class="font-bold text-slate-900 block">{order.customerName}</span>
          <span class="text-slate-500 text-[11px] block">{formatDate(order.createdAt)}</span>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Dirección de Entrega</span>
          <span class="font-medium text-slate-900 block truncate" title={order.shippingAddress || 'Dirección no especificada'}>
            {order.shippingAddress || 'Dirección de Entrega Registrada'}
          </span>
          {#if order.shippingCity}
            <span class="text-slate-500 text-[11px] block">{order.shippingCity}</span>
          {/if}
        </div>
      </div>

      <!-- Shipping Progress Stepper -->
      <div class="space-y-2 pt-1">
        <div class="flex justify-between text-[11px] font-medium text-slate-600">
          <span class="text-slate-900 font-semibold">Estado de la entrega:</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            En proceso de despacho
          </span>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-slate-900"></div>
            <span class="text-slate-800 font-medium">Recibido</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-slate-900"></div>
            <span class="text-slate-800 font-medium">Empaque</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-sky-600 animate-pulse"></div>
            <span class="text-sky-700 font-bold">En camino</span>
          </div>
          <div class="space-y-1">
            <div class="h-1.5 rounded-full bg-slate-200"></div>
            <span class="text-slate-400">Entregado</span>
          </div>
        </div>
      </div>

      <!-- Map View Placeholder (Ready for future free Map API) -->
      <div class="relative h-64 sm:h-72 w-full rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <!-- Technical Map Background Grid SVG -->
        <svg class="absolute inset-0 w-full h-full text-slate-200 opacity-60" fill="none" viewBox="0 0 400 300" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" stroke-width="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <!-- Mock Route Path -->
          <path d="M 40 220 Q 150 120 220 160 T 360 80" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" />
          <circle cx="40" cy="220" r="5" fill="#0f172a" />
          <circle cx="220" cy="160" r="6" fill="#0284c7" />
          <circle cx="360" cy="80" r="5" fill="#10b981" />
        </svg>

        <!-- Centered Card Over Map -->
        <div class="relative z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-5 max-w-sm space-y-2.5 shadow-2xs">
          <div class="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mx-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              En proceso
            </span>
            <h4 class="text-xs font-bold text-slate-900">Módulo de Rastreo GPS Satelital</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Despacho en tránsito hacia <strong class="text-slate-900">{order.shippingAddress || 'destino'}</strong>.
            </p>
          </div>

          <p class="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
            Espacio reservado para API de mapas interactivo y telemetría de ruta.
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          onclick={close}
          class="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors cursor-pointer text-center"
        >
          Cerrar Seguimiento
        </button>
      </div>
    </div>
  </div>
{/if}