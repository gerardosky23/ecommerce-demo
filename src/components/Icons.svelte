<script module lang="ts">
  // Biblioteca visual de íconos vectoriales para Flexone con Svelte 5 Snippets
  export {
    FlexoneLogo,
    OdooPartnerBadge,
    ArrowRight,
    ChevronDown,
    MenuIcon,
    CloseIcon,
    CheckIcon,
    WhatsAppIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    ShieldCheck,
    UsersIcon,
    BuildingIcon,
    CpuIcon,
    BarChartIcon,
    ShoppingCartIcon,
    LayersIcon,
    ClockIcon,
    AwardIcon,
    RocketIcon,
    CalculatorIcon,
    FileTextIcon,
    CalendarIcon
  };
</script>

{#snippet FlexoneLogo(props: any)}
  <div class="flex items-center gap-3 select-none" {...props}>
    <svg viewBox="0 0 40 40" class="w-10 h-10 flex-shrink-0" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06B6D4" />
          <stop offset="50%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <path d="M12 11h16v4.5H18v4h8v4.5h-8V29h-6V11z" fill="#ffffff" />
      <circle cx="28" cy="27" r="3" fill="#38BDF8" />
    </svg>
    <div class="flex flex-col">
      <span class="font-display font-extrabold text-xl tracking-tight text-white leading-none">flexone</span>
      <span class="text-[10px] uppercase font-semibold tracking-wider text-brand-cyan">Odoo Silver Partner</span>
    </div>
  </div>
{/snippet}

{#snippet OdooPartnerBadge(props: any)}
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/15 border border-brand-purple/30 text-xs font-semibold text-purple-300" {...props}>
    <span class="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>
    <span>Odoo Official Partner Perú</span>
  </div>
{/snippet}

{#snippet ArrowRight(props: any)}
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true" {...props}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
{/snippet}

{#snippet ChevronDown(props: any)}
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true" {...props}>
    <path d="m5 7.5 5 5 5-5" />
  </svg>
{/snippet}

{#snippet MenuIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true" {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
{/snippet}

{#snippet CloseIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true" {...props}>
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
{/snippet}

{#snippet CheckIcon(props: any)}
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-emerald-400" aria-hidden="true" {...props}>
    <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
  </svg>
{/snippet}

{#snippet WhatsAppIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true" {...props}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.4 1.34-1.92 1.42-.48.08-1.07.12-3.15-.75-2.22-.92-3.66-3.18-3.77-3.33-.11-.15-.9-1.2-1.01-1.6-.11-.4-.01-.76.12-.97.13-.2.29-.42.43-.58.14-.17.18-.28.27-.47.09-.18.05-.35-.02-.49-.08-.14-.73-1.76-1-2.41-.27-.63-.54-.54-.74-.55l-.63-.01c-.22 0-.57.08-.87.41-.3.33-1.15 1.13-1.15 2.75 0 1.62 1.18 3.19 1.34 3.41.17.22 2.32 3.55 5.63 4.98 2.34 1.01 3.25.99 3.86.91.73-.09 1.66-.68 1.9-1.33.24-.65.24-1.21.17-1.33-.07-.12-.25-.19-.49-.31z"/>
  </svg>
{/snippet}

{#snippet MailIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
{/snippet}

{#snippet MapPinIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true" {...props}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
{/snippet}

{#snippet PhoneIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
{/snippet}

{#snippet ShieldCheck(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-brand-cyan" aria-hidden="true" {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
{/snippet}

{#snippet UsersIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-emerald-400" aria-hidden="true" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
{/snippet}

{#snippet BuildingIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-purple-400" aria-hidden="true" {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
{/snippet}

{#snippet CpuIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-brand-accent" aria-hidden="true" {...props}>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
{/snippet}

{#snippet BarChartIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-sky-400" aria-hidden="true" {...props}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
{/snippet}

{#snippet ShoppingCartIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-amber-400" aria-hidden="true" {...props}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
{/snippet}

{#snippet LayersIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-400" aria-hidden="true" {...props}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
{/snippet}

{#snippet ClockIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-brand-cyan" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
{/snippet}

{#snippet AwardIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-yellow-400" aria-hidden="true" {...props}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
{/snippet}

{#snippet RocketIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-orange-400" aria-hidden="true" {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
{/snippet}

{#snippet CalculatorIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-emerald-400" aria-hidden="true" {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
  </svg>
{/snippet}

{#snippet FileTextIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true" {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8M16 13H8M16 17H8" />
  </svg>
{/snippet}

{#snippet CalendarIcon(props: any)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
{/snippet}
