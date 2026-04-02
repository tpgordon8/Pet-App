import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'test-assets');

/**
 * Generate test images for photo upload testing
 */
export async function generateTestImages() {
  // Ensure assets directory exists
  await fs.mkdir(assetsDir, { recursive: true });

  // 1. Standard test image (800x600)
  const standardSvg = Buffer.from(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#4CAF50"/>
      <text x="400" y="300" font-size="48" text-anchor="middle" fill="white">
        Test Image ${new Date().toISOString()}
      </text>
      <text x="400" y="360" font-size="24" text-anchor="middle" fill="white">
        800x600 Standard
      </text>
    </svg>
  `);

  await sharp(standardSvg)
    .png()
    .toFile(path.join(assetsDir, 'test-image.png'));

  // 2. Large image to test compression (4000x3000)
  const largeSvg = Buffer.from(`
    <svg width="4000" height="3000" xmlns="http://www.w3.org/2000/svg">
      <rect width="4000" height="3000" fill="#2196F3"/>
      <text x="2000" y="1500" font-size="200" text-anchor="middle" fill="white">
        Large Image ${new Date().toISOString()}
      </text>
      <text x="2000" y="1800" font-size="100" text-anchor="middle" fill="white">
        4000x3000 - Test Compression
      </text>
    </svg>
  `);

  await sharp(largeSvg)
    .png()
    .toFile(path.join(assetsDir, 'large-image.png'));

  // 3. Corrupt image (invalid PNG data)
  await fs.writeFile(
    path.join(assetsDir, 'corrupt.png'),
    'This is not a valid PNG file, but has .png extension'
  );

  // 4. Small image (100x100) to test edge cases
  const smallSvg = Buffer.from(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#FF5722"/>
      <text x="50" y="55" font-size="12" text-anchor="middle" fill="white">
        Small
      </text>
    </svg>
  `);

  await sharp(smallSvg)
    .png()
    .toFile(path.join(assetsDir, 'small-image.png'));

  return {
    standard: path.join(assetsDir, 'test-image.png'),
    large: path.join(assetsDir, 'large-image.png'),
    corrupt: path.join(assetsDir, 'corrupt.png'),
    small: path.join(assetsDir, 'small-image.png')
  };
}

export function getTestImagePath(type = 'standard') {
  const images = {
    standard: 'test-image.png',
    large: 'large-image.png',
    corrupt: 'corrupt.png',
    small: 'small-image.png'
  };
  return path.join(assetsDir, images[type] || images.standard);
}
