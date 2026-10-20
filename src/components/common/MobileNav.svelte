<script lang="ts">
  let isOpen = $state(false);
  let openSection = $state<string | null>(null);

  const sections = [
    {
      id: 'soluciones',
      title: 'Soluciones',
      links: [
        { name: 'Finanzas y contabilidad', href: '/funcionalidades/finanzas' },
        { name: 'Tesorería', href: '/funcionalidades/tesoreria' },
        { name: 'Ventas y CRM', href: '/funcionalidades/ventas' },
        { name: 'Compras e inventario', href: '/funcionalidades/compras-inventario' },
        { name: 'Manufactura (MRP)', href: '/funcionalidades/manufactura' },
        { name: 'RR. HH. y planillas', href: '/planiflex' },
        { name: 'Sitio web y e-commerce', href: '/funcionalidades/sitio-web' },
        { name: 'Servicios y proyectos', href: '/funcionalidades/servicios-proyectos' },
      ]
    },
    {
      id: 'localizacion',
      title: 'Localización Perú',
      links: [
        { name: 'Contabilidad que cuadra', href: '/localizacion/contabilidad' },
        { name: 'Facturación electrónica', href: '/localizacion/facturacion-electronica' },
        { name: 'Detracciones y retenciones', href: '/localizacion/detracciones-retenciones' },
        { name: 'Kardex valorizado', href: '/localizacion/kardex-valorizado' },
        { name: 'Importaciones', href: '/localizacion/importaciones' },
        { name: 'Planillas (Planiflex)', href: '/planiflex' },
      ]
    },
    {
      id: 'servicios',
      title: 'Servicios',
      links: [
        { name: 'Consultoría e Implementación', href: '/servicios/consultoria' },
        { name: 'Desarrollo a medida', href: '/servicios/desarrollo' },
        { name: 'Capacitaciones', href: '/servicios/capacitaciones' },
        { name: 'Soporte y mesa de ayuda', href: '/servicios/soporte' },
      ]
    },
    {
      id: 'recursos',
      title: 'Recursos',
      links: [
        { name: 'Casos de éxito', href: '/casos' },
        { name: 'Blog', href: '/blog' },
        { name: 'Financiamiento Pro Innóvate', href: '/#proinnovate' },
        { name: 'Preguntas frecuentes', href: '/#preguntas' },
      ]
    }
  ];

  function toggleSection(id: string) {
    openSection = openSection === id ? null : id;
  }
</script>

<div class="lg:hidden flex items-center">
  <button
    type="button"
    class="p-2 text-white/90 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
    aria-label="Abrir menú de navegación"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {#if isOpen}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      {:else}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      {/if}
    </svg>
  </button>

  {#if isOpen}
    <div
      class="fixed inset-0 top-[120px] bg-black/70 backdrop-blur-md z-40"
      onclick={() => (isOpen = false)}
      role="presentation"
    ></div>

    <aside
      class="fixed top-[120px] right-0 bottom-0 w-80 max-w-[85vw] bg-[#161618] border-l border-white/10 p-6 overflow-y-auto z-50 flex flex-col justify-between"
      aria-label="Menú móvil"
    >
      <div class="space-y-4">
        <!-- Direct links -->
        <a
          href="/"
          class="block py-2 text-sm font-semibold text-white hover:text-brand-cyan border-b border-white/5"
          onclick={() => (isOpen = false)}
        >
          Inicio
        </a>
        <a
          href="/industrias"
          class="block py-2 text-sm font-semibold text-white hover:text-brand-cyan border-b border-white/5"
          onclick={() => (isOpen = false)}
        >
          Industrias
        </a>

        <!-- Accordion sections -->
        {#each sections as sec (sec.id)}
          <div class="border-b border-white/5 pb-2">
            <button
              type="button"
              class="w-full flex items-center justify-between py-2 text-sm font-semibold text-white hover:text-brand-cyan text-left"
              onclick={() => toggleSection(sec.id)}
            >
              <span>{sec.title}</span>
              <svg
                class="w-4 h-4 transition-transform duration-200 {openSection === sec.id ? 'rotate-180 text-brand-cyan' : 'text-white/40'}"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            {#if openSection === sec.id}
              <div class="pl-3 py-2 space-y-2">
                {#each sec.links as link (link.href)}
                  <a
                    href={link.href}
                    class="block text-xs text-white/70 hover:text-brand-cyan py-1"
                    onclick={() => (isOpen = false)}
                  >
                    {link.name}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Action button -->
      <div class="pt-6 border-t border-white/10 space-y-3">
        <a
          href="/contacto"
          class="w-full py-3 rounded bg-brand-cyan text-[#06222b] text-center font-bold text-xs uppercase tracking-wider block"
          onclick={() => (isOpen = false)}
        >
          Hablemos
        </a>
        <a
          href="https://wa.me/51955479055"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-2.5 rounded bg-[#25d366]/10 text-[#25d366] text-center font-medium text-xs block"
        >
          WhatsApp: +51 955 479 055
        </a>
      </div>
    </aside>
  {/if}
</div>
