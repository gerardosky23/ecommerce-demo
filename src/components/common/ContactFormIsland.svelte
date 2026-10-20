<script lang="ts">
  import { WhatsAppIcon, ArrowRight } from '../Icons.svelte';

  let fullName = $state('');
  let email = $state('');
  let phone = $state('');
  let company = $state('');
  let employees = $state('1-10');
  let selectedNeed = $state('implementacion');
  let message = $state('');
  let isSubmitting = $state(false);
  let isSubmitted = $state(false);
  let errorMsg = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      errorMsg = 'Por favor completa tu nombre, correo y teléfono.';
      return;
    }
    errorMsg = '';
    isSubmitting = true;

    // Asynchronously relay form payload to Backoffice webhook proxy
    fetch('http://localhost:8090/api/v1/submit/flexone-pe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_name: 'contacto_web',
        data: {
          fullName,
          email,
          phone,
          company,
          employees,
          selectedNeed,
          message
        }
      })
    }).catch(err => console.warn('[Flexone] Backoffice relay notice:', err));

    setTimeout(() => {
      isSubmitting = false;
      isSubmitted = true;
    }, 500);
  }

  let whatsappLink = $derived.by(() => {
    const text = `Hola Flexone, soy ${fullName || 'un cliente'} de la empresa ${company || 'en Perú'}. Deseo consultar por: ${selectedNeed} con Odoo ERP (${employees} empleados). Correo: ${email}, Tel: ${phone}. ${message ? `Mensaje: ${message}` : ''}`;
    return `https://wa.me/51955479055?text=${encodeURIComponent(text)}`;
  });
</script>

<div class="p-6 sm:p-10 rounded-2xl bg-white border border-brand-border shadow-lg relative">
  {#if isSubmitted}
    <div class="py-12 text-center space-y-5 animate-in fade-in duration-300">
      <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
        ✓
      </div>

      <h3 class="font-normal text-2xl text-brand-dark">
        ¡Solicitud recibida con éxito!
      </h3>

      <p class="text-sm text-brand-muted max-w-md mx-auto leading-relaxed font-light">
        Gracias por contactar a <strong>Flexone</strong>. Uno de nuestros consultores de soluciones Odoo en Lima revisará tu requerimiento y se comunicará contigo en menos de 2 horas hábiles.
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          class="px-6 py-3 rounded bg-[#25d366] text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {@render WhatsAppIcon({ class: "w-4 h-4" })}
          <span>Acelerar respuesta por WhatsApp</span>
        </a>

        <button
          type="button"
          class="px-6 py-3 rounded border border-neutral-300 text-brand-dark text-xs font-medium hover:bg-neutral-50 transition-colors"
          onclick={() => isSubmitted = false}
        >
          <span>Enviar otra consulta</span>
        </button>
      </div>
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if errorMsg}
        <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      {/if}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-xs font-medium text-brand-dark mb-1">
            Nombre y Apellidos *
          </label>
          <input
            id="name"
            type="text"
            required
            bind:value={fullName}
            placeholder="Ej: Carlos Mendoza"
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label for="company" class="block text-xs font-medium text-brand-dark mb-1">
            Empresa / RUC
          </label>
          <input
            id="company"
            type="text"
            bind:value={company}
            placeholder="Ej: Distribuidora del Sur S.A.C."
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="email" class="block text-xs font-medium text-brand-dark mb-1">
            Correo Corporativo *
          </label>
          <input
            id="email"
            type="email"
            required
            bind:value={email}
            placeholder="carlos@tuempresa.pe"
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label for="phone" class="block text-xs font-medium text-brand-dark mb-1">
            Teléfono / WhatsApp *
          </label>
          <input
            id="phone"
            type="tel"
            required
            bind:value={phone}
            placeholder="+51 987 654 321"
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="need" class="block text-xs font-medium text-brand-dark mb-1">
            Tipo de Requerimiento
          </label>
          <select
            id="need"
            bind:value={selectedNeed}
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          >
            <option value="implementacion">Nueva Implementación Odoo ERP</option>
            <option value="sunat">Localización SUNAT & Facturación Electrónica</option>
            <option value="planiflex">Planiflex: Planillas y RRHH Perú</option>
            <option value="migracion">Migración / Rescate de Proyecto Odoo</option>
            <option value="soporte">Soporte Técnico & Mantenimiento</option>
            <option value="proinnovate">Postulación a Fondos ProInnóvate</option>
          </select>
        </div>

        <div>
          <label for="employees" class="block text-xs font-medium text-brand-dark mb-1">
            Número de Colaboradores
          </label>
          <select
            id="employees"
            bind:value={employees}
            class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors"
          >
            <option value="1-10">1 a 10 colaboradores</option>
            <option value="11-50">11 a 50 colaboradores</option>
            <option value="51-200">51 a 200 colaboradores</option>
            <option value="200+">Más de 200 colaboradores</option>
          </select>
        </div>
      </div>

      <div>
        <label for="message" class="block text-xs font-medium text-brand-dark mb-1">
          Detalles de tu operación o dudas adicionales
        </label>
        <textarea
          id="message"
          rows="3"
          bind:value={message}
          placeholder="Cuéntanos sobre tus procesos actuales, dolores con sistemas anteriores o módulos prioritarios..."
          class="w-full px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-brand-dark placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-magenta focus:bg-white transition-colors resize-none"
        ></textarea>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full py-3.5 rounded bg-brand-magenta text-white font-semibold text-xs uppercase tracking-wider hover:bg-brand-magenta-dark transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {#if isSubmitting}
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Enviando información...</span>
          {:else}
            <span>Solicitar Diagnóstico Sin Costo</span>
            {@render ArrowRight({ class: "w-4 h-4" })}
          {/if}
        </button>
      </div>

      <p class="text-[11px] text-brand-muted text-center font-light">
        Tus datos están protegidos conforme a la Ley N° 29733 de Protección de Datos Personales en el Perú.
      </p>
    </form>
  {/if}
</div>
