/**
 * Vercel Setup Automation Script
 * Playwright-based automation for Story 8.1.3
 *
 * Automates:
 * - Vercel project creation
 * - Environment variable configuration
 * - CI/CD verification
 * - Preview deployment testing
 * - API integration validation
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface VercelConfig {
  projectName: string;
  repoUrl: string;
  rootDir: string;
  apiUrl: string;
  apiUrlPreview: string;
}

const config: VercelConfig = {
  projectName: 'nexus-platform-frontend',
  repoUrl: 'https://github.com/darkking4096/Nexus',
  rootDir: 'packages/frontend',
  apiUrl: 'https://api.production.example.com',
  apiUrlPreview: 'https://api.staging.example.com',
};

const logs: string[] = [];

function log(message: string) {
  console.log(`[Vercel Setup] ${message}`);
  logs.push(`${new Date().toISOString()} - ${message}`);
}

async function waitForSelector(
  page: Page,
  selector: string,
  timeout = 30000
): Promise<void> {
  log(`Waiting for selector: ${selector}`);
  await page.waitForSelector(selector, { timeout });
}

async function setupVercelProject(
  page: Page,
  projectName: string
): Promise<string> {
  log(`Setting up Vercel project: ${projectName}`);

  // Navigate to Vercel dashboard
  await page.goto('https://vercel.com/dashboard');
  log('Navigated to Vercel dashboard');

  // Click "Add New" button
  await page.click('button:has-text("Add New")');
  log('Clicked "Add New" button');

  // Select "Project"
  await page.click('button:has-text("Project")');
  log('Selected "Project" option');

  // Wait for import page
  await waitForSelector(page, 'input[placeholder*="Search"]');

  // Search for repository
  const searchInput = await page.$('input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('darkking4096/Nexus');
    await page.waitForTimeout(1000);
    log('Searched for repository');
  }

  // Click repository
  await page.click('button:has-text("darkking4096/Nexus")');
  log('Selected repository');

  // Wait for configuration page
  await waitForSelector(page, 'input[value="packages/frontend"]', 5000).catch(
    () => {
      log('Root directory field not pre-filled, will enter manually');
    }
  );

  // Set root directory
  const rootInput = await page.$('input[placeholder*="root"]');
  if (rootInput) {
    await rootInput.fill(config.rootDir);
    log(`Set root directory to: ${config.rootDir}`);
  }

  // Click Deploy button
  await page.click('button:has-text("Deploy")');
  log('Clicked Deploy button');

  // Wait for build to start
  await page.waitForTimeout(3000);
  log('Waiting for initial build...');

  // Extract deployment URL
  let deploymentUrl = '';
  try {
    const urlElement = await page.$('[data-testid="deployment-url"]');
    if (urlElement) {
      deploymentUrl = await urlElement.textContent() || '';
      log(`Deployment URL: ${deploymentUrl}`);
    }
  } catch (e) {
    log('Could not extract deployment URL immediately (may appear after build)');
  }

  return deploymentUrl;
}

async function configureEnvironmentVariables(page: Page): Promise<void> {
  log('Configuring environment variables');

  // Navigate to project settings
  await page.goto(
    `https://vercel.com/projects?filterValue=${config.projectName}`
  );
  log('Navigated to project list');

  // Click on project
  await page.click(`a:has-text("${config.projectName}")`);
  log(`Clicked on project: ${config.projectName}`);

  // Navigate to Settings
  await page.click('button:has-text("Settings")');
  log('Navigated to Settings');

  // Navigate to Environment Variables
  await page.click('a:has-text("Environment Variables")');
  log('Navigated to Environment Variables');

  // Add VITE_API_URL for Production
  await page.click('button:has-text("Add New")');
  log('Clicked "Add New" for environment variable');

  // Fill variable name
  await page.fill('input[placeholder*="Name"]', 'VITE_API_URL');
  log('Entered variable name: VITE_API_URL');

  // Fill variable value
  await page.fill('input[placeholder*="Value"]', config.apiUrl);
  log(`Entered production value: ${config.apiUrl}`);

  // Select Production environment
  await page.click('select');
  await page.click('option:has-text("Production")');
  log('Selected Production environment');

  // Save
  await page.click('button:has-text("Save")');
  log('Saved production environment variable');

  // Add VITE_API_URL for Preview
  await page.click('button:has-text("Add New")');
  log('Clicked "Add New" for preview variable');

  await page.fill('input[placeholder*="Name"]', 'VITE_API_URL');
  await page.fill('input[placeholder*="Value"]', config.apiUrlPreview);

  await page.click('select');
  await page.click('option:has-text("Preview")');
  log('Selected Preview environment');

  await page.click('button:has-text("Save")');
  log('Saved preview environment variable');
}

async function verifyGitHubIntegration(page: Page): Promise<void> {
  log('Verifying GitHub integration');

  // Navigate to project settings
  await page.goto(
    `https://vercel.com/projects?filterValue=${config.projectName}`
  );
  await page.click(`a:has-text("${config.projectName}")`);
  await page.click('button:has-text("Settings")');
  await page.click('a:has-text("Git")');
  log('Navigated to Git settings');

  // Verify webhook
  try {
    const webhookStatus = await page.$('text=Webhook verified');
    if (webhookStatus) {
      log('✅ GitHub webhook verified');
    }
  } catch (e) {
    log('⚠️ Could not verify webhook status');
  }

  // Verify auto-deployment settings
  const autoDeployCheckbox = await page.$('input[type="checkbox"]');
  if (autoDeployCheckbox) {
    const isChecked = await autoDeployCheckbox.isChecked();
    log(`Auto-deployment is ${isChecked ? 'enabled' : 'disabled'}`);
  }
}

async function testPreviewDeployment(page: Page): Promise<void> {
  log('Testing preview deployment');

  // Navigate to deployments
  await page.goto(
    `https://vercel.com/projects?filterValue=${config.projectName}`
  );
  await page.click(`a:has-text("${config.projectName}")`);
  await page.click('button:has-text("Deployments")');
  log('Navigated to Deployments');

  // Wait for deployment to complete
  let attempts = 0;
  while (attempts < 12) {
    // Wait up to 2 minutes
    const status = await page.$('text=Ready');
    if (status) {
      log('✅ Deployment ready');
      break;
    }
    log(`Waiting for deployment... (attempt ${attempts + 1}/12)`);
    await page.waitForTimeout(10000);
    attempts++;
  }

  // Get preview URL
  try {
    const urlLink = await page.$('a[href*="vercel.app"]');
    if (urlLink) {
      const href = await urlLink.getAttribute('href');
      log(`Preview URL: ${href}`);

      // Test preview URL
      const response = await page.goto(href || '');
      if (response && response.ok()) {
        log('✅ Preview deployment accessible');
      }
    }
  } catch (e) {
    log('Could not test preview URL');
  }
}

async function validateAPIIntegration(page: Page): Promise<void> {
  log('Validating API integration');

  // Get current URL (should be deployment)
  const currentUrl = page.url();

  try {
    // Test API endpoint
    const response = await page.evaluate(() => {
      return fetch(`${window.location.origin}/api/health`)
        .then((r) => r.json())
        .then((d) => ({ success: true, data: d }))
        .catch((e) => ({ success: false, error: e.message }));
    });

    if (response.success) {
      log('✅ API integration working');
    } else {
      log(`⚠️ API endpoint not responding: ${response.error}`);
    }
  } catch (e) {
    log('Could not test API endpoint');
  }
}

async function saveReport(): Promise<void> {
  const reportPath = path.join(
    __dirname,
    '..',
    'docs',
    'qa',
    'vercel-automation-report.md'
  );

  const report = `# Vercel Setup Automation Report

**Executed**: ${new Date().toISOString()}
**Project**: ${config.projectName}
**Repository**: ${config.repoUrl}

## Execution Log

\`\`\`
${logs.join('\n')}
\`\`\`

## Summary

- Project Name: ${config.projectName}
- Root Directory: ${config.rootDir}
- Build Command: npm run build
- Output Directory: dist/
- Production API URL: ${config.apiUrl}
- Preview API URL: ${config.apiUrlPreview}

## Next Steps

1. Verify Vercel project appears in dashboard
2. Confirm environment variables are set correctly
3. Trigger a test deployment by pushing to main branch
4. Validate preview deployment on pull request
5. Test API connectivity from production URL

---
Generated by Story 8.1.3 automation script.
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  log(`Report saved to: ${reportPath}`);
}

async function main() {
  let browser: Browser | null = null;

  try {
    log('Starting Vercel setup automation...');

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    log('Browser launched and page created');

    // Step 1: Setup Vercel project
    const deploymentUrl = await setupVercelProject(page, config.projectName);

    // Step 2: Configure environment variables
    await configureEnvironmentVariables(page);

    // Step 3: Verify GitHub integration
    await verifyGitHubIntegration(page);

    // Step 4: Test preview deployment
    await testPreviewDeployment(page);

    // Step 5: Validate API integration
    await validateAPIIntegration(page);

    log('✅ Vercel setup automation completed successfully');
  } catch (error) {
    log(`❌ Error during setup: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      log('Browser closed');
    }

    // Save report
    await saveReport();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
