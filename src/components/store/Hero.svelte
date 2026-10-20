<script lang="ts">
  import { store } from '../../lib/store.svelte';

  function openFeaturedPDP() {
    const comfort = store.products.find(p => p.id === 'prod-comfort-edit');
    if (comfort) {
      store.selectedProduct = comfort;
    }
  }
</script>

<section id="hero" class="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-[#faf9f6] text-slate-900 border-b border-slate-200 max-w-full">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Column: Copy & CTAs -->
      <div class="space-y-6 max-w-xl">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-950 leading-tight">
          Elixires de Lavanda Pura & Bienestar.
        </h1>

        <p class="text-base text-slate-600 leading-relaxed font-normal">
          Inspirada en la serenidad de los campos canadienses. Fórmulas botánicas artesanales cosechadas para tu rutina de sosiego, cuidado personal y rituales de calma diaria.
        </p>

        <div class="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="/tienda"
            class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs inline-block"
          >
            Ver Catálogo de Tienda →
          </a>

          <button
            onclick={openFeaturedPDP}
            class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-800 bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center space-x-2 shadow-2xs"
          >
            <span>The Comfort Edit</span>
            <span class="text-indigo-600 font-mono font-bold tabular-nums">$45 CAD</span>
          </button>
        </div>

        <div class="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-slate-600 text-xs">
          <div>
            <span class="font-bold text-slate-900 block tabular-nums">100% Orgánico</span>
            <span class="text-[11px]">Destilación artesanal</span>
          </div>
          <div>
            <span class="font-bold text-slate-900 block tabular-nums">Sin Químicos</span>
            <span class="text-[11px]">Libre de parabenos</span>
          </div>
          <div>
            <span class="font-bold text-slate-900 block tabular-nums">Ontario, CA</span>
            <span class="text-[11px]">Cultivo sustentable</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Clean Heritage Visual -->
      <div class="relative">
        <div class="aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-white">
          <img
            src="https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080"
            alt="Colección Botánica Terre Bleu"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</section>
