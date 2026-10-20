<script lang="ts">
  import { CheckIcon, ArrowRight, WhatsAppIcon } from '../Icons.svelte';

  interface ModuleOption {
    id: string;
    name: string;
    category: string;
    weeks: number;
    basePrice: number;
    recommended?: boolean;
  }

  const modulesList: ModuleOption[] = [
    { id: 'sunat', name: 'Contabilidad & Localización SUNAT', category: 'Finanzas', weeks: 2, basePrice: 1200, recommended: true },
    { id: 'invoicing', name: 'Facturación Electrónica & SIRE', category: 'Fiscal', weeks: 1, basePrice: 800, recommended: true },
    { id: 'planiflex', name: 'Planiflex: Planillas Perú', category: 'RRHH', weeks: 3, basePrice: 1500, recommended: true },
    { id: 'crm', name: 'Ventas & CRM Comercial', category: 'Comercial', weeks: 2, basePrice: 900 },
    { id: 'inventory', name: 'Inventario Multialmacén & Kardex', category: 'Logística', weeks: 3, basePrice: 1400 },
    { id: 'pos', name: 'Punto de Venta (POS)', category: 'Retail', weeks: 2, basePrice: 1000 },
    { id: 'mrp', name: 'Manufactura & Producción (MRP)', category: 'Operaciones', weeks: 4, basePrice: 2200 },
    { id: 'custom', name: 'Desarrollos e Integración API', category: 'Desarrollo', weeks: 3, basePrice: 1800 }
  ];

  let selectedModules = $state<string[]>(['sunat', 'invoicing', 'planiflex']);
  let usersCount = $state<number>(15);
  let editionType = $state<'community' | 'enterprise'>('enterprise');

  function toggleModule(id: string) {
    if (selectedModules.includes(id)) {
      if (selectedModules.length > 1) {
        selectedModules = selectedModules.filter(m => m !== id);
      }
    } else {
      selectedModules = [...selectedModules, id];
    }
  }

  // Svelte 5 Derived Runes
  let totalWeeks = $derived.by(() => {
    const selected = modulesList.filter(m => selectedModules.includes(m.id));
    const rawWeeks = selected.reduce((sum, m) => sum + m.weeks, 2);
    // Concurrent agile sprints factor
    return Math.max(4, Math.round(rawWeeks * 0.65));
  });

  let estimatedMinSoles = $derived.by(() => {
    const selected = modulesList.filter(m => selectedModules.includes(m.id));
    const baseSum = selected.reduce((sum, m) => sum + m.basePrice, 2000);
    const userFactor = 1 + (usersCount / 100) * 0.4;
    const editionFactor = editionType === 'enterprise' ? 1.25 : 1.0;
    return Math.round((baseSum * userFactor * editionFactor) / 100) * 100;
  });

  let estimatedMaxSoles = $derived.by(() => {
    return Math.round(estimatedMinSoles * 1.35);
  });
</script>

