import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/images/products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  {
    id: 'spa-collection',
    url: 'https://www.terrebleu.ca/cdn/shop/files/TerreBleuLavenderSpaCollection.png?v=1792113654&width=1080',
    filename: 'spa-collection.webp'
  },
  {
    id: 'hand-cream',
    url: 'https://www.terrebleu.ca/cdn/shop/files/Lavender_Citrus_Hand_Cream_White_Background_Nov_2024.jpg?v=1767139266&width=1080',
    filename: 'hand-cream.webp'
  },
  {
    id: 'roll-on',
    url: 'https://www.terrebleu.ca/cdn/shop/files/Dreamy_Lavender_Roll_on_10ml_upright_white_background.png?v=1774540781&width=1080',
    filename: 'roll-on.webp'
  },
  {
    id: 'lip-balm',
    url: 'https://www.terrebleu.ca/cdn/shop/files/Lip_Balm_white_background_sie.png?v=1767141428&width=1080',
    filename: 'lip-balm.webp'
  },
  {
    id: 'bouquet',
    url: 'https://www.terrebleu.ca/cdn/shop/products/bouquetphoto2.jpg?v=1774540621&width=1080',
    filename: 'bouquet.webp'
  },
  {
    id: 'cookies',
    url: 'https://www.terrebleu.ca/cdn/shop/products/shortbreadcookies_newproductimage.png?v=1679949384&width=1080',
    filename: 'cookies.webp'
  },
  {
    id: 'bath-salts',
    url: 'https://www.terrebleu.ca/cdn/shop/products/Terre_Bleu_New_Arrivals_Extras-3.jpg?v=1774540916&width=1080',
    filename: 'bath-salts.webp'
  },
  {
    id: 'essential-oil',
    url: 'https://www.terrebleu.ca/cdn/shop/products/Phenomenal_bottle_5mL_white_background.jpg?v=1774541513&width=1080',
    filename: 'essential-oil.webp'
  }
];

const logoUrl = 'https://www.terrebleu.ca/cdn/shop/files/Terre_Bleu_REBRAND_ddaec335-2294-4f47-bca4-e71dd6775e7a.svg?v=1738957020';

async function main() {
  console.log('Downloading and optimizing images...');

  // Download logo
  try {
    const res = await fetch(logoUrl);
    if (res.ok) {
      const svgText = await res.text();
      fs.writeFileSync(path.resolve('public/images/logo.svg'), svgText, 'utf8');
      console.log('Saved public/images/logo.svg');
    }
  } catch (err) {
    console.error('Failed to download logo:', err.message);
  }

  for (const item of images) {
    try {
      console.log(`Fetching ${item.id}...`);
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Resize to 800x800 max and convert to webp quality 80
      const outPath = path.join(outputDir, item.filename);
      await sharp(inputBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(outPath);

      const stats = fs.statSync(outPath);
      const kb = (stats.size / 1024).toFixed(1);
      console.log(`Saved ${item.filename} (${kb} KB)`);
      if (stats.size > 50 * 1024) {
        console.warn(`WARNING: ${item.filename} is larger than 50 KB (${kb} KB), recompressing...`);
        await sharp(inputBuffer)
          .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 72, effort: 6 })
          .toFile(outPath);
        const newStats = fs.statSync(outPath);
        console.log(`Re-saved ${item.filename} (${(newStats.size / 1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      console.error(`Error processing ${item.id}:`, err.message);
    }
  }

  console.log('Finished image optimization.');
}

main();
