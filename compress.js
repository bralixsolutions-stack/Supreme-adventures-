const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'public', 'photos');
const packagesDir = path.join(__dirname, 'public', 'packages');

async function compressDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.startsWith('temp_')) continue;
    if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
      const filePath = path.join(dirPath, file);
      const tempPath = path.join(dirPath, 'temp_' + file);
      const statBefore = fs.statSync(filePath);
      
      try {
        let pipeline = sharp(filePath).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true });
        if (file.endsWith('.png')) {
          pipeline = pipeline.png({ quality: 82, compressionLevel: 8 });
        } else {
          pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
        }
        
        await pipeline.toFile(tempPath);

        const statAfter = fs.statSync(tempPath);
        if (statAfter.size < statBefore.size) {
          fs.unlinkSync(filePath);
          fs.renameSync(tempPath, filePath);
          console.log(`Compressed ${file}: ${(statBefore.size/1024/1024).toFixed(2)}MB -> ${(statAfter.size/1024).toFixed(0)}KB`);
        } else {
          fs.unlinkSync(tempPath);
          console.log(`Skipped ${file}: already optimal`);
        }
      } catch (err) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error(`Error on ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  console.log("Compressing public/photos...");
  await compressDir(photosDir);
  console.log("Compressing public/packages...");
  await compressDir(packagesDir);
  console.log("All image compression complete!");
}

run();