<div class="glass-card p-6 sm:p-10 border-brand-accent/30 shadow-[0_16px_50px_rgba(2,132,199,0.12)]">
  <div class="text-center max-w-2xl mx-auto mb-8">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-xs font-semibold text-brand-cyan mb-3">
      Simulador Interactivo
    </div>
    <h3 class="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
      Calcula el alcance de tu proyecto Odoo
    </h3>
    <p class="text-xs sm:text-sm text-ink-muted">
      Selecciona los módulos requeridos y el tamaño de tu equipo para obtener una estimación de tiempo y costo referencial.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Configurator controls (Left 7 cols) -->
    <div class="lg:col-span-7 space-y-6">
      <!-- Users Slider -->
      <div class="p-5 rounded-xl bg-white/[0.02] border border-white/10">
        <div class="flex items-center justify-between mb-3">
          <label for="users-range" class="font-display font-semibold text-sm text-white">
            Usuarios del sistema / Empleados:
          </label>
          <span class="font-display font-bold text-base text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
            {usersCount} {usersCount === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>
        <input
          id="users-range"
          type="range"
          min="3"
          max="150"
          step="1"
          bind:value={usersCount}
          class="w-full accent-brand-accent cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
        />
        <div class="flex justify-between text-[11px] text-ink-muted mt-2">
          <span>3 (Micro/Pyme)</span>
          <span>50 (Mediana)</span>
          <span>150+ (Corporativo)</span>
        </div>
      </div>

      <!-- Edition Selector -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class={`p-3.5 rounded-xl text-left border transition-all duration-200 ${
            editionType === 'enterprise'
              ? 'bg-brand-purple/20 border-brand-purple text-white shadow-sm'
              : 'bg-white/[0.02] border-white/10 text-ink-soft hover:border-white/20'
          }`}
          onclick={() => editionType = 'enterprise'}
        >
          <div class="font-display font-bold text-sm text-white flex items-center justify-between">
            <span>Odoo Enterprise</span>
            {#if editionType === 'enterprise'}
              <span class="w-2 h-2 rounded-full bg-brand-purple"></span>
            {/if}
          </div>
          <div class="text-[11px] text-ink-muted mt-1">Soporte oficial, apps móviles y hosting cloud</div>
        </button>

        <button
          type="button"
          class={`p-3.5 rounded-xl text-left border transition-all duration-200 ${
            editionType === 'community'
              ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-sm'
              : 'bg-white/[0.02] border-white/10 text-ink-soft hover:border-white/20'
          }`}
          onclick={() => editionType = 'community'}
        >
          <div class="font-display font-bold text-sm text-white flex items-center justify-between">
            <span>Odoo Community</span>
            {#if editionType === 'community'}
              <span class="w-2 h-2 rounded-full bg-brand-cyan"></span>
            {/if}
          </div>
          <div class="text-[11px] text-ink-muted mt-1">Código abierto on-premise con módulos Flexone</div>
        </button>
      </div>

      <!-- Modules Selection Grid -->
      <div>
        <label class="block font-display font-semibold text-sm text-white mb-3">
          Módulos requeridos para tu operación:
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {#each modulesList as mod}
            {@const isSelected = selectedModules.includes(mod.id)}
            <button
              type="button"
              class={`p-3 rounded-xl text-left border flex items-center justify-between gap-3 transition-all duration-150 ${
                isSelected
                  ? 'bg-brand-accent/15 border-brand-accent/50 text-white'
                  : 'bg-white/[0.02] border-white/5 text-ink-soft hover:border-white/20'
              }`}
              onclick={() => toggleModule(mod.id)}
            >
              <div class="flex items-center gap-2.5">
                <div class={`w-4 h-4 rounded border flex items-center justify-center text-xs ${isSelected ? 'bg-brand-accent border-brand-accent text-white' : 'border-white/30'}`}>
                  {#if isSelected}✓{/if}
                </div>
                <div class="text-xs font-medium">{mod.name}</div>
              </div>
              <span class="text-[10px] text-ink-muted font-mono bg-white/5 px-1.5 py-0.5 rounded">
                +{mod.weeks} sem
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Summary Box (Right 5 cols) -->
    <div class="lg:col-span-5 p-6 rounded-2xl bg-surface/90 border border-white/10 flex flex-col justify-between shadow-xl">
      <div>
        <h4 class="font-display font-bold text-lg text-white mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <span>Resumen de Estimación</span>
          <span class="text-xs font-mono text-emerald-400 font-normal">Pre-diagnóstico</span>
        </h4>

        <div class="space-y-4 mb-6">
          <div class="flex items-center justify-between text-sm">
            <span class="text-ink-muted">Módulos seleccionados:</span>
            <span class="font-display font-bold text-white">{selectedModules.length} áreas</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-ink-muted">Tiempo estimado (Go-Live):</span>
            <span class="font-display font-bold text-brand-cyan text-base">{totalWeeks} semanas aprox.</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-ink-muted">Metodología:</span>
            <span class="text-xs font-semibold text-white bg-white/5 px-2 py-1 rounded">Ágil (Sprints UAT)</span>
          </div>

          <div class="pt-4 border-t border-white/10">
            <div class="text-xs text-ink-muted mb-1">Rango de inversión referencial (implementación):</div>
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-white">
              S/ {estimatedMinSoles.toLocaleString()} — S/ {estimatedMaxSoles.toLocaleString()}
            </div>
            <div class="text-[11px] text-ink-muted mt-1">
              * Sujeto a levantamiento técnico y diagnóstico de procesos detallado.
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3 pt-4 border-t border-white/10">
        <a
          href="/contacto"
          class="btn btn-primary w-full py-3.5 text-sm"
        >
          <span>Solicitar Propuesta Formal</span>
          {@render ArrowRight({ class: "w-4 h-4 ml-1" })}
        </a>

        <a
          href={`https://wa.me/51955479055?text=${encodeURIComponent(`Hola Flexone, coticé en el simulador: ${selectedModules.length} módulos para ${usersCount} usuarios en Odoo ${editionType}. Deseo más información.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline w-full py-3 text-xs flex items-center justify-center gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
        >
          {@render WhatsAppIcon({ class: "w-4 h-4" })}
          <span>Enviar Configuración por WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
</div>
