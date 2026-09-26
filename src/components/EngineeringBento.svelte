<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { AudiSportBadge, BoltIcon, ShieldCarbon, GaugeIcon, SparkIcon } from './Icons.svelte';

  const firingOrder = [1, 6, 5, 10, 2, 7, 3, 8, 4, 9];

  let hoveredCard = $state<number | null>(null);
  let activeCylinder = $state(0);
  let rpmSim = $state(4800);
  let brakeTemp = $state(320);
  let windSpeed = $state(180);

  // Per-card 3D tilt + spotlight state
  let cardCoords = $state([
    { x: 50, y: 50, rx: 0, ry: 0 },
    { x: 50, y: 50, rx: 0, ry: 0 },
    { x: 50, y: 50, rx: 0, ry: 0 },
    { x: 50, y: 50, rx: 0, ry: 0 },
  ]);

  const rpmSpring = new Spring(4800, { stiffness: 0.08, damping: 0.45 });
  const tempSpring = new Spring(320, { stiffness: 0.06, damping: 0.4 });

  function handleCardMove(index: number, e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    cardCoords[index] = {
      x: px * 100,
      y: py * 100,
      rx: (0.5 - py) * 10,
      ry: (px - 0.5) * 10,
    };

    if (index === 0) {
      const targetRpm = Math.round(2500 + px * 6200);
      rpmSim = targetRpm;
      rpmSpring.set(targetRpm);
    } else if (index === 2) {
      brakeTemp = 940;
      tempSpring.set(940);
    } else if (index === 3) {
      windSpeed = Math.round(160 + px * 171);
    }
  }

  function handleCardLeave(index: number) {
    hoveredCard = null;
    cardCoords[index] = { x: 50, y: 50, rx: 0, ry: 0 };
    if (index === 0) {
      rpmSim = 4800;
      rpmSpring.set(4800);
    } else if (index === 2) {
      brakeTemp = 320;
      tempSpring.set(320);
    } else if (index === 3) {
      windSpeed = 180;
    }
  }

  $effect(() => {
    const interval = setInterval(() => {
      activeCylinder = (activeCylinder + 1) % 10;
    }, hoveredCard === 0 ? 75 : 180);
    return () => clearInterval(interval);
  });
</script>

<section
  id="ingenieria"
  class="@container relative py-28 px-[clamp(18px,2.8vw,48px)] bg-ground-deep carbon-grid border-t border-white/10 overflow-hidden"
