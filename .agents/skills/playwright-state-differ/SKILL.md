---
name: playwright-state-differ
description: Inspecciona selectores en URLs originales comparando 3 estados: Reposo (Initial), Hover (:hover) y Activo/Abierto (click). Extrae deltas de CSS computado y nodos HTML revelados.
---

# Playwright State Differ

Herramienta para capturar y comparar de forma precisa los cambios de estilos (`transform`, `transition`, `backgroundColor`, `color`, `boxShadow`, `opacity`, `borderColor`, `visibility`, `maxHeight`) y nodos DOM revelados entre los estados **Initial**, **Hover** y **Click/Active**.

## Uso

```bash
node .agents/skills/playwright-state-differ/differ.mjs --url="https://flexone.pe/" --selector="nav ul > li"
```

O como módulo en Node.js importando `inspectSelectorStates`.
