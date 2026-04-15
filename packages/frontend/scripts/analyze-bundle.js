#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Compares current build size against previous baseline
 * Fails if bundle exceeds 500KB gzip target
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const distDir = join(projectRoot, 'dist');
const baselineFile = join(projectRoot, '.bundle-baseline.json');
const reportFile = join(projectRoot, 'dist', 'bundle-report.json');

const BUNDLE_SIZE_LIMIT = 500 * 1024; // 500 KB

/**
 * Get all JS/CSS file sizes from dist directory
 */
function analyzeBundleSize() {
  try {
    // Read all files from dist directory
    const { readdirSync, statSync } = await import('fs');
    const files = readdirSync(distDir);

    let totalSize = 0;
    let totalGzipSize = 0;
    const fileDetails = [];

    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = join(distDir, file);
        const stats = statSync(filePath);
        const fileData = readFileSync(filePath);
        const gzipSize = gzipSync(fileData).length;

        totalSize += stats.size;
        totalGzipSize += gzipSize;

        fileDetails.push({
          name: file,
          size: stats.size,
          gzipSize,
          percentage: 0,
        });
      }
    });

    // Calculate percentages
    fileDetails.forEach(file => {
      file.percentage = totalSize > 0 ? (file.size / totalSize) * 100 : 0;
    });

    // Sort by size
    fileDetails.sort((a, b) => b.size - a.size);

    return {
      totalSize,
      totalGzipSize,
      files: fileDetails,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error analyzing bundle:', error);
    process.exit(1);
  }
}

/**
 * Compare with baseline and report
 */
function reportResults(current) {
  console.log('\n📊 BUNDLE ANALYSIS REPORT');
  console.log('═'.repeat(60));

  const currentGzip = current.totalGzipSize / 1024;
  console.log(`Current Gzip Size: ${currentGzip.toFixed(2)} KB`);

  // Load baseline if it exists
  try {
    const baseline = JSON.parse(readFileSync(baselineFile, 'utf-8'));
    const baselineGzip = baseline.totalGzipSize / 1024;
    const diff = currentGzip - baselineGzip;
    const diffPercent = ((diff / baselineGzip) * 100).toFixed(1);

    console.log(`Baseline Gzip Size: ${baselineGzip.toFixed(2)} KB`);
    console.log(
      `Change: ${diff > 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(2)} KB (${diffPercent}%)`
    );
  } catch {
    console.log('(No baseline found - creating one)');
  }

  // Check against limit
  console.log(`\nTarget: 500 KB (gzip)`);
  if (current.totalGzipSize > BUNDLE_SIZE_LIMIT) {
    console.log(`❌ FAIL: Bundle exceeds limit by ${((current.totalGzipSize - BUNDLE_SIZE_LIMIT) / 1024).toFixed(2)} KB`);
    process.exit(1);
  } else {
    const headroom = BUNDLE_SIZE_LIMIT - current.totalGzipSize;
    console.log(`✅ PASS: ${(headroom / 1024).toFixed(2)} KB headroom remaining`);
  }

  // Top 10 files
  console.log('\nTop 10 Largest Files:');
  console.log('-'.repeat(60));
  current.files.slice(0, 10).forEach((file, idx) => {
    const percent = file.percentage.toFixed(1);
    console.log(`${idx + 1}. ${file.name.padEnd(35)} ${(file.gzipSize / 1024).toFixed(2)} KB (${percent}%)`);
  });

  // Save report
  writeFileSync(reportFile, JSON.stringify(current, null, 2));
  writeFileSync(baselineFile, JSON.stringify(current, null, 2));

  console.log('\n✅ Bundle analysis complete\n');
}

// Run analysis
(async () => {
  const current = analyzeBundleSize();
  reportResults(current);
})();
