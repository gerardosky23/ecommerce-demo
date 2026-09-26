<script lang="ts">
  import { fly } from 'svelte/transition';
  import { Spring } from 'svelte/motion';
  import {
    AudiSportBadge,
    ArrowRight,
    GaugeIcon,
    BoltIcon,
    ShieldCarbon,
    PlayIcon,
  } from './Icons.svelte';

  const heroStats = [
    {
      value: '620 CV',
      unit: '5.2L V10 FSI',
      label: 'Potencia atmosférica pura a 8,700 RPM',
      accent: '#f50537',
    },
    {
      value: '3.1 s',
      unit: '0 – 100 km/h',
      label: 'Launch Control con tracción quattro',
      accent: '#3b82f6',
    },
    {
      value: '331 km/h',
      unit: 'Velocidad Máx.',
      label: 'Carga aerodinámica en fibra de carbono',
      accent: '#10b981',
    },
  ];

  const rpmBars = [28, 42, 58, 74, 88, 96, 82, 92, 100, 76, 64, 86];

  let videoRef: HTMLVideoElement | null = $state(null);
  let ready = $state(false);
  let prefersReducedMotion = $state(false);
  let revving = $state(false);

  // Mouse spotlight & 3D parallax using Svelte 5 Spring
  const parallax = new Spring({ x: 0, y: 0 }, { stiffness: 0.08, damping: 0.4 });
  const ctaSpring = new Spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.45 });
  let spotX = $state(50);
  let spotY = $state(50);

  function handleHeroMouseMove(e: MouseEvent) {
    if (prefersReducedMotion) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    parallax.set({ x: nx * 18, y: ny * 12 });
    spotX = ((e.clientX - rect.left) / rect.width) * 100;
    spotY = ((e.clientY - rect.top) / rect.height) * 100;
  }

  function handleHeroMouseLeave() {
    parallax.set({ x: 0, y: 0 });
  }

  function handleCtaMove(e: MouseEvent) {
    if (prefersReducedMotion) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    ctaSpring.set({ x: dx * 0.26, y: dy * 0.32 });
  }

  function handleCtaLeave() {
    ctaSpring.set({ x: 0, y: 0 });
  }

  $effect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;

    if (!videoRef) return;
    videoRef.muted = true;

    if (videoRef.readyState >= 2) {
      ready = true;
    }

    const play = videoRef.play();
    if (play?.then) {
      play.then(() => (ready = true)).catch(() => (ready = true));
    } else {
      ready = true;
    }

    if (prefersReducedMotion) {
      videoRef.pause();
      ready = true;
    }
  });

  $effect(() => {
    if (!videoRef || prefersReducedMotion) return;
    videoRef.playbackRate = revving ? 1.85 : 1.0;
  });

  function getTransition(delayMs: number) {
    if (prefersReducedMotion) return { duration: 0 };
    return { y: 24, duration: 900, delay: delayMs, opacity: 0 };
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
  id="hero"
  onmousemove={handleHeroMouseMove}
  onmouseleave={handleHeroMouseLeave}
  class="@container relative isolate flex flex-col justify-between min-h-[100svh] overflow-hidden px-[clamp(18px,2.8vw,48px)] pb-8 pt-[104px] bg-ground-deep"
>
  <!-- Background 1080p FullHD Video with 3D Mouse Parallax -->
  <div class="absolute inset-0 z-[-1] overflow-hidden">
    <video
      bind:this={videoRef}
      style="transform: translate3d({-parallax.current.x * 0.6}px, {-parallax.current.y * 0.6}px, 0) scale({ready ? (revving ? 1.07 : 1.03) : 1.08});"
      class="w-full h-full object-cover object-center transition-opacity duration-[1.8s] ease-[var(--ease-out)] {ready ? 'opacity-100' : 'opacity-0'}"
      src="/hero-loop.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      onloadeddata={() => (ready = true)}
      oncanplay={() => (ready = true)}
      onplaying={() => (ready = true)}
    ></video>

    <!-- Dynamic Interactive Cursor Spotlight Overlay -->
    <div
      class="absolute inset-0 pointer-events-none transition-opacity duration-500"
      style="background: radial-gradient(650px circle at {spotX}% {spotY}%, rgba(37, 99, 235, 0.14), rgba(245, 5, 55, 0.06) 40%, transparent 75%);"
      aria-hidden="true"
    ></div>

    <!-- Editorial Carbon & Vignette Gradients -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(95deg, rgba(5, 6, 10, 0.92) 0%, rgba(5, 6, 10, 0.68) 34%, rgba(5, 6, 10, 0.18) 58%, rgba(5, 6, 10, 0.45) 100%), linear-gradient(0deg, rgba(5, 6, 10, 0.95) 0%, rgba(5, 6, 10, 0.2) 30%, rgba(0, 0, 0, 0) 55%), linear-gradient(180deg, rgba(5, 6, 10, 0.72) 0%, rgba(0, 0, 0, 0) 24%);"
      aria-hidden="true"
    ></div>

    <!-- Futuristic HUD Grid Lines -->
    <div class="hidden md:flex absolute inset-0 justify-between px-[24%] pointer-events-none" aria-hidden="true">
      <span class="w-px bg-white/[0.04]"></span>
      <span class="w-px bg-white/[0.04]"></span>
      <span class="w-px bg-white/[0.04]"></span>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="flex-1 grid grid-cols-1 @lg:grid-cols-[1.15fr_0.85fr] content-center items-center gap-10 my-auto py-6">
    <div
      class="max-w-[680px]"
      style="transform: translate3d({parallax.current.x * 0.35}px, {parallax.current.y * 0.35}px, 0);"
    >
      {#if ready || prefersReducedMotion}
        <div
          in:fly={getTransition(0)}
          class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/14 bg-white/[0.05] backdrop-blur-md text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/85"
        >
          {@render AudiSportBadge({ class: 'w-4 h-3.5 shrink-0' })}
          <span>Audi Sport GmbH · 1080p Real-Time Telemetry</span>
          <span class="w-2 h-2 rounded-full bg-audi-red animate-ping"></span>
        </div>

        <h1
          in:fly={getTransition(70)}
          class="mt-6 font-display text-[clamp(2.65rem,5.8vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.65)]"
        >
          Audi R8 V10<br />
          <span class="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Performance
          </span>
          <em class="font-italic font-normal italic text-audi-red-lit tracking-normal ml-2">quattro</em>
        </h1>

        <p
          in:fly={getTransition(140)}
          class="mt-5 max-w-[510px] text-[15.5px] leading-relaxed text-ink-soft"
        >
          El último ícono atmosférico de diez cilindros. Experimenta su aerodinámica en
          <strong class="text-white font-medium">1920×1080 Full HD</strong> y transforma su pintura
          en tiempo real con nuestro motor interactivo WebGL2.
        </p>

        <!-- Interactive Magnetic CTA & V10 Rev Button -->
        <div in:fly={getTransition(210)} class="flex flex-wrap items-center gap-4 mt-7">
          <a
            href="#audi-showroom"
            onmousemove={handleCtaMove}
            onmouseleave={handleCtaLeave}
            style="transform: translate3d({ctaSpring.current.x}px, {ctaSpring.current.y}px, 0);"
            class="btn btn--flame text-[15px]"
          >
            <span>Explorar Showroom Scroll 360°</span>
            <span
              class="grid place-items-center w-[2.45em] h-[2.45em] rounded-full bg-white text-[#090a10] transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              {@render ArrowRight({ class: 'w-[1.15em] h-[1.15em]' })}
            </span>
          </a>

          <!-- Interactive Hold/Hover Button that accelerates the 1080p Hero Video! -->
          <button
            type="button"
            onmouseenter={() => (revving = true)}
            onmouseleave={() => (revving = false)}
            onmousedown={() => (revving = true)}
            onmouseup={() => (revving = false)}
            class="group relative inline-flex items-center gap-3 py-3 px-5 rounded-full border transition-all duration-300 cursor-pointer backdrop-blur-xl {revving
              ? 'border-audi-red bg-audi-red/20 text-white shadow-[0_0_35px_rgba(245,5,55,0.45)] scale-[1.03]'
              : 'border-white/15 bg-white/[0.05] text-white/85 hover:border-white/35 hover:bg-white/10'}"
          >
            <span
              class="w-2.5 h-2.5 rounded-full transition-colors {revving ? 'bg-audi-red animate-ping' : 'bg-ascari-lit'}"
            ></span>
            <span class="text-xs font-semibold uppercase tracking-wider">
              {revving ? '8,700 RPM · MODO TURBO ACTIVO' : 'Mantén cursor: Acelerar V10 (1.85x)'}
            </span>
          </button>
        </div>

        <!-- Interactive 3D Hover Telemetry Cards -->
        <ul in:fly={getTransition(290)} class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 p-0 list-none">
          {#each heroStats as stat}
            <li
              class="group relative overflow-hidden flex flex-col justify-between min-h-[126px] p-4 rounded-2xl border border-white/12 bg-[rgba(10,13,22,0.62)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.6)]"
            >
              <div
                class="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none"
                style="background: {stat.accent};"
              ></div>

              <div class="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-white/50">
                <span>{stat.unit}</span>
                <span
                  class="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                  style="background: {stat.accent};"
                ></span>
              </div>

              <div class="my-2 font-display text-[clamp(1.65rem,2.3vw,2.25rem)] font-semibold leading-none tracking-tight text-white">
                {stat.value}
              </div>

              <span class="text-[11.5px] leading-snug text-white/55 group-hover:text-white/80 transition-colors">
                {stat.label}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Right Futuristic HUD Telemetry Panel -->
    <aside
      style="transform: translate3d({-parallax.current.x * 0.45}px, {-parallax.current.y * 0.45}px, 0);"
      class="hidden @lg:flex flex-col justify-self-end w-full max-w-[340px] p-6 rounded-3xl border border-white/12 bg-[rgba(8,10,16,0.64)] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      aria-label="Telemetría de Pista Audi Sport"
    >
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-2">
          {@render GaugeIcon({ class: 'w-4 h-4 text-audi-red-lit' })}
          <span class="text-[11px] font-mono uppercase tracking-widest text-white/65">
            V10 Telemetry Live
          </span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-audi-red/20 text-audi-red-lit border border-audi-red/30">
          {revving ? '8,700 RPM' : '4,250 RPM'}
        </span>
      </div>

      <!-- Animated Equalizer / Dyno Bars -->
      <div class="mt-5 flex items-end justify-between gap-1.5 h-[78px] px-1">
        {#each rpmBars as h, idx}
          <span
            class="flex-1 rounded-t-sm transition-all duration-300 {revving
              ? 'bg-gradient-to-t from-audi-red to-audi-red-lit'
              : idx > 7
                ? 'bg-audi-red/75'
                : 'bg-white/45'}"
            style="height: {revving ? Math.min(100, h + 18) : h}%;"
          ></span>
        {/each}
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <span class="block text-[10px] font-mono uppercase text-white/45">Par Motor</span>
          <strong class="font-display text-lg font-semibold text-white">580 Nm</strong>
          <span class="block text-[10px] text-emerald-400 mt-0.5">@ 6,600 RPM</span>
        </div>
        <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <span class="block text-[10px] font-mono uppercase text-white/45">Chasis ASF</span>
          <strong class="font-display text-lg font-semibold text-white">1,595 kg</strong>
          <span class="block text-[10px] text-ascari-lit mt-0.5">Carbono + Aluminio</span>
        </div>
      </div>

      <p class="mt-4 text-[12px] leading-relaxed text-white/55">
        Pasa el cursor sobre el botón <strong class="text-white/85">Acelerar V10</strong> para sentir la respuesta del video en 1080p, o haz scroll hacia abajo para entrar al laboratorio de pintura interactiva.
      </p>
    </aside>
  </div>

  <!-- Bottom Bar: Scroll Indicator & Technical Badges -->
  {#if ready || prefersReducedMotion}
    <div
      in:fly={getTransition(360)}
      class="relative flex flex-col @lg:flex-row items-start @lg:items-end justify-between gap-6 pt-4 border-t border-white/10"
    >
      <div class="flex flex-wrap items-center gap-6 text-xs text-white/60">
        <span class="inline-flex items-center gap-2">
          {@render ShieldCarbon({ class: 'w-4 h-4 text-ascari-lit' })}
          <span>Monocasco <strong class="text-white">Audi Space Frame (CFRP)</strong></span>
        </span>
        <span class="inline-flex items-center gap-2">
          {@render BoltIcon({ class: 'w-4 h-4 text-audi-red-lit' })}
          <span>Transmisión <strong class="text-white">S tronic 7 vel.</strong></span>
        </span>
        <span class="inline-flex items-center gap-2">
          {@render PlayIcon({ class: 'w-3.5 h-3.5 text-emerald-400' })}
          <span>Video Fuente: <strong class="text-white font-mono">1920×1080 · 24 FPS</strong></span>
        </span>
      </div>

      <a
        href="#audi-showroom"
        class="group inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors"
      >
        <span>Bajar al Showroom Scrollable</span>
        <span class="grid place-items-center w-7 h-7 rounded-full border border-white/20 bg-white/5 group-hover:border-audi-red group-hover:bg-audi-red/20 transition-all">
          {@render ArrowRight({ class: 'w-3.5 h-3.5 rotate-90' })}
        </span>
      </a>
    </div>
  {/if}
</section>
