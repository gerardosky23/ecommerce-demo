# ⚡ Islas Interactivas en Svelte 5 (Runes)

Las islas interactivas encapsulan toda la lógica de cliente que requiere estado dinámico, manteniendo el resto del sitio web en HTML estático ultraligero (Zero-JS baseline de Astro).

---

## 1. Carrusel Embla con Pestañas (`EmblaCarouselIsland.svelte`)

Utiliza `embla-carousel-svelte` con soporte de loop, tabs de categoría y navegación por puntos.

```svelte
<script lang="ts">
  import emblaCarousel from 'embla-carousel-svelte';

  interface Item {
    id: string;
    title: string;
    category: string;
    desc: string;
    icon: string;
  }

  let { items = [] } = $props<{ items: Item[] }>();

  let activeCategory = $state('todas');
  let selectedIndex = $state(0);
  let emblaApi = $state<any>(null);

  let filteredItems = $derived(
    activeCategory === 'todas'
      ? items
      : items.filter(it => it.category.toLowerCase() === activeCategory.toLowerCase())
  );

  function onInit(event: CustomEvent<any>) {
    emblaApi = event.detail;
    emblaApi.on('select', () => {
      selectedIndex = emblaApi.selectedScrollSnap();
    });
  }

  function scrollPrev() {
    if (emblaApi) emblaApi.scrollPrev();
  }

  function scrollNext() {
    if (emblaApi) emblaApi.scrollNext();
  }
</script>

<div class="space-y-8">
  <!-- Category Filter Pills -->
  <div class="flex items-center justify-center gap-2 flex-wrap">
    {#each ['todas', 'operaciones', 'finanzas', 'comercial'] as cat}
      <button
        type="button"
        onclick={() => (activeCategory = cat)}
        class="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all {activeCategory === cat ? 'bg-brand-primary text-slate-900 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
      >
        {cat}
      </button>
    {/each}
  </div>

  <!-- Embla Viewport Container -->
  <div class="overflow-hidden cursor-grab active:cursor-grabbing" use:emblaCarousel={{ loop: true, align: 'start' }} onemblaInit={onInit}>
    <div class="flex gap-6">
      {#each filteredItems as item (item.id)}
        <div class="flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31%] min-w-0 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-brand-primary">
            {@html item.icon}
          </div>
          <h4 class="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
          <p class="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Navigation Arrows -->
  <div class="flex items-center justify-center gap-4">
    <button onclick={scrollPrev} class="p-2.5 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors" aria-label="Anterior">←</button>
    <button onclick={scrollNext} class="p-2.5 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors" aria-label="Siguiente">→</button>
  </div>
</div>
```

---

## 2. Acordeones FAQ con Cero Layout Shift (`FaqAccordion.svelte`)

```svelte
<script lang="ts">
  interface FaqItem {
    question: string;
    answer: string;
  }

  let { items = [] } = $props<{ items: FaqItem[] }>();
  let openIndex = $state<number | null>(0);

  function toggle(idx: number) {
    openIndex = openIndex === idx ? null : idx;
  }
</script>

<div class="space-y-4 max-w-3xl mx-auto">
  {#each items as item, idx}
    <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all">
      <button
        type="button"
        onclick={() => toggle(idx)}
        class="w-full px-6 py-5 flex items-center justify-between text-left text-base font-bold text-slate-900 hover:text-brand-primary transition-colors"
        aria-expanded={openIndex === idx}
      >
        <span>{item.question}</span>
        <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs transition-transform duration-200 {openIndex === idx ? 'rotate-180 bg-brand-primary/10 text-brand-primary' : ''}">
          ▼
        </span>
      </button>

      {#if openIndex === idx}
        <div class="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
          {item.answer}
        </div>
      {/if}
    </div>
  {/each}
</div>
```

---

## 3. Calculadora de Cotización Reactiva (`QuoteCalculator.svelte`)

