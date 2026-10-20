# 📐 Estándar Tipográfico, Catálogo de Botones y Prevención de Desborde (UI/UX)

Este documento especifica los tokens de tipografía, las dimensiones de botones táctiles accesibles (WCAG AA) y las reglas mandatorias de prevención de desborde horizontal para cualquier proyecto generado con `site-craft-pro`.

---

## 1. Escala Tipográfica Armónica

| Rol Semántico | Clases Tailwind v4 Recomendadas | Desktop (1440px) | Mobile (375px) | Weight | Line-Height Ratio | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display H1** | `text-3xl sm:text-5xl lg:text-6xl font-black` | 48px – 60px | 30px – 36px | 900 (`font-black`) | `leading-[1.12]` a `1.18` | `-0.025em` (`tracking-tight`) |
| **Subpage H1** | `text-3xl sm:text-4xl lg:text-5xl font-black` | 40px – 48px | 30px | 900 (`font-black`) | `leading-tight` (`1.20`) | `-0.025em` (`tracking-tight`) |
| **Sección H2** | `text-2xl sm:text-3xl lg:text-4xl font-black` | 32px – 36px | 24px | 900 (`font-black`) | `leading-tight` (`1.22`) | `-0.02em` (`tracking-tight`) |
| **Card / Feature H3** | `text-xl sm:text-2xl font-black` | 20px – 24px | 18px – 20px | 800 (`font-extrabold`) | `leading-snug` (`1.28`) | `-0.015em` |
| **Submódulo H4** | `text-lg sm:text-xl font-bold` | 18px – 20px | 16px – 18px | 700 (`font-bold`) | `leading-snug` (`1.30`) | Normal |
| **Párrafo Lead** | `text-base sm:text-lg text-white/70 font-light` | 18px | 16px | 300 (`font-light`) | `leading-relaxed` (`1.60`) | Normal |
| **Párrafo Body** | `text-sm sm:text-base text-slate-600 leading-relaxed` | 15px – 16px | 14px | 400 (`font-normal`) | `leading-relaxed` (`1.65`) | Normal |
| **Eyebrow Badge** | `text-xs font-mono uppercase tracking-wider font-bold` | 12px | 11px | 700 (`font-bold`) | `leading-none` (`1.00`) | `0.05em` |
| **Telemetría / Code**| `text-[11px] sm:text-xs font-mono` | 11px – 12px | 10px – 11px | 500 / 600 | `leading-normal` (`1.45`) | Normal |

---

## 2. Catálogo de Botones e Interactividad

### A. Botón Primario Enterprise (`.btn-primary`)
- Altura táctil $\ge 48\text{px}$ (cumplimiento WCAG 2.1 AA / Apple HIG).
- Tokens CSS en `src/styles/globals.css`:
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem; /* px-7 py-3.5 */
  border-radius: 0.75rem;     /* rounded-xl */
  background-color: var(--color-brand-primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.75rem;        /* text-xs */
  text-transform: uppercase;
  letter-spacing: 0.05em;    /* tracking-wider */
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 25px -5px rgba(13, 110, 253, 0.35);
  cursor: pointer;
}
.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(13, 110, 253, 0.45);
}
.btn-primary:active {
  transform: translateY(0);
}
```

### B. Botón Secundario Translúcido (`.btn-secondary`)
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;  /* px-6 py-3.5 */
  border-radius: 0.75rem;     /* rounded-xl */
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-weight: 500;
  font-size: 0.75rem;        /* text-xs */
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}
```

### C. Botones de Pestañas e Islas (`.btn-tab`)
- `px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer`.

---

## 3. Protocolo de Prevención de Desborde Horizontal (Zero-Scroll Rule)

1. **Clip en el Root:** `html, body { overflow-x: clip; max-width: 100vw; }`.
2. **Contenedores de Islas:** En componentes Svelte con 3D tilt, tablas o SVGs, usar siempre `w-full max-w-full overflow-hidden sm:overflow-visible`.
3. **SVGs:** Siempre declarar `overflow-hidden` o envolver en un `overflow-hidden` para que rutas vectoriales con coordenadas absolutas no estiren el layout.
4. **Padding Móvil Seguro:** En pantallas móviles (< 640px), nunca aplicar `p-8` ni `p-10` en contenedores centrados (`max-w-xl`, `max-w-5xl`). Usar `p-4 sm:p-8 lg:p-10`.
