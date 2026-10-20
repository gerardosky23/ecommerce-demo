<script lang="ts">
  import { store } from '../../lib/store.svelte';

  function scrollToCatalog() {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function openFeaturedPDP() {
    const comfort = store.products.find(p => p.id === 'prod-comfort-edit');
    if (comfort) {
      store.selectedProduct = comfort;
    }
  }
</script>

<section id="hero" class="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-[#090c13] text-white border-b border-white/10 max-w-full">
  <!-- Subtle architectural background image -->
  <div class="absolute inset-0 z-0 opacity-25 overflow-hidden pointer-events-none">
    <img
      src="https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080"
      alt="Campos de Lavanda Terre Bleu"
      class="w-full h-full object-cover object-center filter grayscale contrast-125 max-w-full"
    />
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl space-y-6">
      <div class="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md border border-white/15 bg-white/5 text-[11px] font-mono tracking-wider uppercase text-slate-300">
        <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        <span>Cosecha Orgánica 2026 • Terre Bleu Farm</span>
      </div>

      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
        Elixires Botánicos de Lavanda Pura.
      </h1>

      <p class="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
        Inspirada en la calma de los campos canadienses. Fórmulas artesanales para el cuidado corporal, relajación profunda y rituales de sosiego diario.
      </p>

      <div class="pt-4 flex flex-wrap items-center gap-3">
        <button
          onclick={scrollToCatalog}
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
        >
          Explorar Colección
        </button>

        <button
          onclick={openFeaturedPDP}
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-slate-900/80 hover:bg-slate-800 rounded-md border border-white/20 transition-colors cursor-pointer flex items-center space-x-2"
        >
          <span>The Comfort Edit</span>
          <span class="text-sky-400 font-mono tabular-nums">$45 CAD</span>
        </button>
      </div>

      <div class="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-slate-400 text-xs">
        <div>
          <span class="font-bold text-white block tabular-nums">100% Orgánico</span>
          <span class="text-[11px]">Destilación artesanal</span>
        </div>
        <div>
          <span class="font-bold text-white block tabular-nums">Sin Químicos</span>
          <span class="text-[11px]">Libre de parabenos</span>
        </div>
        <div>
          <span class="font-bold text-white block tabular-nums">Ontario, CA</span>
          <span class="text-[11px]">Cultivo sustentable</span>
        </div>
      </div>
    </div>
  </div>
</section>
