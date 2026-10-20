import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://www.egs.pe/';
const OUTPUT_DATA_FILE = './spec_data/egs-live-data.json';

async function extractEGS() {
  console.log(`🌐 Iniciando inspección profunda con Playwright en: ${TARGET_URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  console.log(`📡 Navegando a ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // 1. Extraer datos generales de la Home
  const homeData = await page.evaluate(() => {
    // Colores computados y fuentes
    const bodyStyles = window.getComputedStyle(document.body);
    const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName.toLowerCase(),
      text: h.innerText.trim(),
      color: window.getComputedStyle(h).color,
      fontSize: window.getComputedStyle(h).fontSize,
      fontFamily: window.getComputedStyle(h).fontFamily
    })).filter(h => h.text.length > 0);

    // Enlaces de redes sociales y contacto
    const allLinks = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText.trim().replace(/\s+/g, ' '),
      href: a.href,
      classes: a.className
    }));

    // Detectar teléfonos, emails, whatsapp
    const htmlText = document.body.innerText;
    const phoneMatches = htmlText.match(/(\+?51\s*)?(\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4}|\d{7,9})/g) || [];
    const emailMatches = htmlText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    // Redes sociales
    const socialLinks = allLinks.filter(l => 
      l.href.includes('facebook') || 
      l.href.includes('linkedin') || 
      l.href.includes('twitter') || 
      l.href.includes('x.com') || 
      l.href.includes('instagram') || 
      l.href.includes('youtube') || 
      l.href.includes('wa.me') || 
      l.href.includes('whatsapp')
    );

    // Imágenes principales y logos
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt || '',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      className: img.className
    })).filter(img => img.src && !img.src.startsWith('data:image/svg'));

    // Estructura de navegación principal y megamenús
    const navItems = Array.from(document.querySelectorAll('header, nav, .navbar, ul.navbar-nav, .menu')).map(el => ({
      tag: el.tagName,
      className: el.className,
      text: el.innerText.trim().slice(0, 500)
    }));

    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      metaKeywords: document.querySelector('meta[name="keywords"]')?.content || '',
      bodyFontFamily: bodyStyles.fontFamily,
      bodyColor: bodyStyles.color,
      bodyBg: bodyStyles.backgroundColor,
      headers: headers.slice(0, 30),
      socialLinks,
      allLinks,
      phoneMatches: [...new Set(phoneMatches)],
      emailMatches: [...new Set(emailMatches)],
      images: images.slice(0, 50),
      rawTextSummary: htmlText.replace(/\s+/g, ' ').slice(0, 5000)
    };
  });

  // Tomar captura de pantalla de referencia de la Home
  const screenshotPath = './spec_data/egs-home-reference.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Captura de pantalla guardada en: ${screenshotPath}`);

  // 2. Extraer todos los links internos únicos
  const internalUrls = [...new Set(
    homeData.allLinks
      .map(l => l.href)
      .filter(href => {
        try {
          const u = new URL(href);
          return u.origin === 'https://www.egs.pe' && 
                 !u.pathname.match(/\.(png|jpg|jpeg|webp|pdf|zip|svg)$/i) &&
                 !u.pathname.includes('#');
        } catch {
          return false;
        }
      })
  )];

  console.log(`🔍 Enlaces internos encontrados para rastrear: ${internalUrls.length}`);
  internalUrls.forEach(u => console.log(`   - ${u}`));

  // 3. Rastrear cada subpágina para leer su contenido, servicios y objetivos
  const subpagesData = [];
  for (const url of internalUrls) {
    if (url === TARGET_URL || url === 'https://www.egs.pe') continue;
    console.log(`\n📄 Explorando subpágina: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const pData = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(Boolean),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()).filter(Boolean),
          textSnippet: document.body.innerText.replace(/\s+/g, ' ').slice(0, 1500),
          images: Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, alt: i.alt })).filter(i => i.src).slice(0, 10),
          links: Array.from(document.querySelectorAll('a[href]')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text && l.href).slice(0, 20)
        };
      });
      subpagesData.push(pData);
      
      // Capturar screenshot de cada subpágina relevante
      const cleanName = new URL(url).pathname.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]/g, '-') || 'subpage';
      await page.screenshot({ path: `./spec_data/egs-${cleanName}.png`, fullPage: false });
    } catch (err) {
      console.warn(`⚠️ Error explorando ${url}: ${err.message}`);
    }
  }

  // 4. Guardar archivo consolidado
  const consolidated = {
    crawledAt: new Date().toISOString(),
    baseUrl: TARGET_URL,
    home: homeData,
    subpages: subpagesData
  };

  fs.writeFileSync(OUTPUT_DATA_FILE, JSON.stringify(consolidated, null, 2), 'utf-8');
  console.log(`\n✅ Datos consolidados guardados en: ${OUTPUT_DATA_FILE}`);

  await browser.close();
}

extractEGS().catch(console.error);