>
  <!-- Ambient Background Glows -->
  <div
    class="absolute top-20 left-1/4 w-[480px] h-[480px] rounded-full bg-audi-red/10 blur-[140px] pointer-events-none"
    aria-hidden="true"
  ></div>
  <div
    class="absolute bottom-16 right-1/4 w-[480px] h-[480px] rounded-full bg-ascari/12 blur-[150px] pointer-events-none"
    aria-hidden="true"
  ></div>

  <div class="max-w-7xl mx-auto relative z-10">
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.16em] text-audi-red-lit">
          {@render AudiSportBadge({ class: 'w-4 h-3.5' })}
          <span>Arquitectura Mecánica & Compuestos</span>
        </div>
        <h2 class="mt-4 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-tight leading-[1.04] text-white">
          Ingeniería nacida en <span class="text-white/55">Le Mans</span> y <span class="text-audi-red-lit">Nürburgring</span>
        </h2>
      </div>
      <p class="max-w-md text-sm text-white/65 leading-relaxed">
        Mueve el cursor sobre cada módulo de ingeniería para activar la telemetría interactiva en tiempo real con físicas <code class="text-white/85 font-mono">Spring</code> de Svelte 5.
      </p>
    </div>

    <!-- Interactive 3D Tilt Bento Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Card 1: 5.2L V10 FSI Engine (7 cols) -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <article
        onmouseenter={() => (hoveredCard = 0)}
        onmousemove={(e) => handleCardMove(0, e)}
        onmouseleave={() => handleCardLeave(0)}
        style="transform: perspective(1100px) rotateX({cardCoords[0].rx}deg) rotateY({cardCoords[0].ry}deg); background: radial-gradient(520px circle at {cardCoords[0].x}% {cardCoords[0].y}%, rgba(245, 5, 55, 0.16), rgba(14, 17, 26, 0.78) 65%);"
        class="lg:col-span-7 group relative rounded-3xl p-7 sm:p-9 border border-white/12 hover:border-audi-red/50 transition-[border-color,box-shadow] duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_70px_rgba(245,5,55,0.2)] flex flex-col justify-between overflow-hidden"
      >
        <div>
          <div class="flex items-center justify-between gap-4">
            <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-audi-red-lit">
              {@render BoltIcon({ class: 'w-4 h-4' })}
              01 · MOTOR CENTRAL 5.2L FSI V10 ATMOSFÉRICO
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-mono bg-white/8 text-white/80 border border-white/10">
              Mueve el ratón de izq. a der. ↔
            </span>
          </div>

          <h3 class="mt-4 font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Orden de Encendido 10 Cilindros a 8,700 RPM
          </h3>
          <p class="mt-2 text-sm text-white/65 max-w-xl leading-relaxed">
            Lubricación por cárter seco de competición que permite fuerzas laterales de hasta 1.5 G e inyección dual FSI/MPI. Desliza el cursor horizontalmente para revolucionar el V10.
          </p>
        </div>

        <!-- Interactive 10-Cylinder Firing Visualizer -->
        <div class="my-7 p-5 rounded-2xl bg-black/55 border border-white/10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[11px] font-mono uppercase text-white/45 block">Régimen de Giro Simulado</span>
              <strong class="font-display text-3xl font-semibold text-white tabular-nums">
                {Math.round(rpmSpring.current).toLocaleString()}
                <span class="text-sm font-mono text-audi-red-lit">RPM</span>
              </strong>
            </div>
            <div class="text-right">
              <span class="text-[11px] font-mono uppercase text-white/45 block">Secuencia de Ignición</span>
              <span class="font-mono text-xs text-white/80">1 - 6 - 5 - 10 - 2 - 7 - 3 - 8 - 4 - 9</span>
            </div>
          </div>

          <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {#each firingOrder as cyl, i}
              {@const isFiring = activeCylinder === i}
              <div
                class="flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-150 {isFiring
                  ? 'border-audi-red bg-audi-red/30 text-white scale-105 shadow-[0_0_20px_rgba(245,5,55,0.6)]'
                  : 'border-white/10 bg-white/[0.03] text-white/50'}"
              >
                <span class="text-[10px] font-mono uppercase">CIL</span>
                <strong class="font-display text-base">{cyl}</strong>
              </div>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Cilindrada</span>
            <strong class="font-display text-lg text-white">5,204 cm³</strong>
          </div>
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Potencia Específica</span>
            <strong class="font-display text-lg text-white">119.1 CV/L</strong>
          </div>
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Ángulo en V</span>
            <strong class="font-display text-lg text-white">90° Cárter Seco</strong>
          </div>
        </div>
      </article>

      <!-- Card 2: Audi Space Frame (ASF) Carbon + Aluminum (5 cols) -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <article
        onmouseenter={() => (hoveredCard = 1)}
        onmousemove={(e) => handleCardMove(1, e)}
        onmouseleave={() => handleCardLeave(1)}
        style="transform: perspective(1100px) rotateX({cardCoords[1].rx}deg) rotateY({cardCoords[1].ry}deg); background: radial-gradient(460px circle at {cardCoords[1].x}% {cardCoords[1].y}%, rgba(37, 99, 235, 0.2), rgba(14, 17, 26, 0.78) 65%);"
        class="lg:col-span-5 group relative rounded-3xl p-7 sm:p-9 border border-white/12 hover:border-ascari-lit/50 transition-[border-color,box-shadow] duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col justify-between overflow-hidden"
      >
        <div>
          <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ascari-lit">
            {@render ShieldCarbon({ class: 'w-4 h-4' })}
            02 · AUDI SPACE FRAME (ASF)
          </span>
          <h3 class="mt-4 font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Monocasco Híbrido CFRP + Aluminio
          </h3>
          <p class="mt-2 text-sm text-white/65 leading-relaxed">
            El túnel central, el mamparo trasero y los pilares B están fabricados en polímero reforzado con fibra de carbono (CFRP) curado en autoclave, pesando apenas <strong class="text-white">200 kg</strong> en total.
          </p>
        </div>

        <!-- Interactive Material Composition Bar -->
        <div class="my-6 p-5 rounded-2xl bg-black/50 border border-white/10">
          <div class="flex justify-between text-xs font-mono mb-2">
            <span class="text-ascari-lit">79% Aleación Aluminio Aeroespacial</span>
            <span class="text-audi-red-lit">21% Carbono CFRP</span>
          </div>
          <div class="h-3 w-full rounded-full bg-white/10 overflow-hidden flex p-0.5 gap-1">
            <div class="h-full rounded-l-full bg-gradient-to-r from-ascari to-ascari-lit transition-all duration-500 group-hover:w-[74%]" style="width: 79%;"></div>
            <div class="h-full flex-1 rounded-r-full bg-gradient-to-r from-audi-red to-audi-red-lit"></div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs">
            <span class="text-white/55">Rigidez Torsional</span>
            <strong class="font-mono text-white text-sm">40,000 Nm/grado</strong>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Peso del Chasis</span>
            <strong class="font-display text-lg text-white">200 kg</strong>
          </div>
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Reparto de Masas</span>
            <strong class="font-display text-lg text-white">42% Del. / 58% Tras.</strong>
          </div>
        </div>
      </article>

      <!-- Card 3: Ceramic Brakes Thermal Simulation (5 cols) -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <article
        onmouseenter={() => (hoveredCard = 2)}
        onmousemove={(e) => handleCardMove(2, e)}
        onmouseleave={() => handleCardLeave(2)}
        style="transform: perspective(1100px) rotateX({cardCoords[2].rx}deg) rotateY({cardCoords[2].ry}deg); background: radial-gradient(460px circle at {cardCoords[2].x}% {cardCoords[2].y}%, rgba(255, 106, 0, 0.22), rgba(14, 17, 26, 0.78) 65%);"
        class="lg:col-span-5 group relative rounded-3xl p-7 sm:p-9 border border-white/12 hover:border-orange-500/50 transition-[border-color,box-shadow] duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col justify-between overflow-hidden"
      >
        <div>
          <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-400">
            {@render SparkIcon({ class: 'w-4 h-4' })}
            03 · FRENOS CERÁMICOS RS (380 MM)
          </span>
          <h3 class="mt-4 font-display text-2xl font-semibold text-white tracking-tight">
            Discos Carbo-Cerámicos con Pinzas de 6 Émbolos
          </h3>
          <p class="mt-2 text-sm text-white/65 leading-relaxed">
            Pasa el cursor para simular una frenada desde 300 km/h: los discos soportan casi <strong class="text-white">1,000 °C</strong> sin fatiga térmica y reducen 22 kg de masa no suspendida.
          </p>
        </div>

        <!-- Interactive Glowing Brake Rotor SVG -->
        <div class="my-6 flex items-center justify-between gap-5 p-4 rounded-2xl bg-black/55 border border-white/10">
          <div class="relative w-24 h-24 shrink-0 grid place-items-center">
            <svg viewBox="0 0 100 100" class="w-full h-full transition-transform duration-700 group-hover:rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={hoveredCard === 2 ? '#ff4d00' : '#4b5563'}
                stroke-width="12"
                class="transition-colors duration-500"
              />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#111827" stroke-width="2" stroke-dasharray="4 6" />
              <circle cx="50" cy="50" r="18" fill="#1f2937" stroke="#9ca3af" stroke-width="2" />
              <!-- Red Audi Sport 6-piston caliper -->
              <path d="M 68 18 A 42 42 0 0 1 92 50 L 76 50 A 26 26 0 0 0 58 28 Z" fill="#f50537" />
            </svg>
          </div>

          <div class="flex-1">
            <span class="text-[10px] font-mono uppercase text-white/45 block">Temperatura del Rotor</span>
            <strong class="font-display text-3xl font-semibold tabular-nums {hoveredCard === 2 ? 'text-orange-400' : 'text-white'}">
              {Math.round(tempSpring.current)} °C
            </strong>
            <span class="block text-xs text-white/55 mt-1">
              {hoveredCard === 2 ? '🔥 Frenada extrema de pista activa' : 'Enfriamiento por canales Venturi'}
            </span>
          </div>
        </div>
      </article>

      <!-- Card 4: Active Wind Tunnel Aerodynamics (7 cols) -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <article
        onmouseenter={() => (hoveredCard = 3)}
        onmousemove={(e) => handleCardMove(3, e)}
        onmouseleave={() => handleCardLeave(3)}
        style="transform: perspective(1100px) rotateX({cardCoords[3].rx}deg) rotateY({cardCoords[3].ry}deg); background: radial-gradient(520px circle at {cardCoords[3].x}% {cardCoords[3].y}%, rgba(16, 185, 129, 0.18), rgba(14, 17, 26, 0.78) 65%);"
        class="lg:col-span-7 group relative rounded-3xl p-7 sm:p-9 border border-white/12 hover:border-emerald-400/50 transition-[border-color,box-shadow] duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col justify-between overflow-hidden"
      >
        <div>
          <div class="flex items-center justify-between gap-4">
            <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
              {@render GaugeIcon({ class: 'w-4 h-4' })}
              04 · TÚNEL DE VIENTO & EFECTO SUELO
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Flujo: {windSpeed} km/h
            </span>
          </div>

          <h3 class="mt-4 font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            140 kg de Carga Aerodinámica (Downforce)
          </h3>
          <p class="mt-2 text-sm text-white/65 leading-relaxed">
            El suelo plano carenado junto con el difusor trasero en CFRP y el alerón fijo tipo *Gooseneck* generan un efecto Venturi que pega el R8 al asfalto a alta velocidad.
          </p>
        </div>

        <!-- Animated SVG Wind Tunnel Streamlines -->
        <div class="my-6 p-4 rounded-2xl bg-black/55 border border-white/10">
          <svg viewBox="0 0 600 130" class="w-full h-28 overflow-visible">
            <defs>
              <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.1" />
                <stop offset="50%" stop-color="#10b981" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#f50537" stop-opacity="0.85" />
              </linearGradient>
            </defs>
            <!-- Streamlines over the R8 silhouette -->
            <path
              d="M 10 82 Q 140 80, 210 52 Q 290 22, 390 28 Q 470 36, 540 50 L 590 42"
              fill="none"
              stroke="url(#windGrad)"
              stroke-width="2.5"
              stroke-dasharray="14 8"
            />
            <path
              d="M 10 64 Q 140 62, 205 36 Q 290 8, 400 16 Q 480 24, 590 26"
              fill="none"
              stroke="url(#windGrad)"
              stroke-width="1.8"
              stroke-opacity="0.65"
            />
            <!-- Stylized R8 Coupe Silhouette -->
            <path
              d="M 115 98 L 165 76 L 255 44 L 385 42 L 485 68 L 515 64 L 515 52 L 530 52 L 522 98 Z"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.45)"
              stroke-width="2"
            />
            <circle cx="195" cy="98" r="18" fill="#090b10" stroke="#60a5fa" stroke-width="2.5" />
            <circle cx="445" cy="98" r="19" fill="#090b10" stroke="#f50537" stroke-width="2.5" />
          </svg>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Carga a 331 km/h</span>
            <strong class="font-display text-lg text-white">140 kg</strong>
          </div>
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Alerón Trasero</span>
            <strong class="font-display text-lg text-white">CFRP Fijo RS</strong>
          </div>
          <div>
            <span class="text-white/45 block uppercase font-mono text-[10px]">Coeficiente</span>
            <strong class="font-display text-lg text-white">0.36 Cd (Downforce)</strong>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>
