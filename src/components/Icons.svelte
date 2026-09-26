<script module lang="ts">
  // Biblioteca visual de íconos y emblemas Audi Sport con Svelte 5 Snippets
  export {
    AudiRings,
    AudiSportBadge,
    Logo,
    Globe,
    Chevron,
    ArrowRight,
    MenuIcon,
    Close,
    GaugeIcon,
    BoltIcon,
    ShieldCarbon,
    SparkIcon,
    CheckIcon,
    PlayIcon,
    SlidersIcon,
    MapPinIcon,
  };
</script>

{#snippet AudiRings(props: any)}
  <svg viewBox="0 0 112 40" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true" {...props}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="44.6" cy="20" r="14" />
    <circle cx="67.4" cy="20" r="14" />
    <circle cx="90" cy="20" r="14" />
  </svg>
{/snippet}

{#snippet AudiSportBadge(props: any)}
  <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" {...props}>
    <polygon points="8,2 22,2 15,22 1,22" fill="#f50537" />
    <polygon points="20,2 27,2 20,22 13,22" fill="currentColor" fill-opacity="0.18" />
  </svg>
{/snippet}

{#snippet Logo(props: any)}
  <svg viewBox="0 0 112 40" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true" {...props}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="44.6" cy="20" r="14" />
    <circle cx="67.4" cy="20" r="14" />
    <circle cx="90" cy="20" r="14" />
  </svg>
{/snippet}

{#snippet Globe(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.7 5.7 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.7-3.7-9S9.5 5.6 12 3Z" />
  </svg>
{/snippet}

{#snippet Chevron(props: any)}
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" {...props}>
    <path d="m3 4.5 3 3 3-3" />
  </svg>
{/snippet}

{#snippet ArrowRight(props: any)}
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
{/snippet}

{#snippet MenuIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" {...props}>
    <path d="M4 8h16M4 16h16" />
  </svg>
{/snippet}

{#snippet Close(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
{/snippet}

{#snippet GaugeIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M12 14 16.5 9.5" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
{/snippet}

{#snippet BoltIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
{/snippet}

{#snippet ShieldCarbon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M12 2 4 5.5v6c0 5.2 3.4 9.9 8 11.5 4.6-1.6 8-6.3 8-11.5v-6L12 2Z" />
    <path d="m8.5 12 2.3 2.3 4.7-4.8" />
  </svg>
{/snippet}

{#snippet SparkIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
{/snippet}

{#snippet CheckIcon(props: any)}
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
  </svg>
{/snippet}

{#snippet PlayIcon(props: any)}
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6.5 4.5v11l9-5.5-9-5.5Z" />
  </svg>
{/snippet}

{#snippet SlidersIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2" fill="#07080c" />
    <circle cx="15" cy="12" r="2" fill="#07080c" />
    <circle cx="10" cy="18" r="2" fill="#07080c" />
  </svg>
{/snippet}

{#snippet MapPinIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...props}>
    <path d="M12 21s-7-5.8-7-11a7 7 0 1 1 14 0c0 5.2-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
{/snippet}
