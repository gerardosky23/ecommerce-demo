<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { AudiSportBadge, CheckIcon, ArrowRight } from './Icons.svelte';

  interface R8Model {
    id: string;
    name: string;
    drivetrain: string;
    badge: string;
    hp: number;
    torqueNm: number;
    accel: number;
    topSpeed: number;
    baseWeightKg: number;
    basePriceUsd: number;
    highlight: string;
  }

  const models: R8Model[] = [
    {
      id: 'coupe-quattro',
      name: 'R8 Coupé V10 quattro',
      drivetrain: 'Tracción Integral quattro',
      badge: 'V10 570 CV',
      hp: 570,
      torqueNm: 550,
      accel: 3.4,
      topSpeed: 324,
      baseWeightKg: 1660,
      basePriceUsd: 186500,
      highlight: 'El superdeportivo de motor central para uso diario y circuito.',
    },
    {
      id: 'performance-quattro',
      name: 'R8 V10 Performance quattro',
      drivetrain: 'Tracción Integral quattro + Diferencial Mecánico',
      badge: 'FLAGSHIP · 620 CV',
      hp: 620,
      torqueNm: 580,
      accel: 3.1,
      topSpeed: 331,
      baseWeightKg: 1595,
      basePriceUsd: 218900,
      highlight: 'Protagonista de nuestro Showroom: 620 CV, frenos cerámicos y paquete de titanio.',
    },
    {
      id: 'gt-rwd',
      name: 'R8 Coupé V10 GT RWD',
      drivetrain: 'Propulsión Trasera (Torque Rear Mode)',
      badge: 'EDICIÓN LIMITADA · 333 UDS.',
      hp: 620,
      torqueNm: 565,
      accel: 3.4,
      topSpeed: 320,
      baseWeightKg: 1570,
      basePriceUsd: 253290,
      highlight: 'Aerodinámica Carbon Aero Kit de túnel de viento y modo Drift de 7 niveles.',
    },
  ];

  interface UpgradePkg {
    id: string;
    name: string;
    weightDeltaKg: number;
    priceUsd: number;
    detail: string;
  }

  const packages: UpgradePkg[] = [
    {
      id: 'carbon-sigma',
      name: 'Paquete Exterior Carbono Sigma Brillo',
      weightDeltaKg: -6,
      priceUsd: 8400,
      detail: 'Splitter frontal, sideblades, difusor Venturi y cubiertas de motor en CFRP.',
    },
    {
      id: 'ceramic-brakes',
      name: 'Frenos Carbo-Cerámicos RS en Rojo Brillo',
      weightDeltaKg: -22,
      priceUsd: 11200,
      detail: 'Discos ventilados de 380 mm reforzados con fibra de carbono.',
    },
    {
      id: 'titanium-exhaust',
      name: 'Escape Deportivo en Titanio Ultraligero',
      weightDeltaKg: -7,
      priceUsd: 6900,
      detail: 'Salidas elípticas en negro mate con resonancia V10 amplificada.',
    },
    {
      id: 'forged-wheels',
      name: 'Rines Forjados Fresados 20" Audi Sport',
      weightDeltaKg: -8,
      priceUsd: 5400,
      detail: 'Diseño de 5 radios dobles dinámicos en negro antracita con neumáticos Michelin Pilot Sport Cup 2.',
    },
  ];

  let selectedModelId = $state('performance-quattro');
  let selectedPkgIds = $state<string[]>(['carbon-sigma', 'ceramic-brakes']);

  let currentModel = $derived(models.find((m) => m.id === selectedModelId) ?? models[1]);

  let totalWeightReduction = $derived(
    packages
      .filter((p) => selectedPkgIds.includes(p.id))
      .reduce((acc, p) => acc + p.weightDeltaKg, 0)
  );

  let totalPrice = $derived(
    currentModel.basePriceUsd +
      packages.filter((p) => selectedPkgIds.includes(p.id)).reduce((acc, p) => acc + p.priceUsd, 0)
  );

  let totalWeight = $derived(currentModel.baseWeightKg + totalWeightReduction);

  // Tweened values for smooth numeric animations
  const priceTween = new Tween(238500, { duration: 450, easing: cubicOut });
  const weightTween = new Tween(1567, { duration: 450, easing: cubicOut });
  const hpTween = new Tween(620, { duration: 450, easing: cubicOut });

  $effect(() => {
    priceTween.set(totalPrice);
    weightTween.set(totalWeight);
    hpTween.set(currentModel.hp);
  });

  function togglePackage(id: string) {
    if (selectedPkgIds.includes(id)) {
      selectedPkgIds = selectedPkgIds.filter((item) => item !== id);
    } else {
      selectedPkgIds = [...selectedPkgIds, id];
    }
  }
</script>

<section
  id="comparador"
  class="relative py-28 px-[clamp(18px,2.8vw,48px)] bg-ground-deep carbon-grid border-t border-white/10"
