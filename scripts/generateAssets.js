const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'logo.svg');

async function generateAssets() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate app icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Generated icon.png (1024x1024)');

  // Generate adaptive icon for Android (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png (1024x1024)');

  // Generate splash icon (larger, will be centered)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('Generated splash-icon.png (512x512)');

  // Generate favicon for web
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('Generated favicon.png (48x48)');

  console.log('\nAll assets generated successfully!');
}

generateAssets().catch(console.error);
