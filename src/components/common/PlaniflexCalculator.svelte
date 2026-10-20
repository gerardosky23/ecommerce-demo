<script lang="ts">
  import { CheckIcon, WhatsAppIcon, ArrowRight } from '../Icons.svelte';

  let baseSalary = $state(2500);
  let hasChildren = $state(true);
  let regime = $state<'general' | 'pequena' | 'micro'>('general');
  let pensionType = $state<'afp' | 'onp'>('afp');

  // Remuneración mínima vital vigente en Perú
  const RMV = 1025;
  const ASIG_FAMILIAR = 102.5; // 10% de RMV

  let asignacionFamiliar = $derived.by(() => {
    return hasChildren ? ASIG_FAMILIAR : 0;
  });

  let totalComputable = $derived.by(() => {
    return baseSalary + asignacionFamiliar;
  });

  // Gratificación por semestre
  let gratificacionSemestral = $derived.by(() => {
    if (regime === 'micro') return 0;
    if (regime === 'pequena') return Math.round((totalComputable * 0.5) * 1.09); // 50% + 9% bono extraordinario
    return Math.round(totalComputable * 1.09); // 100% + 9% bono extraordinario
  });

  // CTS semestral (Mayo y Noviembre)
  let ctsSemestral = $derived.by(() => {
    if (regime === 'micro') return 0;
    const sextoGrati = (gratificacionSemestral / 1.09) / 6;
    const baseCts = (totalComputable + sextoGrati) / 2;
    if (regime === 'pequena') return Math.round(baseCts * 0.5);
    return Math.round(baseCts);
  });

  // Aporte empleador mensual (EsSalud 9%)
  let essaludMensual = $derived.by(() => {
    if (regime === 'micro') return 0; // microempresa aporta SIS
    return Math.round(totalComputable * 0.09);
  });

  // Descuento pensionario referencial del trabajador (13%)
  let descuentoTrabajador = $derived.by(() => {
    return Math.round(totalComputable * 0.13);
  });

  let netoRecibir = $derived.by(() => {
    return totalComputable - descuentoTrabajador;
  });
</script>

