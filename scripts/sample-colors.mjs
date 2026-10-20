import { chromium } from 'playwright';

async function checkColors() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4323/');
  
  const colors = await page.evaluate(async () => {
    // Load frame 0001 and frame 0120 in an offscreen canvas and sample corners and edges
    async function sampleImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.width;
          cvs.height = img.height;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const pTopLeft = ctx.getImageData(20, 20, 1, 1).data;
          const pTopCenter = ctx.getImageData(Math.floor(img.width / 2), 20, 1, 1).data;
          const pBottomLeft = ctx.getImageData(20, img.height - 20, 1, 1).data;
          const pBottomCenter = ctx.getImageData(Math.floor(img.width / 2), img.height - 20, 1, 1).data;
          
          const toHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
          
          resolve({
            topLeft: toHex(pTopLeft[0], pTopLeft[1], pTopLeft[2]),
            topCenter: toHex(pTopCenter[0], pTopCenter[1], pTopCenter[2]),
            bottomLeft: toHex(pBottomLeft[0], pBottomLeft[1], pBottomLeft[2]),
            bottomCenter: toHex(pBottomCenter[0], pBottomCenter[1], pBottomCenter[2]),
          });
        };
      });
    }

    const frame1 = await sampleImage('/frames/gorilla/frame_0001.webp');
    const frame60 = await sampleImage('/frames/gorilla/frame_0060.webp');
    const frame120 = await sampleImage('/frames/gorilla/frame_0120.webp');
    const heroPoster = await sampleImage('/images/gorilla-headphones.jpg');

    return { frame1, frame60, frame120, heroPoster };
  });

  console.log('Sampled colors:', JSON.stringify(colors, null, 2));
  await browser.close();
}

checkColors();
