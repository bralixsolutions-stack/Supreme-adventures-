const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  const logoPath = path.join(__dirname, '..', 'public', 'supreme-official-logo.png');
  const outJpgPath = path.join(__dirname, '..', 'public', 'og-image.jpg');
  const outPngPath = path.join(__dirname, '..', 'public', 'og-image.png');

  // Resize logo prominently (e.g. height: 480px, width: ~540px)
  const targetLogoH = 460;
  const targetLogoW = Math.round(targetLogoH * (472 / 420)); // ~517px

  const logoBuffer = await sharp(logoPath)
    .resize({ width: targetLogoW, height: targetLogoH, fit: 'contain' })
    .toBuffer();

  const logoX = Math.round((width - targetLogoW) / 2);
  const logoY = Math.round((height - targetLogoH) / 2);

  // Clean White Background (1200x630)
  const baseCanvas = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    {
      input: logoBuffer,
      top: logoY,
      left: logoX
    }
  ]);

  // Output JPG
  await baseCanvas
    .clone()
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(outJpgPath);

  // Output PNG
  await baseCanvas
    .clone()
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outPngPath);

  const jpgStats = fs.statSync(outJpgPath);
  const pngStats = fs.statSync(outPngPath);
  console.log(`Generated og-image.jpg: ${(jpgStats.size / 1024).toFixed(1)} KB`);
  console.log(`Generated og-image.png: ${(pngStats.size / 1024).toFixed(1)} KB`);
}

generateOgImage().catch(console.error);
