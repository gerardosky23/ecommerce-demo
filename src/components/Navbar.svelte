<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { AudiRings, AudiSportBadge, MenuIcon, Close, ArrowRight } from './Icons.svelte';

  const links = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Showroom 360°', href: '#audi-showroom' },
    { label: 'Ingeniería V10', href: '#ingenieria' },
    { label: 'Drive Select', href: '#drive-select' },
    { label: 'Comparador R8', href: '#comparador' },
  ];

  let open = $state(false);
  let scrolled = $state(false);
  let activeSection = $state('#hero');
  let prefersReducedMotion = $state(false);

  // Magnetic button spring physics (Svelte 5 svelte/motion)
  const btnOffset = new Spring({ x: 0, y: 0 }, { stiffness: 0.18, damping: 0.45 });

  function handleMagneticMove(e: MouseEvent) {
    if (prefersReducedMotion) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    btnOffset.set({ x: dx * 0.28, y: dy * 0.35 });
  }

  function resetMagnetic() {
    btnOffset.set({ x: 0, y: 0 });
  }

  $effect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mq.matches;

    const onScroll = () => {
      scrolled = window.scrollY > 36;
      const sections = ['#hero', '#audi-showroom', '#ingenieria', '#drive-select', '#comparador', '#reserva'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.querySelector(sections[i]);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.38) {
          activeSection = sections[i];
          break;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<header
  class="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-[clamp(16px,2.4vw,42px)] transition-all duration-500 {scrolled
    ? 'py-3 bg-[rgba(5,6,10,0.84)] backdrop-blur-2xl border-b border-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.65)]'
    : 'py-5 bg-gradient-to-b from-black/80 via-black/35 to-transparent'}"
>
  <a
    class="group inline-flex items-center gap-3 font-display text-white focus:outline-none"
    href="#hero"
    aria-label="Audi Sport R8 V10 Inicio"
  >
    {@render AudiRings({
      class: 'w-[62px] h-[22px] text-white transition-transform duration-500 group-hover:scale-105',
    })}
    <span class="h-4 w-px bg-white/20 hidden sm:inline-block"></span>
    <span class="inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight">
      {@render AudiSportBadge({ class: 'w-4 h-3.5' })}
      <span>R8 <span class="text-white/55 font-normal">V10 Performance</span></span>
    </span>
  </a>

  <nav
    class="hidden lg:block p-1.5 border border-white/12 rounded-full bg-[rgba(10,12,18,0.65)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    aria-label="Navegación Principal Audi Sport"
  >
    <ul class="flex items-center gap-1">
      {#each links as link}
        {@const isActive = activeSection === link.href}
        <li>
          <a
            href={link.href}
            class="relative inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 {isActive
              ? 'text-white bg-white/14 shadow-[0_0_20px_rgba(245,5,55,0.25)]'
              : 'text-white/65 hover:text-white hover:bg-white/6'}"
          >
            {#if isActive}
              <span class="w-1.5 h-1.5 rounded-full bg-audi-red mr-2 animate-pulse"></span>
            {/if}
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="flex items-center gap-3">
    <a
      href="#reserva"
      onmousemove={handleMagneticMove}
      onmouseleave={resetMagnetic}
      style="transform: translate3d({btnOffset.current.x}px, {btnOffset.current.y}px, 0);"
      class="hidden sm:inline-flex items-center gap-2.5 py-2.5 px-5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-audi-red to-audi-red-lit text-white shadow-[0_10px_30px_rgba(245,5,55,0.4)] hover:shadow-[0_14px_38px_rgba(245,5,55,0.65)] transition-shadow"
    >
      <span>Reservar Test Drive</span>
      {@render ArrowRight({ class: 'w-4 h-4' })}
    </a>

    <button
      class="lg:hidden grid place-items-center w-10 h-10 border border-hair rounded-xl bg-black/60 backdrop-blur-md text-white cursor-pointer"
      type="button"
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      {#if open}
        {@render Close({ class: 'w-5 h-5' })}
      {:else}
        {@render MenuIcon({ class: 'w-5 h-5' })}
      {/if}
    </button>
  </div>

  {#if open}
    <div class="fixed inset-x-3 top-[68px] p-5 border border-hair rounded-2xl bg-[rgba(7,8,13,0.96)] backdrop-blur-2xl shadow-2xl lg:hidden">
      <ul class="grid gap-1.5 mb-4">
        {#each links as link}
          <li>
            <a
              href={link.href}
              class="flex items-center justify-between p-3 rounded-xl text-base text-white/85 hover:bg-white/8"
              onclick={() => (open = false)}
            >
              <span>{link.label}</span>
              {@render ArrowRight({ class: 'w-4 h-4 opacity-50' })}
            </a>
          </li>
        {/each}
      </ul>
      <a
        class="btn btn--flame w-full justify-center py-3 px-5 text-sm"
        href="#reserva"
        onclick={() => (open = false)}
      >
        Reservar Test Drive VIP
      </a>
    </div>
  {/if}
</header>