>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.16em] text-ascari-lit">
          {@render AudiSportBadge({ class: 'w-4 h-3.5' })}
          <span>Gama Audi R8 & Paquetes de Pista</span>
        </div>
        <h2 class="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold tracking-tight leading-[1.05] text-white">
          Configura tu <span class="text-audi-red-lit">Especificación RS</span>
        </h2>
      </div>
      <p class="max-w-md text-sm text-white/65 leading-relaxed">
        Compara las tres variantes oficiales del Audi R8 y añade paquetes de aligeramiento en carbono y titanio con cálculo dinámico de masa y potencia.
      </p>
    </div>

    <!-- Model Selection Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {#each models as model}
        {@const isSelected = model.id === selectedModelId}
        <button
          type="button"
          onclick={() => (selectedModelId = model.id)}
          class="text-left p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between {isSelected
            ? 'border-audi-red bg-[rgba(245,5,55,0.09)] shadow-[0_20px_50px_rgba(245,5,55,0.2)] -translate-y-1'
            : 'border-white/12 bg-[rgba(12,15,24,0.72)] hover:border-white/30 hover:bg-white/[0.04]'}"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider {isSelected ? 'bg-audi-red text-white' : 'bg-white/8 text-white/65'}">
                {model.badge}
              </span>
              <span class="text-xs font-mono text-white/45">{model.accel}s (0–100)</span>
            </div>

            <h3 class="font-display text-xl font-semibold text-white">{model.name}</h3>
            <span class="block text-xs text-ascari-lit mt-1">{model.drivetrain}</span>
            <p class="mt-3 text-xs text-white/65 leading-relaxed">{model.highlight}</p>
          </div>

          <div class="mt-6 pt-4 border-t border-white/10 flex items-baseline justify-between">
            <div>
              <span class="text-[10px] font-mono uppercase text-white/45 block">Desde (USD)</span>
              <strong class="font-display text-xl text-white">${model.basePriceUsd.toLocaleString()}</strong>
            </div>
            <span class="text-xs font-mono text-white/70">{model.topSpeed} km/h</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Interactive Lightweight Packages + Live Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
      <!-- Packages Checklist (7 cols) -->
      <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each packages as pkg}
          {@const active = selectedPkgIds.includes(pkg.id)}
          <button
            type="button"
            onclick={() => togglePackage(pkg.id)}
            class="text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between {active
              ? 'border-ascari-lit bg-ascari/15 shadow-[0_12px_30px_rgba(37,99,235,0.2)]'
              : 'border-white/10 bg-black/45 hover:border-white/25'}"
          >
            <div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {pkg.weightDeltaKg} kg masa
                </span>
                <span
                  class="w-5 h-5 rounded-full grid place-items-center border {active
                    ? 'bg-ascari-lit border-ascari-lit text-black'
                    : 'border-white/25 text-transparent'}"
                >
                  {@render CheckIcon({ class: 'w-3.5 h-3.5' })}
                </span>
              </div>
              <h4 class="mt-3 font-display text-base font-semibold text-white">{pkg.name}</h4>
              <p class="mt-1.5 text-xs text-white/60 leading-relaxed">{pkg.detail}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span class="text-white/45">Inversión</span>
              <strong class="text-white">+${pkg.priceUsd.toLocaleString()} USD</strong>
            </div>
          </button>
        {/each}
      </div>

      <!-- Live Telemetry & Price Summary Card (5 cols) -->
      <div class="lg:col-span-5 p-7 sm:p-8 rounded-3xl border border-white/15 bg-[rgba(10,12,20,0.88)] backdrop-blur-2xl shadow-2xl">
        <span class="text-xs font-mono uppercase tracking-widest text-audi-red-lit">
          Resumen de Configuración Activa
        </span>
        <h3 class="mt-1 font-display text-2xl font-semibold text-white">
          {currentModel.name}
        </h3>

        <div class="my-6 grid grid-cols-3 gap-3 text-center">
          <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/8">
            <span class="text-[10px] font-mono uppercase text-white/45 block">Potencia</span>
            <strong class="font-display text-2xl text-white tabular-nums">{Math.round(hpTween.current)}</strong>
            <span class="text-[10px] text-white/50 block">CV</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/8">
            <span class="text-[10px] font-mono uppercase text-white/45 block">Peso Final</span>
            <strong class="font-display text-2xl text-emerald-400 tabular-nums">{Math.round(weightTween.current)}</strong>
            <span class="text-[10px] text-white/50 block">kg ({totalWeightReduction} kg)</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/8">
            <span class="text-[10px] font-mono uppercase text-white/45 block">Relación</span>
            <strong class="font-display text-2xl text-ascari-lit tabular-nums">
              {(totalWeight / currentModel.hp).toFixed(2)}
            </strong>
            <span class="text-[10px] text-white/50 block">kg / CV</span>
          </div>
        </div>

        <div class="pt-5 border-t border-white/10 flex items-baseline justify-between">
          <div>
            <span class="text-xs text-white/50 block">Precio Estimado Configurado</span>
            <strong class="font-display text-3xl sm:text-4xl font-semibold text-white tabular-nums">
              ${Math.round(priceTween.current).toLocaleString()}
              <span class="text-sm font-normal text-white/50">USD</span>
            </strong>
          </div>
        </div>

        <a
          href="#reserva"
          class="btn btn--flame w-full justify-center py-3.5 px-6 mt-6 text-sm"
        >
          <span>Solicitar Esta Configuración en Pista</span>
          {@render ArrowRight({ class: 'w-4 h-4' })}
        </a>
      </div>
    </div>
  </div>
</section>
