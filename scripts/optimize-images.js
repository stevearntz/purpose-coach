const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  const backupDir = path.join(publicDir, 'images-backup');
  
  // Create backup directory
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.log('Backup directory already exists or could not be created');
  }

  // Find all PNG files
  async function findPNGs(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && !fullPath.includes('images-backup')) {
        files.push(...await findPNGs(fullPath));
      } else if (item.isFile() && item.name.endsWith('.png')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const pngFiles = await findPNGs(publicDir);
  console.log(`Found ${pngFiles.length} PNG files to optimize`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalWebpSize = 0;

  for (const filePath of pngFiles) {
    try {
      const stats = await fs.stat(filePath);
      const originalSize = stats.size;
      totalOriginalSize += originalSize;
      
      const fileName = path.basename(filePath);
      const dirName = path.dirname(filePath);
      const relativePath = path.relative(publicDir, dirName);
      
      // Create backup
      const backupPath = path.join(backupDir, relativePath, fileName);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(filePath, backupPath);
      
      // Read image metadata
      const metadata = await sharp(filePath).metadata();
      const { width, height } = metadata;
      
      // Determine optimal dimensions (max 1920px wide for web)
      let newWidth = width;
      let newHeight = height;
      if (width > 1920) {
        newWidth = 1920;
        newHeight = Math.round((1920 / width) * height);
      }
      
      // Optimize PNG
      await sharp(backupPath)
        .resize(newWidth, newHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png({ 
          quality: 85,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true
        })
        .toFile(filePath);
      
      // Create WebP version
      const webpPath = filePath.replace('.png', '.webp');
      await sharp(backupPath)
        .resize(newWidth, newHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85,
          effort: 6
        })
        .toFile(webpPath);
      
      const optimizedStats = await fs.stat(filePath);
      const webpStats = await fs.stat(webpPath);
      const optimizedSize = optimizedStats.size;
      const webpSize = webpStats.size;
      
      totalOptimizedSize += optimizedSize;
      totalWebpSize += webpSize;
      
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      const webpReduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ ${fileName}`);
      console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Optimized PNG: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB (${reduction}% reduction)`);
      console.log(`  WebP: ${(webpSize / 1024 / 1024).toFixed(2)} MB (${webpReduction}% reduction)`);
      console.log(`  Dimensions: ${width}x${height} → ${newWidth}x${newHeight}`);
      console.log('');
      
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  console.log('\n=== OPTIMIZATION SUMMARY ===');
  console.log(`Total files processed: ${pngFiles.length}`);
  console.log(`Original total size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized PNG total: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`WebP total: ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total PNG savings: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB (${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  console.log(`Total WebP savings: ${((totalOriginalSize - totalWebpSize) / 1024 / 1024).toFixed(2)} MB (${((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  console.log('\nOriginal files backed up to: public/images-backup/');
}

optimizeImages().catch(console.error);