```svelte
<script lang="ts">
  let users = $state(5);
  let basePrice = $state(49);
  let addOnCloud = $state(true);

  let totalMonthly = $derived(
    users * basePrice + (addOnCloud ? 50 : 0)
  );
</script>

<div class="p-8 rounded-3xl bg-slate-900 text-white max-w-xl mx-auto shadow-2xl border border-slate-800 space-y-6">
  <h3 class="text-xl font-bold">Calcula tu presupuesto estimado</h3>

  <div>
    <div class="flex justify-between text-sm mb-2">
      <span class="text-white/70">Número de usuarios</span>
      <span class="font-bold text-brand-primary">{users} usuarios</span>
    </div>
    <input
      type="range"
      min="1"
      max="50"
      bind:value={users}
      class="w-full accent-brand-primary cursor-pointer"
    />
  </div>

  <label class="flex items-center gap-3 cursor-pointer">
    <input type="checkbox" bind:checked={addOnCloud} class="w-4 h-4 accent-brand-primary rounded" />
    <span class="text-sm text-white/80">Incluir servidor privado optimizado (+ S/ 50/mes)</span>
  </label>

  <div class="pt-6 border-t border-white/10 flex items-center justify-between">
    <div>
      <div class="text-xs text-white/60 uppercase font-semibold">Total estimado</div>
      <div class="text-3xl font-extrabold text-white">S/ {totalMonthly}<span class="text-sm font-normal text-white/60">/mes</span></div>
    </div>
    <a
      href="/contacto?users={users}&plan=custom"
      class="px-5 py-2.5 rounded-xl bg-brand-primary text-slate-900 font-bold text-xs uppercase"
    >
      Contratar Plan
    </a>
  </div>
</div>
```

---

## 4. Formulario de Contacto Seguro (`ContactFormIsland.svelte`)

Protegido con **Honeypot anti-spam** y preparado para conectarse al proxy de webhooks del Backoffice:

```svelte
<script lang="ts">
  let { siteId = 'demo-site', backofficeUrl = 'http://localhost:8090' } = $props<{ siteId?: string; backofficeUrl?: string }>();

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let message = $state('');
  let honeypot = $state(''); // Campo oculto trampa para bots

  let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
  let statusMessage = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (honeypot) return; // Si el bot llenó el honeypot, salir silenciosamente

    status = 'submitting';

    try {
      const endpoint = `${backofficeUrl}/api/v1/submit/${encodeURIComponent(siteId)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      status = 'success';
      statusMessage = '¡Mensaje recibido con éxito! Un consultor se contactará contigo en breve.';
      name = '';
      email = '';
      phone = '';
      message = '';
    } catch (err) {
      status = 'error';
      statusMessage = 'Hubo un inconveniente al enviar el formulario. Por favor comunícate directamente por WhatsApp.';
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4 max-w-lg mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg">
  <!-- Honeypot oculto -->
  <input type="text" name="b_url" bind:value={honeypot} class="hidden" tabindex="-1" autocomplete="off" />

  <div>
    <label for="f-name" class="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
    <input id="f-name" type="text" required bind:value={name} class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none" />
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label for="f-email" class="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
      <input id="f-email" type="email" required bind:value={email} class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none" />
    </div>
    <div>
      <label for="f-phone" class="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono Móvil</label>
      <input id="f-phone" type="tel" required bind:value={phone} class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none" />
    </div>
  </div>

  <div>
    <label for="f-msg" class="block text-xs font-bold text-slate-700 uppercase mb-1">Mensaje o Consulta</label>
    <textarea id="f-msg" rows="4" required bind:value={message} class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"></textarea>
  </div>

  {#if status === 'success'}
    <div class="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
      {statusMessage}
    </div>
  {/if}

  {#if status === 'error'}
    <div class="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
      {statusMessage}
    </div>
  {/if}

  <button
    type="submit"
    disabled={status === 'submitting'}
    class="w-full py-3.5 rounded-xl bg-brand-primary text-slate-900 font-extrabold text-sm uppercase tracking-wider hover:brightness-105 transition shadow-md disabled:opacity-60"
  >
    {status === 'submitting' ? 'Enviando consulta...' : 'Enviar Mensaje'}
  </button>
</form>
```
