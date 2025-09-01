const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeRemaining() {
  const publicDir = path.join(__dirname, '..', 'public');
  const backupDir = path.join(publicDir, 'images-backup');
  
  // Find PNG files without corresponding WebP files
  async function findPNGsWithoutWebP(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && !fullPath.includes('images-backup')) {
        files.push(...await findPNGsWithoutWebP(fullPath));
      } else if (item.isFile() && item.name.endsWith('.png')) {
        const webpPath = fullPath.replace('.png', '.webp');
        try {
          await fs.access(webpPath);
          // WebP exists, skip this file
        } catch {
          // WebP doesn't exist, add to list
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  const pngFiles = await findPNGsWithoutWebP(publicDir);
  console.log(`Found ${pngFiles.length} PNG files without WebP versions`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalWebpSize = 0;
  let processedCount = 0;

  for (const filePath of pngFiles) {
    try {
      const fileName = path.basename(filePath);
      const dirName = path.dirname(filePath);
      const relativePath = path.relative(publicDir, dirName);
      
      // Check if backup exists
      const backupPath = path.join(backupDir, relativePath, fileName);
      let sourceFile = filePath;
      
      try {
        await fs.access(backupPath);
        sourceFile = backupPath; // Use backup as source if it exists
        console.log(`Using backup for ${fileName}`);
      } catch {
        // No backup, use current file
        console.log(`No backup found for ${fileName}, using current file`);
      }
      
      const stats = await fs.stat(sourceFile);
      const originalSize = stats.size;
      totalOriginalSize += originalSize;
      
      // Read image metadata
      const metadata = await sharp(sourceFile).metadata();
      const { width, height } = metadata;
      
      // Determine optimal dimensions (max 1920px wide for web)
      let newWidth = width;
      let newHeight = height;
      if (width > 1920) {
        newWidth = 1920;
        newHeight = Math.round((1920 / width) * height);
      }
      
      // Only optimize PNG if we're using the backup (otherwise it's already optimized)
      if (sourceFile === backupPath) {
        await sharp(sourceFile)
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
          .toFile(filePath + '.tmp');
        
        await fs.rename(filePath + '.tmp', filePath);
      }
      
      // Create WebP version
      const webpPath = filePath.replace('.png', '.webp');
      await sharp(sourceFile)
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
      processedCount++;
      
      const webpReduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ ${fileName}`);
      console.log(`  WebP created: ${(webpSize / 1024 / 1024).toFixed(2)} MB (${webpReduction}% reduction)`);
      
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  console.log('\n=== COMPLETION SUMMARY ===');
  console.log(`Files processed: ${processedCount}`);
  console.log(`Total WebP size created: ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Average savings: ${((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1)}%`);
}

optimizeRemaining().catch(console.error);