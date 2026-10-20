<script lang="ts">
  import { onMount } from 'svelte';
  import '@fontsource/barlow-condensed/600.css';
  import '@fontsource/dm-sans/400.css';
  import '@fontsource/dm-sans/500.css';

  interface Props {
    heroVideoSrc?: string;
    heroImageSrc?: string;
    frameCount?: number;
    framePattern?: string;
  }

  let {
    heroVideoSrc = '/Gorilla_turning_head_1080p_20261018160337.mp4',
    heroImageSrc = '/images/gorilla-headphones.jpg',
    frameCount = 120,
    framePattern = '/frames/gorilla/frame_{INDEX}.webp'
  }: Props = $props();

  // --- Hero Section State (Video Loop) ---
  let heroVideoEl: HTMLVideoElement | null = $state(null);
  let heroStageEl: HTMLElement | null = $state(null);
  let heroHasFilm = $state(false);
  let heroImmersive = $state(false);
  let isHeroVisible = $state(true);
  let isReducedMotion = $state(false);

  let heroCtaBtnEl: HTMLButtonElement | null = $state(null);
  let heroReturnBtnEl: HTMLButtonElement | null = $state(null);

  function syncHeroPlayback() {
    if (!heroVideoEl) return;
    if (isReducedMotion || document.hidden || !isHeroVisible) {
      heroVideoEl.pause();
      return;
    }
    const playPromise = heroVideoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  function openHeroScene() {
    heroImmersive = true;
    syncHeroPlayback();
    setTimeout(() => {
      heroReturnBtnEl?.focus({ preventScroll: true });
    }, 60);
  }

  function closeHeroScene() {
    heroImmersive = false;
    syncHeroPlayback();
    setTimeout(() => {
      heroCtaBtnEl?.focus({ preventScroll: true });
    }, 60);
  }

  function handleHeroKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && heroImmersive) {
      closeHeroScene();
    }
  }

  // --- Interactive State for Intermediate Section ---
  type SoundProfile = 'anc' | 'estudio' | 'graves';
  let activeProfile = $state<SoundProfile>('anc');
  let ancIntensity = $state(100); // 0 to 100%

  function setProfile(profile: SoundProfile) {
    activeProfile = profile;
    if (profile === 'anc') ancIntensity = 100;
    if (profile === 'estudio') ancIntensity = 40;
    if (profile === 'graves') ancIntensity = 80;
  }

  const profileData: Record<SoundProfile, { title: string; desc: string; stat1: string; label1: string; stat2: string; label2: string }> = {
    anc: {
      title: 'SILENCIO ADAPTATIVO',
      desc: 'Cancelación híbrida a -42 dB. Micrófonos duales corrigen la presión sonora exterior 3,000 veces por segundo.',
      stat1: '-42 dB',
      label1: 'Atenuación ANC',
      stat2: '< 0.3 ms',
      label2: 'Latencia DSP'
    },
    estudio: {
      title: 'RESPUESTA PLANA',
      desc: 'Curva Harman neutra calibrada para masterización analítica sin coloración artificial ni picos resonantes.',
      stat1: '± 0.5 dB',
      label1: 'Linealidad',
      stat2: '0.08%',
      label2: 'THD armónico'
    },
    graves: {
      title: 'EXTENSIÓN SUBSÓNICA',
      desc: 'Refuerzo analógico de bajas frecuencias desde 5 Hz gracias a la cámara de descompresión trasera.',
      stat1: '5 Hz',
      label1: 'Rango inferior',
      stat2: '+6 dB',
      label2: 'Pegada a 40 Hz'
    }
  };

  // Dynamic equalizer spectrum bars (Rune reactivity)
  let eqBars = $derived.by(() => {
    if (activeProfile === 'anc') {
      const scale = 1 - (ancIntensity / 100) * 0.72;
      return [26, 22, 19, 16, 12, 10, 8, 8, 10, 12, 15, 18, 20, 22, 24, 26].map(h => Math.max(4, Math.round(h * scale)));
    } else if (activeProfile === 'estudio') {
      return [28, 27, 28, 29, 28, 28, 29, 28, 28, 27, 28, 29, 28, 28, 27, 28];
    } else {
      // graves
      return [58, 54, 48, 40, 32, 24, 18, 14, 12, 10, 12, 14, 16, 18, 16, 14];
    }
  });

  // Current calculated decibels
  let currentDb = $derived.by(() => {
    if (activeProfile === 'anc') {
      return `-${Math.round(42 * (ancIntensity / 100))} dB`;
    }
    return profileData[activeProfile].stat1;
  });

  // --- Interactive State for Scrollytelling Steps ---
  let step1Mode = $state<'anc' | 'transparencia'>('anc');
  let step2View = $state<'anodizado' | 'ergonomia'>('anodizado');
  let step3Tuning = $state<'titanio' | 'rango'>('titanio');

  // --- Scrollytelling Canvas State ---
  let canvasEl: HTMLCanvasElement | null = $state(null);
  let scrollTrackEl: HTMLElement | null = $state(null);
  let currentFrameIndex = $state(0);
  let isCanvasReady = $state(false);

  // Preloaded frame cache
  let frames: HTMLImageElement[] = [];
  let lastRenderedFrame = 0;

  function getFrameUrl(index: number): string {
    const padded = String(index + 1).padStart(4, '0');
    return framePattern.replace('{INDEX}', padded);
  }

  function renderFrame(index: number) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let img = frames[index];
    if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      img = frames[lastRenderedFrame] || frames[0];
    }
    if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      return;
    }

    const canvasWidth = canvasEl.width;
    const canvasHeight = canvasEl.height;
    if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) return;

    // Draw frame centered with object-fit: cover
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderW = canvasWidth;
    let renderH = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderW = canvasWidth;
      renderH = canvasWidth / imgRatio;
      offsetY = (canvasHeight - renderH) / 2;
    } else {
      renderH = canvasHeight;
      renderW = canvasHeight * imgRatio;
      offsetX = (canvasWidth - renderW) / 2;
    }

    // Safety checks against NaN/Infinity for Firefox Gecko
    if (!Number.isFinite(renderW) || !Number.isFinite(renderH) || !Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
      return;
    }

    try {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      lastRenderedFrame = index;
    } catch (_) {
      // Safe guard against Gecko NS_ERROR_NOT_AVAILABLE
    }
  }

  function updateScroll() {
    if (!scrollTrackEl || !isCanvasReady) return;
    const rect = scrollTrackEl.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

    const targetFrame = Math.min(
      frameCount - 1,
      Math.floor(progress * frameCount)
    );

    if (targetFrame !== currentFrameIndex) {
      currentFrameIndex = targetFrame;
      renderFrame(currentFrameIndex);
    }
  }

  function resizeCanvas() {
    if (!canvasEl) return;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (w > 0 && h > 0) {
      canvasEl.width = w;
      canvasEl.height = h;
      renderFrame(currentFrameIndex);
    }
  }

  onMount(() => {
    // 1. Accessibility query
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = reducedQuery.matches;

    const onMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      syncHeroPlayback();
    };
    reducedQuery.addEventListener('change', onMotionChange);

    const onVisibilityChange = () => {
      syncHeroPlayback();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 2. Hero video intersection observer
    let heroObserver: IntersectionObserver | null = null;
    if (heroStageEl) {
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          isHeroVisible = entry.isIntersecting;
          syncHeroPlayback();
        },
        { threshold: 0.05 }
      );
      heroObserver.observe(heroStageEl);
    }

    // 3. Hero video ready events
    if (heroVideoEl) {
      if (heroVideoEl.readyState >= 3) {
        heroHasFilm = true;
        syncHeroPlayback();
      }
      heroVideoEl.addEventListener('canplay', () => {
        heroHasFilm = true;
        syncHeroPlayback();
      });
      heroVideoEl.addEventListener('playing', () => {
        heroHasFilm = true;
      });
      heroVideoEl.addEventListener('error', () => {
        heroHasFilm = false;
      });
    }

    // 4. Initialize Scrollytelling Canvas & Preload sequence
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    frames = new Array(frameCount);

    async function loadFrame(idx: number, onLoaded?: () => void) {
      if (frames[idx] && frames[idx].complete && frames[idx].naturalWidth > 0) {
        onLoaded?.();
        return;
      }
      const img = new Image();
      img.onload = async () => {
        try {
          if ('decode' in img) {
            await img.decode();
          }
        } catch (_) {}
        if (idx === 0) {
          isCanvasReady = true;
          renderFrame(0);
        }
        onLoaded?.();
      };
      img.onerror = () => {
        if (idx !== 0 && frames[0]) {
          frames[idx] = frames[0];
        }
      };
      img.src = getFrameUrl(idx);
      frames[idx] = img;

      // Check if already cached synchronously
      if (img.complete && img.naturalWidth > 0) {
        try {
          if ('decode' in img) {
            await img.decode();
          }
        } catch (_) {}
        if (idx === 0) {
          isCanvasReady = true;
          renderFrame(0);
        }
        onLoaded?.();
      }
    }

    // Step A: Load frame 0 immediately
    loadFrame(0, () => {
      renderFrame(0);
    });

    // Step B: Load first 15 frames immediately for smooth initial scroll
    for (let i = 1; i < Math.min(15, frameCount); i++) {
      loadFrame(i);
    }

    // Step C: Progressive batch loading for remaining frames
    let nextIdx = 15;
    const batchInterval = setInterval(() => {
      if (nextIdx >= frameCount) {
        clearInterval(batchInterval);
        return;
      }
      const batchEnd = Math.min(nextIdx + 10, frameCount);
      for (let i = nextIdx; i < batchEnd; i++) {
        loadFrame(i);
      }
      nextIdx = batchEnd;
    }, 80);

    // 5. Scroll listener via requestAnimationFrame
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => {
      reducedQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', onScroll);
      if (heroObserver && heroStageEl) heroObserver.unobserve(heroStageEl);
      if (heroVideoEl) heroVideoEl.pause();
    };
  });
