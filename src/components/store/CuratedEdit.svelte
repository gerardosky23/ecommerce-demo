<script lang="ts">
  import { store } from '../../lib/store.svelte';

  const comfortEdit = $derived(store.products.find(p => p.id === 'prod-comfort-edit') || store.products[0]);

  function handleAdd() {
    if (comfortEdit && comfortEdit.stock > 0) {
      store.addToCart(comfortEdit, 1);
    }
  }

  function handleViewDetails() {
    if (comfortEdit) {
      store.selectedProduct = comfortEdit;
    }
  }
</script>

{#if comfortEdit}
  <section id="curated" class="py-20 bg-[#0d111a] text-white border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Visual Presentation -->
        <div class="relative group cursor-pointer" onclick={handleViewDetails}>
          <div class="aspect-4/3 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
            <img
              src={comfortEdit.image}
              alt={comfortEdit.title}
              class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          </div>
          <div class="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-md border border-white/10 text-xs font-mono text-slate-300">
            Edición Limitada • Cosecha 2026
          </div>
        </div>

        <!-- Copy & Actions -->
        <div class="space-y-6">
          <div class="space-y-2">
            <span class="text-xs font-mono uppercase tracking-widest text-sky-400">The Terre Bleu Edit</span>
            <h2 class="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {comfortEdit.title}
            </h2>
          </div>

          <div class="flex items-baseline space-x-3">
            <span class="text-3xl font-bold text-white tabular-nums">
              ${comfortEdit.price.toFixed(2)} CAD
            </span>
            {#if comfortEdit.compareAt}
              <span class="text-lg text-slate-500 line-through tabular-nums">
                ${comfortEdit.compareAt.toFixed(2)} CAD
              </span>
              <span class="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                Ahorro de $15 CAD
              </span>
            {/if}
          </div>

          <p class="text-slate-300 text-sm leading-relaxed">
            {comfortEdit.description}
          </p>

          <div class="bg-[#131722] border border-white/10 rounded-lg p-4 space-y-2 text-xs">
            <div class="font-semibold text-white">El set exclusivo incluye:</div>
            <ul class="space-y-1 text-slate-300 list-disc list-inside">
              <li>Lavender Bath Soak (sales minerales del Mar Muerto con lavanda)</li>
              <li>Aromatic Culinary Bud (flores secas comestibles para infusión)</li>
              <li>Floral Water Mist (hidrolato puro destilado al vapor)</li>
            </ul>
          </div>

          <!-- Stock Status -->
          <div class="flex items-center space-x-3 text-xs">
            <span class="flex items-center space-x-1.5">
              <span class="w-2 h-2 rounded-full {comfortEdit.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
              <span class="text-slate-300 font-mono">Disponibilidad en almacén:</span>
            </span>
            <span class="font-bold tabular-nums {comfortEdit.stock < 5 ? 'text-amber-400' : 'text-white'}">
              {comfortEdit.stock} unidades
            </span>
          </div>

          <div class="flex items-center space-x-3 pt-2">
            <button
              onclick={handleAdd}
              disabled={comfortEdit.stock <= 0}
              class="flex-1 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {comfortEdit.stock > 0 ? 'Añadir al Carrito' : 'Agotado Temporalmente'}
            </button>

            <button
              onclick={handleViewDetails}
              class="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-slate-300 hover:text-white bg-[#131722] hover:bg-[#171d2b] rounded-md border border-white/10 transition-colors cursor-pointer"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}
