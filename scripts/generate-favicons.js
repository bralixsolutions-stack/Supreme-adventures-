const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIcoFromPngs(pngBuffers) {
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(numImages, 4);

  let offset = 6 + 16 * numImages;
  const dirEntries = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function generateFavicons() {
  const logoPath = path.join(__dirname, '..', 'public', 'supreme-official-logo.png');
  const publicDir = path.join(__dirname, '..', 'public');

  // Load and trim input logo to its exact bounding box
  const trimmedBuffer = await sharp(logoPath)
    .trim()
    .toBuffer();

  // Helper to create a centered square icon with safe padding (~86% inner size)
  async function createSquareIcon(size, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
    const innerSize = Math.max(1, Math.round(size * 0.86));
    const resizedLogo = await sharp(trimmedBuffer)
      .resize({
        width: innerSize,
        height: innerSize,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background
      }
    })
      .composite([
        {
          input: resizedLogo,
          gravity: 'center'
        }
      ])
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();
  }

  const sizes = [16, 32, 48, 96, 180, 192, 512];
  const pngResults = {};

  for (const size of sizes) {
    const buf = await createSquareIcon(size);
    pngResults[size] = buf;
  }

  // 1. Write individual PNG favicons
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), pngResults[16]);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngResults[32]);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), pngResults[48]);
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), pngResults[96]);
  fs.writeFileSync(path.join(publicDir, 'favicon-192x192.png'), pngResults[192]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), pngResults[192]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), pngResults[512]);

  // 2. Apple Touch Icon (180x180 with clean crisp padding)
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngResults[180]);

  // 3. Multi-layer favicon.ico (16, 32, 48)
  const icoBuffer = createIcoFromPngs([
    { width: 16, height: 16, buffer: pngResults[16] },
    { width: 32, height: 32, buffer: pngResults[32] },
    { width: 48, height: 48, buffer: pngResults[48] }
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // 4. Create site.webmanifest
  const webmanifest = {
    name: "Supreme Adventures",
    short_name: "Supreme Adventures",
    description: "Worldwide Safaris, Beach Escapes & Global Trips",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#221F1F",
    background_color: "#ffffff",
    display: "standalone"
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(webmanifest, null, 2)
  );

  console.log('✅ Favicons and webmanifest successfully generated:');
  console.log('- /favicon.ico (16x16, 32x32, 48x48)');
  console.log('- /favicon-16x16.png');
  console.log('- /favicon-32x32.png');
  console.log('- /favicon-48x48.png (Google Search Standard)');
  console.log('- /favicon-96x96.png');
  console.log('- /favicon-192x192.png');
  console.log('- /apple-touch-icon.png (180x180)');
  console.log('- /android-chrome-192x192.png');
  console.log('- /android-chrome-512x512.png');
  console.log('- /site.webmanifest');
}

generateFavicons().catch(console.error);
