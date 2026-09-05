const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const photosDir = path.join(__dirname, 'public', 'photos');

async function optimizeLogo() {
  const logoWebp = path.join(publicDir, 'supreme-official-logo.webp');
  if (fs.existsSync(logoWebp)) {
    const inputBuf = fs.readFileSync(logoWebp);
    const sizeBefore = inputBuf.length;
    const outputBuf = await sharp(inputBuf)
      .resize({ width: 320, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();
    
    if (outputBuf.length < sizeBefore) {
      fs.writeFileSync(logoWebp, outputBuf);
      console.log(`Optimized supreme-official-logo.webp: ${(sizeBefore/1024).toFixed(1)}KB -> ${(outputBuf.length/1024).toFixed(1)}KB`);
    }
  }
}

async function optimizeWebpPhotos() {
  if (!fs.existsSync(photosDir)) return;
  const files = fs.readdirSync(photosDir);

  for (const file of files) {
    if (file.endsWith('.webp')) {
      const filePath = path.join(photosDir, file);
      const inputBuf = fs.readFileSync(filePath);
      const sizeBefore = inputBuf.length;

      let targetWidth = 1000;
      if (file.startsWith('client_')) {
        targetWidth = 500; // Client photos displayed in small grid cards
      }

      try {
        const outputBuf = await sharp(inputBuf)
          .resize({ width: targetWidth, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 6, smartSubsample: true })
          .toBuffer();

        if (outputBuf.length < sizeBefore) {
          fs.writeFileSync(filePath, outputBuf);
          console.log(`Optimized ${file}: ${(sizeBefore/1024).toFixed(1)}KB -> ${(outputBuf.length/1024).toFixed(1)}KB`);
        } else {
          console.log(`Skipped ${file}: already optimal (${(sizeBefore/1024).toFixed(1)}KB)`);
        }
      } catch (err) {
        console.error(`Error optimizing ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  console.log("Optimizing logo...");
  await optimizeLogo();
  console.log("Optimizing WebP photos in public/photos...");
  await optimizeWebpPhotos();
  console.log("Image optimization completed!");
}

run();