</script>

<div class="gorilla-experience">
  <!-- ======================================================== -->
  <!-- 1. HERO SECTION (VIDEO EN LOOP ORIGINAL + OVERLAY INFERIOR)-->
  <!-- ======================================================== -->
  <section
    class="center-track relative w-full overflow-hidden"
    id="hero-gorilla"
    aria-label="Hero Audífonos Aura"
  >
    <div
      bind:this={heroStageEl}
      class="center-stage relative w-full overflow-hidden select-none"
      class:immersive={heroImmersive}
      class:has-film={heroHasFilm}
      onkeydown={handleHeroKeydown}
      role="region"
      aria-label="Escena cinemática del gorila"
    >
      <!-- Background Video in continuous loop + poster fallback -->
      <div class="center-art" aria-hidden="true">
        <img
          src={heroImageSrc}
          alt="Gorila con capucha verde y audífonos rojos"
          fetchpriority="high"
          loading="eager"
          class="center-media-img"
        />
        <video
          bind:this={heroVideoEl}
          src={heroVideoSrc}
          poster={heroImageSrc}
          muted
          loop
          autoplay
          playsinline
          preload="auto"
          class="center-media-video"
        ></video>
      </div>

      <!-- Subtle gradient overlay on desktop to protect text readability -->
      <div class="center-shade" aria-hidden="true"></div>

      <!-- Bottom blend overlay to seamlessly merge into intermediate section -->
      <div class="hero-bottom-overlay" aria-hidden="true"></div>

      <!-- Header: Brand, Navigation & Scene Trigger -->
      <header class="center-header">
        <a class="center-brand" href="#hero-gorilla" aria-label="Aura Audio">
          AURA AUDIO
        </a>
        <div class="center-header-nav">
          <a class="center-nav-link" href="#especificaciones">Especificaciones</a>
          <button
            class="center-explore"
            type="button"
            onclick={openHeroScene}
            aria-expanded={heroImmersive}
            aria-label="Ver video en pantalla completa sin textos"
          >
            Ver video
          </button>
        </div>
      </header>

      <!-- Main Content Left-Aligned Column (over the green studio negative space) -->
      <div class="center-content">
        <h1 class="center-title">
          <span class="title-line">AISLA EL MUNDO.</span>
          <span class="title-line">SIENTE EL RITMO.</span>
        </h1>

        <p class="center-body">
          Cancelación activa de ruido y acústica de alta fidelidad. Diseñados para sumergirte en cada beat sin interrupciones.
        </p>

        <div class="center-actions">
          <a class="center-cta" href="#secuencia">
            Explorar con scroll
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </a>
        </div>
      </div>

      <!-- Floating return button when scene is cleared / immersive -->
      <button
        bind:this={heroReturnBtnEl}
        class="center-return"
        type="button"
        onclick={closeHeroScene}
        aria-label="Volver al contenido o presiona Escape"
        tabindex={heroImmersive ? 0 : -1}
      >
        Volver al contenido
      </button>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 2. SECCIÓN INTERMEDIA: OVERLAYS DE FUSIÓN + INTERACTIVOS  -->
  <!-- ======================================================== -->
  <section class="transition-section" aria-label="Calibración acústica">
    <!-- Top & bottom fusion overlays to blend with hero and scrollytelling -->
    <div class="transition-top-overlay" aria-hidden="true"></div>
    <div class="transition-bottom-overlay" aria-hidden="true"></div>

    <div class="transition-inner">
      <h2 class="transition-title">CALIBRACIÓN ACÚSTICA</h2>
      <p class="transition-desc">
        Atenuación adaptativa de ruido y curvas de respuesta en frecuencia calibradas.
      </p>

      <!-- Interactive Sound Profiles Selector -->
      <div class="profile-tabs" role="tablist" aria-label="Perfiles de sonido">
        <button
          type="button"
          role="tab"
          aria-selected={activeProfile === 'anc'}
          class="profile-btn"
          class:active={activeProfile === 'anc'}
          onclick={() => setProfile('anc')}
        >
          ANC Máximo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeProfile === 'estudio'}
          class="profile-btn"
          class:active={activeProfile === 'estudio'}
          onclick={() => setProfile('estudio')}
        >
          Modo Estudio
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeProfile === 'graves'}
          class="profile-btn"
          class:active={activeProfile === 'graves'}
          onclick={() => setProfile('graves')}
        >
          Extensión Graves
        </button>
      </div>

      <!-- Real-Time Interactive Spectrum Visualizer -->
      <div class="interactive-visualizer" aria-label="Visualizador de espectro acústico">
        <div class="eq-bars-container">
          {#each eqBars as height, i}
            <div
              class="eq-bar"
              style="height: {height}px; animation-delay: {i * 40}ms;"
            ></div>
          {/each}
        </div>
      </div>

      <!-- Interactive Attenuation Dial/Slider -->
      <div class="interactive-slider-box">
        <div class="slider-header">
          <label for="anc-slider" class="slider-label">Atenuación Activa</label>
          <span class="slider-value tabular-nums">{currentDb}</span>
        </div>
        <input
          id="anc-slider"
          type="range"
          min="0"
          max="100"
          bind:value={ancIntensity}
          class="anc-range-slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={ancIntensity}
          aria-label="Ajustar supresión activa"
        />
        <div class="slider-scale">
          <span>0 dB (Ambiente)</span>
          <span>-21 dB</span>
          <span>-42 dB (Aislamiento Total)</span>
        </div>
      </div>

      <!-- Interactive Readout (Minimalist, High Contrast) -->
      <div class="profile-readout">
        <h3 class="readout-title">{profileData[activeProfile].title}</h3>
        <p class="readout-desc">{profileData[activeProfile].desc}</p>
        <div class="readout-metrics">
          <div class="metric-item">
            <span class="metric-val tabular-nums">{currentDb}</span>
            <span class="metric-lbl">{profileData[activeProfile].label1}</span>
          </div>
          <div class="metric-item">
            <span class="metric-val tabular-nums">{profileData[activeProfile].stat2}</span>
            <span class="metric-lbl">{profileData[activeProfile].label2}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 3. SCROLL TRACK (CANVAS CON FALLBACK INMEDIATO)           -->
  <!-- ======================================================== -->
  <section
    bind:this={scrollTrackEl}
    class="scroll-track"
    id="secuencia"
    aria-label="Secuencia interactiva scrollytelling"
  >
    <!-- Canvas Sticky Background (Image fallback + Canvas: 100% visible, zero black frames) -->
    <div class="canvas-sticky-container">
      <img
        src="/frames/gorilla/frame_0001.webp"
        alt="AURA Master 2026"
        class="sequence-canvas-fallback"
        loading="eager"
        fetchpriority="high"
        aria-hidden="true"
      />
      <canvas bind:this={canvasEl} class="sequence-canvas"></canvas>
    </div>

    <!-- Story Stream: Pure typography with micro-interactions -->
    <div class="story-stream">
      <!-- FASE 01: A la izquierda -->
      <div class="story-step step-left step-1" style="top: 35vh;">
        <div class="story-typography">
          <h3 class="story-title">CANCELACIÓN ACTIVA HÍBRIDA</h3>
          
          {#if step1Mode === 'anc'}
            <p class="story-text">
              Silencio a -42 dB. Micrófonos duales neutralizan el ruido en menos de 0.3 ms antes de alcanzar tus oídos.
            </p>
          {:else}
            <p class="story-text">
              Modo Transparencia binaural. Deja pasar la voz humana y señales del entorno sin retirar los auriculares.
            </p>
          {/if}

          <!-- Micro-interaction toggle -->
          <div class="interactive-switch-row">
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step1Mode === 'anc'}
              onclick={() => step1Mode = 'anc'}
            >
              ANC Activo (-42 dB)
            </button>
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step1Mode === 'transparencia'}
              onclick={() => step1Mode = 'transparencia'}
            >
              Transparencia
            </button>
          </div>
        </div>
      </div>

      <!-- FASE 02: A la derecha -->
      <div class="story-step step-right step-2" style="top: 135vh;">
        <div class="story-typography">
          <h3 class="story-title">DIADEMA DE ALUMINIO</h3>

          {#if step2View === 'anodizado'}
            <p class="story-text">
              Mecanizado CNC en aluminio de grado aeroespacial en rojo mate. Máxima rigidez con 265 gramos de peso.
            </p>
          {:else}
            <p class="story-text">
              Distribución simétrica de masa. Presión craneal optimizada para uso profesional continuo.
            </p>
          {/if}

          <!-- Micro-interaction toggle -->
          <div class="interactive-switch-row">
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step2View === 'anodizado'}
              onclick={() => step2View = 'anodizado'}
            >
              Aluminio CNC
            </button>
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step2View === 'ergonomia'}
              onclick={() => step2View = 'ergonomia'}
            >
              Ergonomía
            </button>
          </div>
        </div>
      </div>

      <!-- FASE 03: A la izquierda -->
      <div class="story-step step-left step-3" style="top: 235vh;">
        <div class="story-typography">
          <h3 class="story-title">DRIVERS DE TITANIO DE 50 MM</h3>

          {#if step3Tuning === 'titanio'}
            <p class="story-text">
              Diafragma con recubrimiento de titanio. Rigidez acústica que suprime la distorsión armónica.
            </p>
          {:else}
            <p class="story-text">
              Respuesta extendida de 5 Hz a 40 kHz. Graves profundos y agudos nítidos con fidelidad de estudio.
            </p>
          {/if}

          <!-- Micro-interaction toggle -->
          <div class="interactive-switch-row">
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step3Tuning === 'titanio'}
              onclick={() => step3Tuning = 'titanio'}
            >
              Diafragma Titanio
            </button>
            <button
              type="button"
              class="interactive-chip"
              class:chip-active={step3Tuning === 'rango'}
              onclick={() => step3Tuning = 'rango'}
            >
              5 Hz — 40 kHz
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 4. PIE DE PÁGINA ENCIMA DE LA ÚLTIMA ESCENA (OVERLAY)     -->
      <!-- ======================================================== -->
      <div class="story-step step-overlay-footer" id="especificaciones">
        <div class="specs-overlay-content">
          <h3 class="specs-overlay-title">ESPECIFICACIONES TÉCNICAS</h3>

          <div class="specs-overlay-grid">
            <div class="spec-text-block">
              <h4 class="spec-term">Arquitectura Acústica</h4>
              <p class="spec-def">Circumaural cerrado con transductores de titanio de 50 mm.</p>
            </div>
            <div class="spec-text-block">
              <h4 class="spec-term">Conectividad Pro</h4>
              <p class="spec-def">Bluetooth 5.4 LE Audio y analógico de 3.5 mm.</p>
            </div>
            <div class="spec-text-block">
              <h4 class="spec-term">Batería y Carga</h4>
              <p class="spec-def">55 horas continuas con carga rápida USB-C.</p>
            </div>
            <div class="spec-text-block">
              <h4 class="spec-term">Acabado y Materiales</h4>
              <p class="spec-def">Aluminio CNC mate y almohadillas viscoelásticas.</p>
            </div>
          </div>

          <!-- Bottom Actions & Return -->
          <div class="specs-actions">
            <button
              class="btn-return-top"
              type="button"
              onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Volver al inicio
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
            <p class="footer-legal">AURA AUDIO © 2026 · DISEÑADO PARA OÍDOS EXIGENTES</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(:root) {
    --gorilla-bg: #1a4028;
    --gorilla-dark-bg: #153620;
    --gorilla-text: #ffffff;
    --gorilla-muted: #d5e5db;
    --gorilla-red: #ea3838;
    --gorilla-red-hover: #d32828;
    --gorilla-font-title: 'Barlow Condensed', sans-serif;
    --gorilla-font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }

  .gorilla-experience {
    background-color: var(--gorilla-bg);
    color: var(--gorilla-text);
    font-family: var(--gorilla-font-body);
    min-height: 100vh;
  }

  /* ---------------------------------------------------- */
  /* 1. HERO SECTION (VIDEO EN LOOP)                      */
  /* ---------------------------------------------------- */
  .center-track {
    background-color: var(--gorilla-bg);
    color: var(--gorilla-text);
    width: 100%;
    min-height: 100svh;
  }

  .center-stage {
    position: relative;
    width: 100%;
    height: 100svh;
    min-height: 640px;
    background-color: var(--gorilla-bg);
    isolation: isolate;
    display: flex;
    align-items: center;
  }

  /* Media container */
  .center-art {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background-color: var(--gorilla-bg);
  }

  .center-media-img,
  .center-media-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 85% 50%;
  }

  .center-media-video {
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  .has-film .center-media-video {
    opacity: 1;
  }

  .has-film .center-media-img {
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  /* Subtle gradient overlay on desktop to protect text readability */
  .center-shade {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      90deg,
      rgba(22, 54, 34, 0.90) 0%,
      rgba(26, 68, 43, 0.72) 35%,
      rgba(29, 75, 47, 0.20) 58%,
      transparent 82%
    );
    pointer-events: none;
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Hero bottom overlay to seamlessly fuse into section 2 */
  .hero-bottom-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 160px;
    background: linear-gradient(180deg, transparent 0%, rgba(26, 64, 40, 0.75) 60%, #1a4028 100%);
    pointer-events: none;
    z-index: 3;
  }

  /* Header */
  .center-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 32px 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .center-brand {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: 28px;
    letter-spacing: 0.04em;
    color: var(--gorilla-text);
    text-decoration: none;
    line-height: 1;
    text-transform: uppercase;
    transition: opacity 0.2s ease;
  }

  .center-brand:hover {
    opacity: 0.8;
  }

  .center-header-nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .center-nav-link {
    font-size: 15px;
    font-weight: 500;
    color: #ffffff;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .center-nav-link:hover {
    opacity: 0.8;
  }

  .center-explore {
    border: 0;
    background: transparent;
    color: var(--gorilla-text);
    font-family: var(--gorilla-font-body);
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    padding: 10px 0;
    transition: opacity 0.2s ease;
  }

  .center-explore:hover {
    opacity: 0.75;
  }

  /* Left-aligned Content Column */
  .center-content {
    position: relative;
    z-index: 5;
    margin-left: 6%;
    max-width: min(780px, 48vw);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;
    transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Headline: More horizontal, expansive desktop layout */
  .center-title {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: clamp(46px, 4.8vw, 82px);
    line-height: 0.93;
    letter-spacing: -0.02em;
    color: var(--gorilla-text);
    margin: 0;
    text-transform: uppercase;
  }

  .title-line {
    display: block;
    white-space: nowrap;
  }

  /* Body Copy */
  .center-body {
    font-family: var(--gorilla-font-body);
    font-weight: 400;
    font-size: clamp(16px, 1.3vw, 20px);
    line-height: 1.45;
    color: var(--gorilla-muted);
    margin: 0;
    max-width: 500px;
  }

  /* Actions & Button */
  .center-actions {
    margin-top: 8px;
  }

  .center-cta {
    box-sizing: border-box;
    max-width: 100%;
    border: none;
    background-color: var(--gorilla-red);
    color: #ffffff;
    font-family: var(--gorilla-font-body);
    font-weight: 500;
    font-size: 16px;
    line-height: 1;
    min-height: 58px;
    padding: 0 34px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    box-shadow: 0 6px 24px rgba(234, 56, 56, 0.35);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }

  .center-cta:hover {
    background-color: var(--gorilla-red-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(234, 56, 56, 0.45);
  }

  .center-cta:active {
    transform: translateY(0);
    box-shadow: 0 3px 12px rgba(234, 56, 56, 0.25);
  }

  /* Return Button (Immersive State) */
  .center-return {
    position: absolute;
    bottom: 35px;
    left: 50%;
    transform: translateX(-50%) translateY(12px);
    z-index: 20;
    border-radius: 999px;
    min-height: 58px;
    height: 60px;
    padding: 0 32px;
    font-family: var(--gorilla-font-body);
    font-weight: 500;
    font-size: 16px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(22, 54, 34, 0.85);
    color: #ffffff;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  }

  .center-return:hover {
    background: rgba(22, 54, 34, 0.95);
    border-color: rgba(255, 255, 255, 0.6);
  }

  /* Immersive Mode */
  .immersive .center-content {
    opacity: 0;
    transform: translateX(-30px);
    pointer-events: none;
  }

  .immersive .center-shade {
    opacity: 0;
  }

  .immersive .center-explore {
    opacity: 0;
    pointer-events: none;
  }

  .immersive .center-return {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  /* ---------------------------------------------------- */
  /* 2. TRANSITION SECTION: FUSIÓN CON OVERLAYS           */
  /* ---------------------------------------------------- */
  .transition-section {
    position: relative;
    width: 100%;
    padding: 130px 6% 140px 6%;
    background: radial-gradient(ellipse 90% 60% at 50% 100%, rgba(67, 120, 84, 0.45) 0%, transparent 65%),
                linear-gradient(180deg, #1a4028 0%, #183a24 45%, #1b3d29 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    overflow: visible;
    z-index: 2;
  }

  /* Top & bottom fusion overlays */
  .transition-top-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(180deg, #1a4028 0%, transparent 100%);
    pointer-events: none;
    z-index: 2;
  }

  .transition-bottom-overlay {
    position: absolute;
    bottom: -60px;
    left: 0;
    right: 0;
    height: 220px;
    background: radial-gradient(ellipse 85% 65% at 50% 100%, rgba(67, 120, 84, 0.4) 0%, transparent 70%),
                linear-gradient(180deg, transparent 0%, rgba(27, 61, 41, 0.7) 45%, #1b3d29 73%, rgba(27, 61, 41, 0.5) 88%, transparent 100%);
    pointer-events: none;
    z-index: 3;
  }

  .transition-inner {
    position: relative;
    z-index: 3;
    max-width: 820px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .transition-title {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: clamp(38px, 5.2vw, 68px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0 0 18px 0;
    color: #ffffff;
    text-transform: uppercase;
  }

  .transition-desc {
    font-size: clamp(16px, 1.25vw, 19px);
    line-height: 1.55;
    color: #d5e5db;
    max-width: 620px;
    margin: 0 0 32px 0;
  }

  /* Interactive Profile Buttons */
  .profile-tabs {
    display: inline-flex;
    gap: 8px;
    background: rgba(0, 0, 0, 0.35);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 24px;
  }

  .profile-btn {
    background: transparent;
    border: none;
    color: #c9decfe0;
    font-family: var(--gorilla-font-body);
    font-size: 14px;
    font-weight: 500;
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .profile-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .profile-btn.active {
    background: #ea3838;
    color: #ffffff;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(234, 56, 56, 0.35);
  }

  /* Real-Time Equalizer Spectrum */
  .interactive-visualizer {
    width: 100%;
    max-width: 480px;
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin-bottom: 24px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 16px;
    box-sizing: border-box;
  }

  .eq-bars-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 100%;
  }

  .eq-bar {
    width: 8px;
    background: linear-gradient(180deg, #ea3838 0%, #1a4028 100%);
    border-radius: 3px 3px 0 0;
    transition: height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Interactive Slider Box */
  .interactive-slider-box {
    width: 100%;
    max-width: 480px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 30px;
    box-sizing: border-box;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .slider-label {
    font-size: 13px;
    font-weight: 500;
    color: #c9decfe0;
  }

  .slider-value {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: 22px;
    color: #ea3838;
  }

  .anc-range-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .anc-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ea3838;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .anc-range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  .slider-scale {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #98c9a7;
    margin-top: 8px;
  }

  /* Minimalist Readout */
  .profile-readout {
    max-width: 580px;
    text-align: center;
  }

  .readout-title {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: 26px;
    letter-spacing: -0.01em;
    color: #ffffff;
    margin: 0 0 8px 0;
    text-transform: uppercase;
  }

  .readout-desc {
    font-size: 15px;
    line-height: 1.5;
    color: #d5e5db;
    margin: 0 0 24px 0;
  }

  .readout-metrics {
    display: inline-flex;
    align-items: center;
    gap: 32px;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .metric-val {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: 32px;
    line-height: 1;
    color: #ffffff;
  }

  .metric-lbl {
    font-size: 12px;
    color: #98c9a7;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ---------------------------------------------------- */
  /* 3. SCROLL TRACK (CANVAS STICKY + 3 STORY BLOCKS)     */
  /* ---------------------------------------------------- */
  .scroll-track {
    position: relative;
    width: 100%;
    height: 440vh;
    background-color: var(--gorilla-dark-bg);
  }

  .canvas-sticky-container {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: radial-gradient(ellipse 90% 60% at 50% 100%, rgba(67, 120, 84, 0.45) 0%, transparent 65%),
                linear-gradient(180deg, #1a4028 0%, #183a24 45%, #153620 100%);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sequence-canvas-fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }

  .sequence-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 2;
  }

  /* Story stream of blocks */
  .story-stream {
    position: absolute;
    inset: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .story-step {
    position: absolute;
    width: 100%;
    display: flex;
    padding: 0 6%;
    box-sizing: border-box;
    pointer-events: auto;
  }

  .step-left {
    justify-content: flex-start;
    padding-left: 6%;
  }

  .step-right {
    justify-content: flex-end;
    padding-right: 6%;
  }

  /* PURE MINIMALIST TYPOGRAPHY (Anti-Slop: No card boxes, no frosted glass, text-shadow only) */
  .story-typography {
    max-width: 440px;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.95);
  }

  .story-title {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: clamp(34px, 3.8vw, 48px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0 0 14px 0;
    text-transform: uppercase;
  }

  .story-text {
    font-size: clamp(15px, 1.2vw, 17px);
    line-height: 1.55;
    color: #e2eee6;
    margin: 0 0 20px 0;
  }

  /* Micro-interaction chips */
  .interactive-switch-row {
    display: inline-flex;
    gap: 8px;
    margin-bottom: 22px;
  }

  .interactive-chip {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #c9decfe0;
    font-family: var(--gorilla-font-body);
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  }

  .interactive-chip:hover {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.35);
  }

  .interactive-chip.chip-active {
    background: #ea3838;
    border-color: #ea3838;
    color: #ffffff;
  }

  /* ---------------------------------------------------- */
  /* 4. OVERLAID SPECS / FOOTER (ON TOP OF LAST PHASE)    */
  /* ---------------------------------------------------- */
  .step-overlay-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    min-height: 100svh;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding: 0 6% 48px 6%;
    box-sizing: border-box;
    pointer-events: auto;
  }

  .specs-overlay-content {
    max-width: 1050px;
    width: 100%;
    text-align: center;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
  }

  .specs-overlay-title {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: clamp(34px, 4.4vw, 56px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0 0 32px 0;
    text-transform: uppercase;
  }

  .specs-overlay-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    text-align: left;
    margin-bottom: 36px;
  }

  .spec-text-block {
    display: flex;
    flex-direction: column;
  }

  .spec-term {
    font-family: var(--gorilla-font-title);
    font-weight: 600;
    font-size: 20px;
    letter-spacing: -0.01em;
    color: #ea3838;
    margin: 0 0 6px 0;
    text-transform: uppercase;
  }

  .spec-def {
    font-size: 14px;
    line-height: 1.5;
    color: #d5e5db;
    margin: 0;
  }

  .specs-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    margin-top: 10px;
  }

  .btn-return-top {
    background-color: var(--gorilla-red);
    color: #ffffff;
    font-family: var(--gorilla-font-body);
    font-weight: 500;
    font-size: 15px;
    line-height: 1;
    min-height: 50px;
    padding: 0 30px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(234, 56, 56, 0.35);
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .btn-return-top:hover {
    background-color: var(--gorilla-red-hover);
    transform: translateY(-2px);
  }

  .footer-legal {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: #8dae99;
    margin: 0;
    text-transform: uppercase;
  }

  /* ---------------------------------------------------- */
  /* RESPONSIVE QUERIES                                   */
  /* ---------------------------------------------------- */
  @media (max-width: 900px) {
    .center-stage {
      min-height: 640px;
      height: 100svh;
      align-items: flex-end;
      padding-bottom: 28px;
    }

    .center-header {
      padding: 16px 18px;
    }

    .center-brand {
      font-size: 20px;
      white-space: nowrap;
    }

    .center-header-nav {
      gap: 12px;
    }

    .center-nav-link {
      font-size: 13px;
    }

    .center-explore {
      font-size: 13px;
      padding: 4px 0;
    }

    .center-media-img,
    .center-media-video {
      object-position: 88% 22%;
    }

    .center-shade {
      background: linear-gradient(
        0deg,
        rgba(22, 54, 34, 0.96) 0%,
        rgba(22, 54, 34, 0.82) 45%,
        rgba(26, 68, 43, 0.2) 62%,
        transparent 80%
      );
    }

    .center-content {
      margin: 0 18px 20px 18px;
      max-width: 100%;
      gap: 12px;
    }

    .center-title {
      font-size: clamp(32px, 9vw, 48px);
      line-height: 0.92;
    }

    .title-line {
      white-space: normal;
    }

    .center-body {
      font-size: 15px;
      line-height: 1.4;
      max-width: 340px;
    }

    .center-actions {
      width: 100%;
      margin-top: 4px;
    }

    .center-cta {
      width: 100%;
      height: 52px;
      min-height: 52px;
      font-size: 15px;
      justify-content: center;
    }

    .center-return {
      bottom: 20px;
      width: calc(100% - 36px);
      max-width: 300px;
      height: 52px;
      min-height: 52px;
      font-size: 15px;
    }

    /* Section 2: Calibración Acústica Responsive */
    .transition-section {
      padding: 85px 18px 95px 18px;
    }

    .transition-title {
      font-size: clamp(30px, 8vw, 42px);
      margin-bottom: 12px;
    }

    .transition-desc {
      font-size: 14.5px;
      margin-bottom: 24px;
    }

    .profile-tabs {
      width: 100%;
      max-width: 360px;
      display: flex;
      margin-bottom: 20px;
    }

    .profile-btn {
      flex: 1;
      padding: 9px 4px;
      font-size: 12.5px;
      white-space: nowrap;
    }

    .interactive-slider-box {
      width: 100%;
      max-width: 360px;
      padding: 16px 14px;
    }

    .readout-title {
      font-size: 22px;
    }

    .readout-desc {
      font-size: 14px;
    }

    .readout-metrics {
      gap: 24px;
    }

    .metric-val {
      font-size: 26px;
    }

    /* Section 3: Scrollytelling Steps in Mobile (Positioned strictly below gorilla face & headphones) */
    .scroll-track {
      height: 380vh;
    }

    .story-step {
      padding: 0 16px !important;
      justify-content: center !important;
    }

    .story-step.step-1 {
      top: 55vh !important;
    }

    .story-step.step-2 {
      top: 155vh !important;
    }

    .story-step.step-3 {
      top: 255vh !important;
    }

    .story-typography {
      max-width: 360px !important;
      width: 100%;
      text-align: center;
      background: rgba(13, 26, 17, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 16px 16px 14px 16px;
    }

    .story-title {
      font-size: clamp(20px, 5.5vw, 26px);
      margin-bottom: 6px;
    }

    .story-text {
      font-size: 13px;
      line-height: 1.42;
      margin-bottom: 12px;
    }

    .interactive-switch-row {
      justify-content: center;
      gap: 6px;
      margin-bottom: 0;
    }

    .interactive-chip {
      font-size: 11.5px;
      padding: 5px 11px;
    }

    /* Section 4: Specifications & Footer Overlay in Mobile */
    .step-overlay-footer {
      padding: 0 16px 24px 16px;
    }

    .specs-overlay-content {
      background: rgba(13, 26, 17, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 20px 16px 16px 16px;
      width: 100%;
      max-width: 400px;
    }

    .specs-overlay-title {
      font-size: 20px;
      margin-bottom: 14px;
    }

    .specs-overlay-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 12px;
      text-align: left;
      margin-bottom: 18px;
    }

    .spec-term {
      font-size: 12px;
      margin-bottom: 3px;
    }

    .spec-def {
      font-size: 11px;
      line-height: 1.32;
    }

    .btn-return-top {
      width: 100%;
      height: 46px;
      min-height: 46px;
      font-size: 13.5px;
      justify-content: center;
    }
  }

  /* Accessibility: prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .center-media-video {
      display: none !important;
    }

    .center-media-img {
      opacity: 1 !important;
      visibility: visible !important;
      transition: none !important;
    }

    .scroll-wheel {
      animation: none !important;
    }

    .center-content,
    .center-shade,
    .center-return,
    .center-cta,
    .center-explore {
      transition: none !important;
      transform: none !important;
    }

    .immersive .center-return {
      transform: translateX(-50%) !important;
    }
  }
</style>
