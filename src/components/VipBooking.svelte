<script lang="ts">
  import { scale, fade } from 'svelte/transition';
  import { AudiRings, AudiSportBadge, MapPinIcon, CheckIcon, ArrowRight } from './Icons.svelte';

  const circuits = [
    { id: 'jarama', name: 'Circuito del Jarama · Madrid', country: 'España', trackLength: '3.85 km' },
    { id: 'montmelo', name: 'Circuit de Barcelona-Catalunya', country: 'España', trackLength: '4.67 km' },
    { id: 'hermanos-rodriguez', name: 'Autódromo Hermanos Rodríguez · CDMX', country: 'México', trackLength: '4.30 km' },
    { id: 'nurburgring', name: 'Nürburgring GP-Strecke · Audi Driving Experience', country: 'Alemania', trackLength: '5.14 km' },
  ];

  const colors = [
    { name: 'Ascari Blue Metallic', hex: '#2563eb' },
    { name: 'Tango Red Metallic', hex: '#e61e1e' },
    { name: 'Solar Orange GT', hex: '#ff6a00' },
    { name: 'Vegas Yellow R8', hex: '#eab308' },
    { name: 'District Green RS', hex: '#10b981' },
    { name: 'Daytona Grey Pearl', hex: '#9ca3af' },
  ];

  let fullName = $state('');
  let email = $state('');
  let selectedCircuit = $state(circuits[0].id);
  let selectedColor = $state(colors[0].name);
  let submitted = $state(false);

  let activeCircuit = $derived(circuits.find((c) => c.id === selectedCircuit) ?? circuits[0]);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitted = true;
  }
</script>

<section
  id="reserva"
  class="relative pt-28 pb-16 px-[clamp(18px,2.8vw,48px)] bg-[#05060a] border-t border-white/10 overflow-hidden"
>
  <!-- Ambient Glow -->
  <div
    class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full bg-audi-red/12 blur-[150px] pointer-events-none"
    aria-hidden="true"
  ></div>

  <div class="max-w-6xl mx-auto relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-7 sm:p-12 rounded-[32px] border border-white/14 bg-[rgba(11,14,22,0.85)] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
      <!-- Left Pitch (5 cols) -->
      <div class="lg:col-span-5 space-y-5">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.16em] text-audi-red-lit">
          {@render AudiSportBadge({ class: 'w-4 h-3.5' })}
          <span>Audi Driving Experience VIP</span>
        </div>

        <h2 class="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.04] text-white">
          Pon a prueba los <span class="text-audi-red-lit">620 CV</span> en pista cerrada.
        </h2>

        <p class="text-sm text-white/65 leading-relaxed">
          Reserva una sesión privada junto a un piloto instructor oficial de <strong class="text-white">Audi Sport</strong>. Incluye telemetría de vuelta en vivo y configuración personalizada de tu unidad.
        </p>

        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
          <div class="flex items-center gap-2 text-ascari-lit font-mono">
            {@render MapPinIcon({ class: 'w-4 h-4' })}
            <span>Pista Seleccionada: {activeCircuit.name}</span>
          </div>
          <div class="flex justify-between text-white/60 pt-1">
            <span>Longitud del trazado: <strong class="text-white">{activeCircuit.trackLength}</strong></span>
            <span>País: <strong class="text-white">{activeCircuit.country}</strong></span>
          </div>
        </div>
      </div>

      <!-- Right Interactive Form / Confirmation Pass (7 cols) -->
      <div class="lg:col-span-7">
        {#if !submitted}
          <form onsubmit={handleSubmit} class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="vip-name" class="block text-xs font-mono uppercase text-white/55 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  id="vip-name"
                  type="text"
                  required
                  bind:value={fullName}
                  placeholder="Ej. Carlos Sainz"
                  class="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/14 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-audi-red transition"
                />
              </div>
              <div>
                <label for="vip-email" class="block text-xs font-mono uppercase text-white/55 mb-1.5">
                  Correo Corporativo / Personal
                </label>
                <input
                  id="vip-email"
                  type="email"
                  required
                  bind:value={email}
                  placeholder="piloto@audisport.com"
                  class="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/14 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-audi-red transition"
                />
              </div>
            </div>

            <div>
              <label for="vip-circuit" class="block text-xs font-mono uppercase text-white/55 mb-1.5">
                Circuito Oficial Audi Sport
              </label>
              <select
                id="vip-circuit"
                bind:value={selectedCircuit}
                class="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/14 text-sm text-white focus:outline-none focus:border-audi-red transition"
              >
                {#each circuits as c}
                  <option value={c.id} class="bg-[#0b0d14] text-white">{c.name} ({c.trackLength})</option>
                {/each}
              </select>
            </div>

            <div>
              <span class="block text-xs font-mono uppercase text-white/55 mb-2">
                Acabado Audi Exclusive Preferido
              </span>
              <div class="flex flex-wrap gap-2">
                {#each colors as col}
                  <button
                    type="button"
                    onclick={() => (selectedColor = col.name)}
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition cursor-pointer {selectedColor === col.name
                      ? 'border-white bg-white/15 text-white'
                      : 'border-white/10 bg-black/40 text-white/60 hover:text-white'}"
                  >
                    <span class="w-3 h-3 rounded-full" style="background: {col.hex};"></span>
                    <span>{col.name.split(' ')[0]} {col.name.split(' ')[1]}</span>
                  </button>
                {/each}
              </div>
            </div>

            <button
              type="submit"
              class="btn btn--flame w-full justify-center py-4 px-6 text-sm mt-2 cursor-pointer"
            >
              <span>Generar Pase de Pista Audi Sport VIP</span>
              {@render ArrowRight({ class: 'w-4 h-4' })}
            </button>
          </form>
        {:else}
          <div
            in:scale={{ duration: 350, start: 0.94 }}
            class="p-7 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-white space-y-4"
          >
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-300">
                {@render CheckIcon({ class: 'w-4 h-4' })}
                PASE DE PISTA CONFIRMADO · AUDI SPORT
              </span>
              <span class="font-mono text-xs text-white/60">#R8-V10-VIP</span>
            </div>

            <h3 class="font-display text-2xl font-semibold">
              ¡Bienvenido al paddock, {fullName || 'Piloto'}!
            </h3>
            <p class="text-sm text-white/75 leading-relaxed">
              Hemos registrado tu solicitud para conducir el <strong class="text-white">Audi R8 V10 Performance quattro</strong> en color <strong class="text-white">{selectedColor}</strong> en el <strong class="text-white">{activeCircuit.name}</strong>.
            </p>

            <button
              type="button"
              onclick={() => (submitted = false)}
              class="text-xs font-mono underline text-white/70 hover:text-white cursor-pointer"
            >
              Modificar datos de reserva
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Official Audi Sport Footer -->
    <footer class="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/50">
      <div class="flex items-center gap-4">
        {@render AudiRings({ class: 'w-16 h-6 text-white/85' })}
        <span class="h-4 w-px bg-white/15"></span>
        <span>Audi Sport GmbH · Showroom Interactivo Astro 5 + Svelte 5 + WebGL2</span>
      </div>

      <div class="flex flex-wrap items-center gap-5">
        <a href="#hero" class="hover:text-white transition">Inicio</a>
        <a href="#audi-showroom" class="hover:text-white transition">Showroom 1080p</a>
        <a href="#ingenieria" class="hover:text-white transition">Ingeniería V10</a>
        <a href="#drive-select" class="hover:text-white transition">Drive Select</a>
        <a href="#comparador" class="hover:text-white transition">Comparador</a>
      </div>
    </footer>
  </div>
</section>
