<script lang="ts">
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<footer class="bg-[#07090d] text-slate-400 text-xs border-t border-white/10 py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Brand & Heritage -->
      <div class="space-y-3 md:col-span-1">
        <span class="text-xl font-serif font-bold text-white tracking-widest uppercase block">
          Terre Bleu
        </span>
        <p class="text-[11px] leading-relaxed text-slate-400">
          Campos de cultivo de lavanda orgánica y destilería botánica artesanal. Creado para inspirar momentos de calma consciente en el hogar.
        </p>
        <span class="text-[10px] font-mono text-slate-500 block">Ontario, Canadá • Fundada en 2011</span>
      </div>

      <!-- Navigation -->
      <div class="space-y-2">
        <span class="text-xs font-semibold text-white uppercase tracking-wider block">Navegación</span>
        <ul class="space-y-1.5 text-[11px]">
          <li><button onclick={() => scrollToSection('hero')} class="hover:text-sky-400 transition-colors cursor-pointer">Inicio</button></li>
          <li><button onclick={() => scrollToSection('curated')} class="hover:text-sky-400 transition-colors cursor-pointer">The Comfort Edit</button></li>
          <li><button onclick={() => scrollToSection('catalog')} class="hover:text-sky-400 transition-colors cursor-pointer">Catálogo Completo</button></li>
          <li><a href="/admin" target="_blank" class="text-sky-400 hover:text-sky-300 transition-colors">Panel Backoffice (:8080)</a></li>
        </ul>
      </div>

      <!-- Botanical Categories -->
      <div class="space-y-2">
        <span class="text-xs font-semibold text-white uppercase tracking-wider block">Colecciones</span>
        <ul class="space-y-1.5 text-[11px]">
          <li><span class="hover:text-slate-300">Aceites Esenciales Puros</span></li>
          <li><span class="hover:text-slate-300">Sales Minerales & Baño</span></li>
          <li><span class="hover:text-slate-300">Cuidado Botánico de Manos</span></li>
          <li><span class="hover:text-slate-300">Ramilletes y Flores Secas</span></li>
        </ul>
      </div>

      <!-- Technical Architecture / Anti-Slop notice -->
      <div class="space-y-2">
        <span class="text-xs font-semibold text-white uppercase tracking-wider block">Especificación Demo</span>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          Diseñado bajo las directivas estrictas de AGENTS.md: Astro 5, Svelte 5 Runes, Go HTTP Server, cero ornamentación de vanidad, tipografía tabular y validación multi-motor.
        </p>
      </div>
    </div>

    <!-- Copyright -->
    <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
      <div>© 2026 Terre Bleu Botanical Demo. Maqueta interactiva para presentaciones comerciales.</div>
      <div class="flex items-center space-x-4">
        <span>Astro 5 + Svelte 5</span>
        <span>•</span>
        <span>Go Server :8080</span>
      </div>
    </div>
  </div>
</footer>