<div class="rounded-3xl p-6 sm:p-10 bg-white border border-neutral-200 shadow-xl text-brand-dark">
  <div class="text-center max-w-2xl mx-auto mb-8">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-3">
      Simulador Laboral Normativo
    </div>
    <h3 class="font-normal text-2xl sm:text-3xl text-brand-dark tracking-tight mb-2">
      Calcula los Beneficios Sociales con <span class="text-brand-magenta font-medium">Planiflex</span>
    </h3>
    <p class="text-xs sm:text-sm text-brand-muted font-light">
      Simula el cálculo exacto de Gratificaciones, CTS y aportes a EsSalud bajo la ley laboral peruana.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Controles (7 cols) -->
    <div class="lg:col-span-7 space-y-5">
      <!-- Salario Base -->
      <div class="p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
        <div class="flex items-center justify-between mb-3">
          <label for="salary-range" class="font-medium text-sm text-brand-dark">
            Sueldo Básico Mensual:
          </label>
          <span class="font-bold text-base text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-300">
            S/ {baseSalary.toLocaleString()}
          </span>
        </div>
        <input
          id="salary-range"
          type="range"
          min="1025"
          max="20000"
          step="50"
          bind:value={baseSalary}
          class="w-full accent-emerald-600 cursor-pointer h-2 bg-neutral-200 rounded-lg appearance-none"
        />
        <div class="flex justify-between text-[11px] text-brand-muted mt-2 font-mono">
          <span>S/ 1,025 (RMV)</span>
          <span>S/ 5,000</span>
          <span>S/ 20,000+</span>
        </div>
      </div>

      <!-- Régimen Laboral -->
      <div>
        <label class="block font-semibold text-xs text-brand-muted mb-2 uppercase tracking-wider">
          Régimen Laboral de la Empresa:
        </label>
        <div class="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            class={`p-3 rounded-xl text-center border transition-all duration-150 ${
              regime === 'general'
                ? 'bg-emerald-600 border-emerald-700 text-white font-semibold shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-brand-dark hover:bg-neutral-100'
            }`}
            onclick={() => regime = 'general'}
          >
            <div class="text-xs font-bold">Régimen General</div>
            <div class={`text-[10px] mt-0.5 ${regime === 'general' ? 'text-white/80' : 'text-brand-muted'}`}>100% Beneficios</div>
          </button>

          <button
            type="button"
            class={`p-3 rounded-xl text-center border transition-all duration-150 ${
              regime === 'pequena'
                ? 'bg-emerald-600 border-emerald-700 text-white font-semibold shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-brand-dark hover:bg-neutral-100'
            }`}
            onclick={() => regime = 'pequena'}
          >
            <div class="text-xs font-bold">Pequeña Empresa</div>
            <div class={`text-[10px] mt-0.5 ${regime === 'pequena' ? 'text-white/80' : 'text-brand-muted'}`}>50% Beneficios</div>
          </button>

          <button
            type="button"
            class={`p-3 rounded-xl text-center border transition-all duration-150 ${
              regime === 'micro'
                ? 'bg-emerald-600 border-emerald-700 text-white font-semibold shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-brand-dark hover:bg-neutral-100'
            }`}
            onclick={() => regime = 'micro'}
          >
            <div class="text-xs font-bold">Microempresa</div>
            <div class={`text-[10px] mt-0.5 ${regime === 'micro' ? 'text-white/80' : 'text-brand-muted'}`}>Sin Grati ni CTS</div>
          </button>
        </div>
      </div>

      <!-- Asignación Familiar Toggle -->
      <div class="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-brand-dark">¿Tiene hijos menores o cursa estudios superiores?</div>
          <div class="text-xs text-brand-muted">Asignación Familiar de Ley (+S/ 102.50)</div>
        </div>
        <button
          type="button"
          class={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            hasChildren
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white text-brand-muted border-neutral-300'
          }`}
          onclick={() => hasChildren = !hasChildren}
        >
          {hasChildren ? 'SÍ (Aplica)' : 'NO'}
        </button>
      </div>
    </div>

    <!-- Resultados (5 cols) -->
    <div class="lg:col-span-5 p-6 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-md space-y-5">
      <h4 class="font-medium text-base text-brand-dark pb-3 border-b border-neutral-200 flex items-center justify-between">
        <span>Liquidación Estimada</span>
        <span class="text-xs font-mono text-emerald-700 font-bold">En Odoo</span>
      </h4>

      <div class="space-y-3.5 text-xs">
        <div class="flex items-center justify-between py-1 border-b border-neutral-200">
          <span class="text-brand-muted">Sueldo Bruto Computable:</span>
          <span class="font-semibold text-brand-dark text-sm">S/ {totalComputable.toFixed(2)}</span>
        </div>

        <div class="flex items-center justify-between py-1 border-b border-neutral-200">
          <span class="text-brand-muted">Neto a Recibir Mensual (aprox):</span>
          <span class="font-bold text-brand-dark text-sm">S/ {netoRecibir.toFixed(2)}</span>
        </div>

        <div class="flex items-center justify-between py-1 border-b border-neutral-200">
          <span class="text-brand-muted">Gratificación (Julio / Dic):</span>
          <span class="font-bold text-emerald-700 text-sm">S/ {gratificacionSemestral.toFixed(2)}</span>
        </div>

        <div class="flex items-center justify-between py-1 border-b border-neutral-200">
          <span class="text-brand-muted">CTS Semestral (Mayo / Nov):</span>
          <span class="font-bold text-emerald-700 text-sm">S/ {ctsSemestral.toFixed(2)}</span>
        </div>

        <div class="flex items-center justify-between py-1">
          <span class="text-brand-muted">Aporte EsSalud Empleador (9%):</span>
          <span class="font-semibold text-brand-dark">S/ {essaludMensual.toFixed(2)}</span>
        </div>
      </div>

      <div class="pt-4 border-t border-neutral-200 space-y-3">
        <a
          href="/contacto"
          class="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Solicitar Demo de Planiflex RRHH</span>
          {@render ArrowRight({ class: "w-4 h-4" })}
        </a>

        <a
          href="https://wa.me/51955479055?text=Hola%20Flexone,%20deseo%20una%20demostración%20del%20sistema%20de%20planillas%20Planiflex%20para%20Odoo."
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-2.5 px-4 rounded-full bg-white hover:bg-neutral-50 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          {@render WhatsAppIcon({ class: "w-4 h-4" })}
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
</div>
