<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { SlidersIcon, AudiSportBadge, BoltIcon } from './Icons.svelte';

  interface DriveMode {
    id: string;
    name: string;
    tag: string;
    desc: string;
    color: string;
    frontTorque: number;
    rearTorque: number;
    throttle: number;
    magneticRide: number;
    exhaustValve: number;
    steering: number;
    escMode: string;
    curvePath: string;
  }

  const driveModes: DriveMode[] = [
    {
      id: 'comfort',
      name: 'COMFORT',
      tag: 'Gran Turismo Diario',
      desc: 'Amortiguación magnética suave, cambios S tronic a bajas revoluciones y válvulas de escape acústicamente moderadas para viajes largos.',
      color: '#38bdf8',
      frontTorque: 30,
      rearTorque: 70,
      throttle: 52,
      magneticRide: 38,
      exhaustValve: 35,
      steering: 45,
      escMode: 'ESC ON · Seguridad Activa',
      curvePath: 'M 20 170 Q 150 145, 280 95 T 540 48',
    },
    {
      id: 'auto',
      name: 'AUTO',
      tag: 'Equilibrio Inteligente',
      desc: 'Analiza en milisegundos el estilo de conducción y el agarre del asfalto para adaptar el par vectorial quattro de forma transparente.',
      color: '#2563eb',
      frontTorque: 25,
      rearTorque: 75,
      throttle: 72,
      magneticRide: 64,
      exhaustValve: 65,
      steering: 68,
      escMode: 'ESC ON · Adaptativo',
      curvePath: 'M 20 170 Q 140 120, 270 72 T 540 34',
    },
    {
      id: 'dynamic',
      name: 'DYNAMIC',
      tag: 'Agilidad Deportiva',
      desc: 'Prioriza el eje trasero al 85%, abre las mariposas del escape V10 y ejecuta doble embrague automático con punta-tacón en cada reducción.',
      color: '#ff6a00',
      frontTorque: 15,
      rearTorque: 85,
      throttle: 92,
      magneticRide: 88,
      exhaustValve: 92,
      steering: 88,
      escMode: 'ESC SPORT · Deslizamiento Controlado',
      curvePath: 'M 20 170 Q 120 85, 250 46 T 540 20',
    },
    {
      id: 'performance',
      name: 'PERFORMANCE',
      tag: 'Modo Circuito (Dry / Wet / Snow)',
      desc: 'Activado desde el botón satélite del volante RS: transfiere hasta el 100% del par al eje trasero con diferencial mecánico autoblocante y Launch Control.',
      color: '#f50537',
      frontTorque: 5,
      rearTorque: 95,
      throttle: 100,
      magneticRide: 100,
      exhaustValve: 100,
      steering: 100,
      escMode: 'ESC TRACK / OFF · Máximo Ataque',
      curvePath: 'M 20 170 Q 95 52, 220 26 T 540 10',
    },
  ];

  let selectedId = $state('performance');
  let activeMode = $derived(driveModes.find((m) => m.id === selectedId) ?? driveModes[3]);

  // Smooth spring telemetry values
  const frontSpring = new Spring(5, { stiffness: 0.12, damping: 0.5 });
  const rearSpring = new Spring(95, { stiffness: 0.12, damping: 0.5 });
  const throttleSpring = new Spring(100, { stiffness: 0.1, damping: 0.45 });
  const rideSpring = new Spring(100, { stiffness: 0.1, damping: 0.45 });
  const exhaustSpring = new Spring(100, { stiffness: 0.1, damping: 0.45 });
  const steeringSpring = new Spring(100, { stiffness: 0.1, damping: 0.45 });

  function selectMode(mode: DriveMode) {
    selectedId = mode.id;
    frontSpring.set(mode.frontTorque);
    rearSpring.set(mode.rearTorque);
    throttleSpring.set(mode.throttle);
    rideSpring.set(mode.magneticRide);
    exhaustSpring.set(mode.exhaustValve);
    steeringSpring.set(mode.steering);
  }
</script>

<section
  id="drive-select"
  class="relative py-28 px-[clamp(18px,2.8vw,48px)] bg-[#070910] border-t border-white/10 overflow-hidden"
