---
name: playwright-carousel-harvester
description: Desarma carruseles (Swiper, Slick, Owl, Keen o nativos), extrayendo todas las diapositivas lazy-loaded, midiendo breakpoints (1440px y 375px), y capturando tarjetas y controles.
---

# Playwright Carousel Harvester

Herramienta especializada en desarmar y extraer diapositivas, estilos de tarjetas individuales y controles de carruseles que fallan en capturas estáticas.

## Uso

```bash
node .agents/skills/playwright-carousel-harvester/harvester.mjs --url="https://flexone.pe/" --selector=".swiper, .carousel"
```
