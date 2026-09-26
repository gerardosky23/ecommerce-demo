import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const inputVideo = process.argv[2] || 'public/audi-source.mp4';
const outputDir = 'public/audi-frames';
const fps = Number(process.argv[3] || 24);

if (!existsSync(inputVideo)) {
  console.error(`❌ No se encontró el video de entrada en: ${inputVideo}`);
  console.log('Uso: node scripts/extract-audi-frames.mjs <ruta-video.mp4> [fps]');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

// Limpiar frames previos
for (const file of readdirSync(outputDir)) {
  if (file.endsWith('.webp')) {
    unlinkSync(join(outputDir, file));
  }
}

console.log(`🎬 Extrayendo secuencia de alta calidad desde "${inputVideo}" a ${fps} FPS (con Deband + FidelityFX CAS)...`);

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i',
    inputVideo,
    '-vf',
    `fps=${fps},deband,cas=0.45`,
    '-vcodec',
    'libwebp',
    '-lossless',
    '0',
    '-compression_level',
    '4',
    '-q:v',
    '95',
    join(outputDir, 'frame_%04d.webp'),
  ],
  { stdio: 'inherit' }
);

console.log(`✅ Secuencia de alta calidad generada en ${outputDir}/`);