>
  <div class="max-w-7xl mx-auto relative z-10">
    <!-- Section Title -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
      <div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          {@render SlidersIcon({ class: 'w-4 h-4 text-audi-red-lit' })}
          <span>Simulador Dinámico Audi Drive Select</span>
        </div>
        <h2 class="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-semibold tracking-tight leading-[1.05] text-white">
          Cuatro personalidades.<br />
          <span style="color: {activeMode.color};" class="transition-colors duration-300">
            Un solo botón en el volante RS.
          </span>
        </h2>
      </div>

      <!-- Mode Selector Buttons -->
      <div class="flex flex-wrap gap-2 p-2 rounded-2xl border border-white/12 bg-black/60 backdrop-blur-xl">
        {#each driveModes as mode}
          {@const active = mode.id === selectedId}
          <button
            type="button"
            onclick={() => selectMode(mode)}
            class="relative px-4 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer {active
              ? 'text-white shadow-lg scale-[1.02]'
              : 'text-white/55 hover:text-white hover:bg-white/6'}"
            style={active ? `background: ${mode.color}; box-shadow: 0 8px 28px ${mode.color}55;` : ''}
          >
            {mode.name}
          </button>
        {/each}
      </div>
    </div>

    <!-- Main Telemetry Console -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
      <!-- Left: Torque Vectoring & Dyno Curve (7 cols) -->
      <div class="lg:col-span-7 p-7 sm:p-9 rounded-3xl border border-white/12 bg-[rgba(11,14,22,0.82)] backdrop-blur-2xl flex flex-col justify-between">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest" style="color: {activeMode.color};">
              MODO ACTIVO: {activeMode.name} — {activeMode.tag}
            </span>
            <p class="mt-2 text-sm text-white/70 max-w-xl leading-relaxed">
              {activeMode.desc}
            </p>
          </div>
          <span class="px-3 py-1.5 rounded-full text-xs font-mono border border-white/15 bg-white/5 text-white/85">
            {activeMode.escMode}
          </span>
        </div>

        <!-- SVG Dyno Power Curve -->
        <div class="my-6">
          <div class="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
            <span>CURVA DE ENTREGA DE PAR & POTENCIA (V10 FSI)</span>
            <span class="text-white">Pico: 620 CV @ 8,000 RPM</span>
          </div>
          <div class="p-4 rounded-2xl bg-black/60 border border-white/8">
            <svg viewBox="0 0 560 190" class="w-full h-44 overflow-visible">
              <!-- Grid lines -->
              {#each [40, 85, 130, 170] as yLine}
                <line x1="20" y1={yLine} x2="540" y2={yLine} stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
              {/each}
              <!-- Dynamic Curve -->
              <path
                d={activeMode.curvePath}
                fill="none"
                stroke={activeMode.color}
                stroke-width="4"
                stroke-linecap="round"
                class="transition-all duration-500"
              />
              <circle cx="540" cy={selectedId === 'performance' ? 10 : selectedId === 'dynamic' ? 20 : selectedId === 'auto' ? 34 : 48} r="6" fill="#ffffff" stroke={activeMode.color} stroke-width="3" />
              <text x="24" y="185" fill="rgba(255,255,255,0.4)" font-size="10" font-family="monospace">1,500 RPM</text>
              <text x="250" y="185" fill="rgba(255,255,255,0.4)" font-size="10" font-family="monospace">5,000 RPM</text>
              <text x="485" y="185" fill="rgba(255,255,255,0.75)" font-size="10" font-family="monospace">8,700 RPM</text>
            </svg>
          </div>
        </div>

        <!-- Quattro Axle Torque Split -->
        <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div class="flex items-center justify-between text-xs font-mono mb-3">
            <span class="text-white/70">REPARTO DE PAR VECTORIAL QUATTRO</span>
            <span class="text-white font-semibold">
              Eje Delantero {Math.round(frontSpring.current)}% · Eje Trasero {Math.round(rearSpring.current)}%
            </span>
          </div>
          <div class="h-3.5 w-full rounded-full bg-black/70 overflow-hidden flex p-0.5 gap-1 border border-white/10">
            <div
              class="h-full rounded-l-full bg-ascari-lit transition-all"
              style="width: {frontSpring.current}%;"
            ></div>
            <div
              class="h-full flex-1 rounded-r-full transition-colors duration-300"
              style="background: {activeMode.color};"
            ></div>
          </div>
        </div>
      </div>

      <!-- Right: Spring-Animated Telemetry Sliders (5 cols) -->
      <div class="lg:col-span-5 p-7 sm:p-9 rounded-3xl border border-white/12 bg-[rgba(11,14,22,0.82)] backdrop-blur-2xl flex flex-col justify-between gap-6">
        <div>
          <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/55">
            {@render AudiSportBadge({ class: 'w-4 h-3.5' })}
            Parámetros del Chasis en Vivo
          </span>
          <h3 class="mt-2 font-display text-2xl font-semibold text-white">
            Calibración Electrónica
          </h3>
        </div>

        <div class="space-y-5 my-auto">
          {#each [
            { label: 'Respuesta de Acelerador (Drive-by-Wire)', val: throttleSpring.current },
            { label: 'Rigidez Audi Magnetic Ride', val: rideSpring.current },
            { label: 'Apertura de Mariposas de Escape V10', val: exhaustSpring.current },
            { label: 'Dirección Dinámica Variable', val: steeringSpring.current },
          ] as metric}
            <div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-white/75 font-medium">{metric.label}</span>
                <strong class="font-mono text-white tabular-nums">{Math.round(metric.val)}%</strong>
              </div>
              <div class="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
                <div
                  class="h-full rounded-full transition-colors duration-300"
                  style="width: {metric.val}%; background: {activeMode.color};"
                ></div>
              </div>
            </div>
          {/each}
        </div>

        <div class="p-4 rounded-2xl border border-white/10 bg-black/50 flex items-center justify-between text-xs">
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Tiempo de Cambio S tronic</span>
            <strong class="font-display text-lg text-white">
              {selectedId === 'performance' ? '120 ms (Pista)' : selectedId === 'dynamic' ? '150 ms' : '220 ms'}
            </strong>
          </div>
          <span class="inline-flex items-center gap-1.5 text-emerald-400 font-mono">
            {@render BoltIcon({ class: 'w-4 h-4' })}
            Doble Embrague Activo
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
