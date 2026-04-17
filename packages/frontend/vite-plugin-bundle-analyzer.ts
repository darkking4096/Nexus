import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { gzipSize } from 'gzip-size';

interface BundleAnalysisReport {
  totalSize: number;
  gzipSize: number;
  files: Array<{
    name: string;
    size: number;
    gzipSize: number;
    percentage: number;
  }>;
  timestamp: string;
}

/**
 * Vite plugin for bundle analysis
 * Generates before/after reports comparing bundle sizes
 */
export function bundleAnalyzerPlugin(): Plugin {
  let reportData: BundleAnalysisReport | null = null;

  return {
    name: 'vite-plugin-bundle-analyzer',

    apply: 'build',

    // Hook after bundle is written to disk
    writeBundle: async (_options, bundle) => {
      let totalSize = 0;
      const files = [];

      // Analyze each generated file
      for (const [fileName, assetInfo] of Object.entries(bundle)) {
        if ('source' in assetInfo) {
          const source = assetInfo.source;
          const size = typeof source === 'string' ? source.length : source.byteLength;

          // Only analyze JS/CSS files
          if (fileName.endsWith('.js') || fileName.endsWith('.css')) {
            const gzipSizeValue = await gzipSize(resolve(process.cwd(), 'dist', fileName)).catch(
              () => size
            );

            totalSize += size;

            files.push({
              name: fileName,
              size,
              gzipSize: gzipSizeValue,
              percentage: 0, // Will calculate after
            });
          }
        } else if ('versionedName' in assetInfo && assetInfo.source) {
          const source = assetInfo.source;
          const size = typeof source === 'string' ? source.length : source.byteLength;

          if (assetInfo.versionedName?.endsWith('.js') || assetInfo.versionedName?.endsWith('.css')) {
            totalSize += size;
            files.push({
              name: assetInfo.versionedName || fileName,
              size,
              gzipSize: size,
              percentage: 0,
            });
          }
        }
      }

      // Calculate percentages and sort by size
      files.forEach(file => {
        file.percentage = totalSize > 0 ? (file.size / totalSize) * 100 : 0;
      });
      files.sort((a, b) => b.size - a.size);

      // Calculate total gzip size
      const totalGzipSize = files.reduce((sum, file) => sum + file.gzipSize, 0);

      reportData = {
        totalSize,
        gzipSize: totalGzipSize,
        files: files.slice(0, 20), // Top 20 largest files
        timestamp: new Date().toISOString(),
      };

      // Generate console report
      console.log('\n📊 BUNDLE ANALYSIS REPORT');
      console.log('═'.repeat(50));
      console.log(`Total Size: ${formatBytes(totalSize)}`);
      console.log(`Gzip Size: ${formatBytes(totalGzipSize)}`);
      console.log(`Compression Ratio: ${((totalGzipSize / totalSize) * 100).toFixed(1)}%`);
      console.log('\nTop 20 Largest Files:');
      console.log('-'.repeat(50));

      files.slice(0, 20).forEach(file => {
        const bar = '█'.repeat(Math.ceil(file.percentage / 2));
        console.log(
          `${file.name.padEnd(30)} ${formatBytes(file.size).padStart(10)} (${file.percentage.toFixed(1)}%)`
        );
      });

      console.log('\n✅ Bundle Analysis Complete\n');

      // Check against budget
      if (totalGzipSize > 500 * 1024) {
        console.warn(`⚠️ WARNING: Bundle size (${formatBytes(totalGzipSize)}) exceeds 500KB target!`);
      } else {
        console.log(`✅ Bundle size (${formatBytes(totalGzipSize)}) is within 500KB target.`);
      }
    },
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
