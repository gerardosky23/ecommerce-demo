<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { ArrowRight } from './Icons.svelte';

  const TOTAL_FRAMES = 240;

  interface PaintPreset {
    id: string;
    name: string;
    code: string;
    swatch: string;
    accent: string;
    hueShiftDeg: number;
    satScale: number;
    valScale: number;
  }

  // Calibrated relative to the native Ascari Blue (~224° HSV) of the Audi R8 video
  const paintPresets: PaintPreset[] = [
    {
      id: 'ascari-blue',
      name: 'Ascari Blue Metallic',
      code: 'LX5J',
      swatch: '#2563eb',
      accent: '#60a5fa',
      hueShiftDeg: 0,
      satScale: 1.15,
      valScale: 1.04,
    },
    {
      id: 'tango-red',
      name: 'Tango Red Metallic',
      code: 'LY3U',
      swatch: '#e61e1e',
      accent: '#ff4d3d',
      hueShiftDeg: 136,
      satScale: 1.68,
      valScale: 1.08,
    },
    {
      id: 'solar-orange',
      name: 'Solar Orange GT',
      code: 'LQ2A',
      swatch: '#ff6a00',
      accent: '#ff8a1f',
      hueShiftDeg: 158,
      satScale: 1.78,
      valScale: 1.14,
    },
    {
      id: 'python-yellow',
      name: 'Vegas Yellow R8',
      code: 'LY1C',
      swatch: '#eab308',
      accent: '#facc15',
      hueShiftDeg: 184,
      satScale: 1.72,
      valScale: 1.16,
    },
    {
      id: 'district-green',
      name: 'District Green RS',
      code: 'LZ6H',
      swatch: '#10b981',
      accent: '#34d399',
      hueShiftDeg: 280,
      satScale: 1.48,
      valScale: 1.05,
    },
    {
      id: 'daytona-grey',
      name: 'Daytona Grey Pearl',
      code: 'LZ7S',
      swatch: '#9ca3af',
      accent: '#e5e7eb',
      hueShiftDeg: 0,
      satScale: 0.10,
      valScale: 1.12,
    },
  ];

  const stages = [
    {
      id: '01',
      badge: 'ETAPA 01 · AUDI R8 V10 PERFORMANCE',
      title: 'Presencia en Estudio',
      subtitle: 'Ahora renderizamos los 240 fotogramas completos (24 FPS nativos) con filtro FFmpeg Deband + FidelityFX Contrast Adaptive Sharpening y resolución Retina/HiDPI en WebGL2.',
      metricLabel: 'Motor Atmosférico',
      metricValue: '5.2L V10',
      range: [0, 0.26],
      paintIndex: 0,
    },
    {
      id: '02',
      badge: 'ETAPA 02 · TRANSFORMACIÓN TANGO RED',
      title: '620 HP de Furia Cromática',
      subtitle: 'Al avanzar el scroll, el shader WebGL2 rota el matiz HSV de la carrocería de Ascari Blue a Tango Red Metallic (+136°) e intensifica el brillo especular.',
      metricLabel: '0 – 100 km/h',
      metricValue: '3.1 seg',
      range: [0.26, 0.54],
      paintIndex: 1,
    },
    {
      id: '03',
      badge: 'ETAPA 03 · SOLAR ORANGE & AERODINÁMICA',
      title: 'Toma Aérea & Fibra de Carbono',
      subtitle: 'Mientras la cámara se eleva sobre el techo y el alerón trasero del R8, la pintura transiciona hacia Solar Orange GT sin teñir el pavimento ni los faros LED.',
      metricLabel: 'Velocidad Máxima',
      metricValue: '331 km/h',
      range: [0.54, 0.80],
      paintIndex: 2,
    },
    {
      id: '04',
      badge: 'ETAPA 04 · AUDI EXCLUSIVE LAB',
      title: 'Personalización en Tiempo Real',
      subtitle: 'Usa la barra inferior para probar Vegas Yellow, District Green o Daytona Grey Pearl sobre los 240 fotogramas de alta definición.',
      metricLabel: 'Tracción Integral',
      metricValue: 'quattro',
      range: [0.80, 1.01],
      paintIndex: 4,
    },
  ];

  let sectionRef: HTMLElement | null = $state(null);
  let canvasRef: HTMLCanvasElement | null = $state(null);

  let loadedCount = $state(0);
  let isReady = $state(false);
  let showTechSpecs = $state(false);

  // Playback mode: 'scrub' (default: scroll controls exact frame) or 'autoplay' (video runs on its own + accelerates with scroll)
  let playbackMode = $state<'autoplay' | 'scrub'>('scrub');

  // Scroll & physics state (Svelte 5 Runes)
  let targetProgress = $state(0);
  let smoothProgress = $state(0);
  let scrollVelocity = $state(0);
  let autoPlayCursor = $state(0);

  // Paint configurator state ('auto' follows scroll stages, or manual preset ID)
  let selectedPaintMode = $state<'auto' | string>('auto');

  // Smoothly interpolated shader uniforms
  let currentHueDeg = $state(0);
  let currentSatScale = $state(1.15);
  let currentValScale = $state(1.04);

  let activeStageIndex = $derived.by(() => {
    const p = smoothProgress;
    if (p < 0.26) return 0;
    if (p < 0.54) return 1;
    if (p < 0.80) return 2;
    return 3;
  });

  let activeStage = $derived(stages[activeStageIndex]);

  let targetPaint = $derived.by(() => {
    if (selectedPaintMode === 'auto') {
      return paintPresets[stages[activeStageIndex].paintIndex];
    }
    return paintPresets.find((p) => p.id === selectedPaintMode) ?? paintPresets[0];
  });

  let activeFrameProgress = $derived(
    playbackMode === 'autoplay' ? autoPlayCursor : smoothProgress
  );

  let currentFrameNumber = $derived(
    Math.min(TOTAL_FRAMES, Math.max(1, Math.round(activeFrameProgress * (TOTAL_FRAMES - 1)) + 1))
  );

  let playbackRateMultiplier = $derived(
    playbackMode === 'autoplay' ? +(1.0 + Math.min(2.5, scrollVelocity * 38)).toFixed(1) : +(scrollVelocity * 50).toFixed(1)
  );

  let speedKmh = $derived(
    Math.round(
      (playbackMode === 'autoplay' ? 118 : 42) +
        smoothProgress * 165 +
        Math.min(65, scrollVelocity * 2200)
    )
  );

  let headlightBloom = $derived(
    Math.max(0.18, Math.sin(Math.max(0.1, (smoothProgress * 0.85 + 0.15)) * Math.PI))
  );

  function getFramePath(index1Based: number): string {
    const padded = String(index1Based).padStart(4, '0');
    return `/audi-frames/frame_${padded}.webp`;
  }

  $effect(() => {
    if (!canvasRef || !sectionRef) return;

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let cancelled = false;

    // 1. Preload all 240 high-quality WebP frames (24 FPS native)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFramePath(i + 1);
      img.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        if (loadedCount >= 12 && !isReady) {
          isReady = true;
        }
      };
      images[i] = img;
    }

    // 2. Initialize WebGL2 Selective Paint Shader on Canvas
    const gl = canvasRef.getContext('webgl2', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let uHueShiftLoc: WebGLUniformLocation | null = null;
    let uSatScaleLoc: WebGLUniformLocation | null = null;
    let uValScaleLoc: WebGLUniformLocation | null = null;
    let uBloomLoc: WebGLUniformLocation | null = null;
    let uVelocityLoc: WebGLUniformLocation | null = null;
    let uTexelSizeLoc: WebGLUniformLocation | null = null;
    let lastUploadedFrame = -1;

    if (gl) {
      const vsSource = `#version 300 es
        in vec2 a_pos;
        out vec2 v_uv;
        void main() {
          v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;

      const fsSource = `#version 300 es
        precision highp float;
        in vec2 v_uv;
        uniform sampler2D u_tex;
        uniform float u_hueShift;
        uniform float u_satScale;
        uniform float u_valScale;
        uniform float u_bloom;
        uniform float u_velocity;
        uniform vec2 u_texelSize;
        out vec4 outColor;

        vec3 rgb2hsv(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 dir = v_uv - center;
          float zoom = 1.0 - min(0.04, u_velocity * 0.5);
          vec2 uv = center + dir * zoom;

          // 5-tap unsharp mask for crisp 4K-like edge clarity from 720p source
          vec3 colCenter = texture(u_tex, uv).rgb;
          vec3 colN = texture(u_tex, uv + vec2(0.0, -u_texelSize.y)).rgb;
          vec3 colS = texture(u_tex, uv + vec2(0.0, u_texelSize.y)).rgb;
          vec3 colE = texture(u_tex, uv + vec2(u_texelSize.x, 0.0)).rgb;
          vec3 colW = texture(u_tex, uv + vec2(-u_texelSize.x, 0.0)).rgb;
          vec3 blur = 0.25 * (colN + colS + colE + colW);
          vec3 col = clamp(colCenter + (colCenter - blur) * 0.45, 0.0, 1.0);

          vec3 hsv = rgb2hsv(col);

          // Isolate the Audi R8 blue bodywork (Hue ~0.62, S > 0.11) while keeping studio background untouched
          float satMask = smoothstep(0.11, 0.23, hsv.y) * smoothstep(0.07, 0.16, hsv.z);
          float blueDist = abs(hsv.x - 0.62);
          float hueMask = 1.0 - smoothstep(0.10, 0.20, blueDist);
          float paintMask = satMask * hueMask;

          vec3 shiftedHsv = hsv;
          shiftedHsv.x = fract(hsv.x + u_hueShift);
          shiftedHsv.y = clamp(hsv.y * u_satScale, 0.0, 1.0);
          shiftedHsv.z = clamp(hsv.z * u_valScale, 0.0, 1.0);

          vec3 paintedRgb = hsv2rgb(shiftedHsv);
          vec3 finalRgb = mix(col, paintedRgb, paintMask);

          // Subtle LED DRL headlight glow boost
          float headlightMask = smoothstep(0.86, 0.98, hsv.z) * (1.0 - smoothstep(0.05, 0.20, hsv.y));
          finalRgb += vec3(0.90, 0.95, 1.0) * headlightMask * u_bloom * 0.25;

          outColor = vec4(finalRgb, 1.0);
        }
      `;

      const compileShader = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };

      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(program, 'a_pos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      uHueShiftLoc = gl.getUniformLocation(program, 'u_hueShift');
      uSatScaleLoc = gl.getUniformLocation(program, 'u_satScale');
      uValScaleLoc = gl.getUniformLocation(program, 'u_valScale');
      uBloomLoc = gl.getUniformLocation(program, 'u_bloom');
      uVelocityLoc = gl.getUniformLocation(program, 'u_velocity');
      uTexelSizeLoc = gl.getUniformLocation(program, 'u_texelSize');
    }

    // 3. High-DPI Canvas Resize + Scroll listener
    const updateScrollAndSize = () => {
      if (!sectionRef || !canvasRef) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.round(canvasRef.clientWidth * dpr) || 1920;
      const targetH = Math.round(canvasRef.clientHeight * dpr) || 1080;
      if (canvasRef.width !== targetW || canvasRef.height !== targetH) {
        canvasRef.width = targetW;
        canvasRef.height = targetH;
      }

      const rect = sectionRef.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const raw = -rect.top / scrollable;
      targetProgress = Math.max(0, Math.min(1, raw));
    };

    window.addEventListener('scroll', updateScrollAndSize, { passive: true });
    window.addEventListener('resize', updateScrollAndSize, { passive: true });
    updateScrollAndSize();

    // 4. 60fps Physics & Render Loop
    let rafId = 0;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const delta = targetProgress - smoothProgress;
      scrollVelocity = Math.abs(delta);
      smoothProgress += delta * 0.11;

      if (playbackMode === 'autoplay') {
        const baseSpeed = 0.10; // 10 seconds per full loop at rest (matching the 10s R8 video)
        const scrollBoost = scrollVelocity * 4.5;
        autoPlayCursor = (autoPlayCursor + dt * (baseSpeed + scrollBoost)) % 1.0;
      } else {
        autoPlayCursor = smoothProgress;
      }

      // Shortest-angle interpolation for Hue shift (0..360 deg)
      let hueDiff = ((targetPaint.hueShiftDeg - currentHueDeg + 540) % 360) - 180;
      currentHueDeg = (currentHueDeg + hueDiff * 0.09 + 360) % 360;
      currentSatScale += (targetPaint.satScale - currentSatScale) * 0.09;
      currentValScale += (targetPaint.valScale - currentValScale) * 0.09;

      const activeCursor = playbackMode === 'autoplay' ? autoPlayCursor : smoothProgress;
      const frameIdx = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(activeCursor * (TOTAL_FRAMES - 1)))
      );
      const img = images[frameIdx];

      if (img && img.complete && img.naturalWidth > 0 && canvasRef) {
        if (gl && program && texture) {
          gl.viewport(0, 0, canvasRef.width, canvasRef.height);
          gl.useProgram(program);

          if (lastUploadedFrame !== frameIdx) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            lastUploadedFrame = frameIdx;
          }

          gl.uniform1f(uHueShiftLoc, currentHueDeg / 360.0);
          gl.uniform1f(uSatScaleLoc, currentSatScale);
          gl.uniform1f(uValScaleLoc, currentValScale);
          gl.uniform1f(uBloomLoc, headlightBloom);
          gl.uniform1f(uVelocityLoc, scrollVelocity);
          gl.uniform2f(uTexelSizeLoc, 1.0 / img.naturalWidth, 1.0 / img.naturalHeight);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        } else {
          const ctx2d = canvasRef.getContext('2d');
          if (ctx2d) {
            ctx2d.filter = `hue-rotate(${currentHueDeg.toFixed(1)}deg) saturate(${currentSatScale.toFixed(2)})`;
            ctx2d.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
          }
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScrollAndSize);
      window.removeEventListener('resize', updateScrollAndSize);
    };
  });
</script>

<section
  bind:this={sectionRef}
  id="audi-showroom"
  class="relative h-[440vh] w-full bg-[#070709] border-t border-hair"
  aria-label="Audi R8 V10 Interactive Scroll Showroom"
>
  <div class="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between select-none">
    <!-- Canvas Frame Sequence + WebGL2 Paint Shader -->
    <div class="absolute inset-0 z-0">
      <canvas
        bind:this={canvasRef}
        width="1920"
        height="1080"
        class="w-full h-full object-cover object-center transition-opacity duration-700 {isReady ? 'opacity-100' : 'opacity-0'}"
      ></canvas>

      <!-- Vignette & Editorial Gradients -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(circle at 55% 50%, rgba(0,0,0,0) 32%, rgba(5,5,8,0.82) 100%), linear-gradient(90deg, rgba(6,6,9,0.88) 0%, rgba(6,6,9,0.45) 36%, rgba(6,6,9,0) 65%), linear-gradient(0deg, rgba(6,6,9,0.94) 0%, rgba(6,6,9,0) 28%);"
      ></div>

      <!-- Dynamic Ambient Underglow reacting to current paint color -->
      <div
        class="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[65vw] h-[220px] rounded-full blur-[110px] opacity-30 pointer-events-none transition-colors duration-500"
        style="background: {targetPaint.swatch};"
      ></div>
    </div>

    <!-- Top Showroom Telemetry Bar -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 px-[clamp(18px,2.6vw,44px)] pt-6">
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest border border-hair bg-black/55 backdrop-blur-md"
          style="color: {targetPaint.accent};"
        >
          <span class="w-2 h-2 rounded-full animate-pulse" style="background: {targetPaint.swatch};"></span>
          Audi R8 V10 · Scroll Lab
        </span>
        <span class="hidden sm:inline-block text-xs text-white/50 font-mono">
          FRAME {String(currentFrameNumber).padStart(3, '0')} / {String(TOTAL_FRAMES).padStart(3, '0')} · {playbackRateMultiplier}x
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Mode Toggle: Autoplay vs Manual Scroll Scrubbing -->
        <div class="inline-flex p-1 rounded-full border border-hair bg-black/60 backdrop-blur-md text-xs">
          <button
            type="button"
            onclick={() => (playbackMode = 'autoplay')}
            class="px-3 py-1 rounded-full font-medium transition cursor-pointer {playbackMode === 'autoplay'
              ? 'bg-white text-black'
              : 'text-white/70 hover:text-white'}"
          >
            ▶ Auto-Play + Scroll
          </button>
          <button
            type="button"
            onclick={() => (playbackMode = 'scrub')}
            class="px-3 py-1 rounded-full font-medium transition cursor-pointer {playbackMode === 'scrub'
              ? 'bg-white text-black'
              : 'text-white/70 hover:text-white'}"
          >
            ↕ Solo Scroll
          </button>
        </div>

        <button
          type="button"
          onclick={() => (showTechSpecs = !showTechSpecs)}
          class="px-3.5 py-1.5 rounded-full text-xs font-medium border border-hair bg-white/8 hover:bg-white/15 text-white/90 backdrop-blur-md transition cursor-pointer"
        >
          {showTechSpecs ? 'Cerrar Guía Técnica' : '¿Cómo funciona?'}
        </button>
      </div>
    </div>

    <!-- Center Grid: Stage Storytelling (Left) + Live Telemetry Tachometer (Right) -->
    <div class="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center px-[clamp(18px,2.6vw,44px)] gap-8 pointer-events-none">
      <!-- Stage Narrative Card -->
      <div class="max-w-[460px] pointer-events-auto">
        {#key activeStage.id}
          <div
            in:fly={{ y: 18, duration: 420 }}
            class="p-6 sm:p-7 rounded-3xl border border-hair bg-[rgba(10,10,14,0.68)] backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            <div class="flex items-center justify-between gap-2 mb-3">
              <span
                class="text-[11px] font-semibold tracking-[0.14em] uppercase"
                style="color: {targetPaint.accent};"
              >
                {activeStage.badge}
              </span>
              <span class="text-xs font-mono text-white/40">{activeStage.id} / 04</span>
            </div>

            <h2 class="font-display text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold leading-[1.02] tracking-tight text-white">
              {activeStage.title}
            </h2>

            <p class="mt-3.5 text-[14px] leading-relaxed text-white/70">
              {activeStage.subtitle}
            </p>

            <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span class="block text-[11px] uppercase tracking-wider text-white/45">
                  {activeStage.metricLabel}
                </span>
                <strong class="font-display text-xl font-semibold text-white">
                  {activeStage.metricValue}
                </strong>
              </div>

              <div class="text-right">
                <span class="block text-[11px] uppercase tracking-wider text-white/45">
                  Pintura Activa ({targetPaint.code})
                </span>
                <strong class="font-display text-sm font-medium text-white/90 flex items-center justify-end gap-2 mt-0.5">
                  <i class="w-3 h-3 rounded-full inline-block border border-white/40" style="background: {targetPaint.swatch};"></i>
                  {targetPaint.name}
                </strong>
              </div>
            </div>
          </div>
        {/key}
      </div>

      <!-- Right HUD: Live Speedometer & Scroll Physics Telemetry -->
      <aside class="hidden lg:flex flex-col gap-4 w-[240px] p-5 rounded-2xl border border-hair bg-black/55 backdrop-blur-xl pointer-events-auto">
        <div>
          <div class="flex items-center justify-between text-[11px] text-white/45 uppercase tracking-wider">
            <span>Telemetría Scroll</span>
            <span class="font-mono text-white/70">{Math.round(smoothProgress * 100)}%</span>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="font-display text-4xl font-semibold tracking-tight text-white tabular-nums">
              {speedKmh}
            </span>
            <span class="text-xs font-mono text-white/50">km/h</span>
          </div>
          <!-- Progress bar -->
          <div class="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full transition-colors duration-300"
              style="width: {Math.max(3, smoothProgress * 100)}%; background: {targetPaint.swatch};"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div class="p-2.5 rounded-xl bg-white/4">
            <span class="block text-[10px] text-white/45 uppercase">Velocidad Video</span>
            <strong class="font-mono text-sm text-white">
              {playbackRateMultiplier}x
            </strong>
          </div>
          <div class="p-2.5 rounded-xl bg-white/4">
            <span class="block text-[10px] text-white/45 uppercase">Matiz HSV</span>
            <strong class="font-mono text-sm text-white">
              +{Math.round(currentHueDeg)}°
            </strong>
          </div>
        </div>

        <!-- Stage Stepper -->
        <div class="grid grid-cols-4 gap-1.5 pt-1">
          {#each stages as s, idx}
            <div
              class="h-1 rounded-full transition-all duration-300 {idx <= activeStageIndex ? 'opacity-100' : 'opacity-25 bg-white'}"
              style={idx <= activeStageIndex ? `background: ${targetPaint.swatch}` : ''}
            ></div>
          {/each}
        </div>
      </aside>
    </div>

    <!-- Bottom Bar: Interactive Audi Exclusive Paint Configurator -->
    <div class="relative z-10 px-[clamp(18px,2.6vw,44px)] pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2 p-2 rounded-2xl border border-hair bg-black/70 backdrop-blur-xl">
        <button
          type="button"
          onclick={() => (selectedPaintMode = 'auto')}
          class="px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer {selectedPaintMode === 'auto'
            ? 'bg-white text-black shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/8'}"
        >
          Auto Scroll Color
        </button>

        <div class="h-5 w-px bg-white/15 mx-1 hidden sm:block"></div>

        {#each paintPresets as preset}
          <button
            type="button"
            onclick={() => (selectedPaintMode = preset.id)}
            class="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border {selectedPaintMode === preset.id
              ? 'border-white/60 bg-white/15 text-white'
              : 'border-transparent text-white/65 hover:text-white hover:bg-white/8'}"
            title="{preset.name} ({preset.code})"
          >
            <span
              class="w-4 h-4 rounded-full border border-white/40 shadow-inner shrink-0 transition-transform group-hover:scale-110"
              style="background: {preset.swatch};"
            ></span>
            <span class="hidden md:inline">{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
          </button>
        {/each}
      </div>

      <div class="text-xs text-white/50 hidden xl:flex items-center gap-2">
        <span>
          {playbackMode === 'autoplay'
            ? 'El Audi R8 avanza solo (24 FPS) y cambia de color al hacer scroll'
            : 'Haz scroll para controlar los 240 cuadros en alta definición'}
        </span>
        {@render ArrowRight({ class: 'w-4 h-4 rotate-90 text-white/70' })}
      </div>
    </div>

    <!-- Modal / Drawer de Requerimientos Técnicos -->
    {#if showTechSpecs}
      <div
        transition:fade={{ duration: 200 }}
        class="absolute inset-0 z-30 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
      >
        <div class="max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-hair bg-[#0d0d12] text-white shadow-2xl overflow-y-auto max-h-[88svh]">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span class="text-xs uppercase tracking-widest text-flame-lit font-semibold">Arquitectura de Producción</span>
              <h3 class="font-display text-2xl font-semibold mt-0.5">Audi R8 V10 · 240 Frames HQ + FidelityFX CAS</h3>
            </div>
            <button
              type="button"
              onclick={() => (showTechSpecs = false)}
              class="px-3 py-1.5 rounded-lg border border-hair text-xs hover:bg-white/10 cursor-pointer"
            >
              Cerrar ✕
            </button>
          </div>

          <div class="mt-5 space-y-4 text-sm text-white/80 leading-relaxed">
            <div class="p-4 rounded-2xl bg-white/4 border border-white/8">
              <strong class="text-white block mb-1">1. 240 Fotogramas a 24 FPS Nativos + Calidad 95%</strong>
              Extrajimos el 100% de los cuadros originales del video (240 frames) con <code>-q:v 95</code> y filtros <code>deband</code> + <code>cas=0.45</code> (Contrast Adaptive Sharpening) de FFmpeg.
            </div>

            <div class="p-4 rounded-2xl bg-white/4 border border-white/8">
              <strong class="text-white block mb-1">2. Canvas Retina/HiDPI + Unsharp Mask en WebGL2</strong>
              El <code>&lt;canvas&gt;</code> ahora se dimensiona a la resolución nativa de tu monitor (<code>clientWidth * devicePixelRatio</code>) y aplica un filtro de nitidez de 5 muestras directamente en el Fragment Shader.
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>
