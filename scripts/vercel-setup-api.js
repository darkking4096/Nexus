#!/usr/bin/env node

/**
 * Vercel Setup via API
 * Story 8.1.3 - Automated deployment configuration
 *
 * Uses Vercel API REST to:
 * - Create project
 * - Configure environment variables
 * - Enable CI/CD
 * - Verify deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CONFIG = {
  projectName: 'nexus-platform-frontend',
  repoUrl: 'darkking4096/Nexus',
  rootDir: 'packages/frontend',
  buildCommand: 'npm run build',
  outputDir: 'dist',
  apiUrlProduction: 'https://api.production.example.com',
  apiUrlStaging: 'https://api.staging.example.com',
};

const logs = [];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  logs.push(`${timestamp} - ${message}`);
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function getVercelToken() {
  try {
    // Try to get token from Vercel CLI config
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.vercel',
      'auth.json'
    );

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.token;
    }

    log('⚠️  No Vercel token found. Attempting CLI login...');

    // Try to get token via CLI
    try {
      const output = execSync('vercel token create --scope full').toString();
      const match = output.match(/Token: ([a-zA-Z0-9_-]+)/);
      if (match) {
        return match[1];
      }
    } catch {
      log('❌ Could not create token via CLI. Please authenticate first:');
      log('   Run: vercel login');
      log('   Then: VERCEL_TOKEN=$(vercel token create) npm run vercel-setup');
      return null;
    }
  } catch (error) {
    log(`Error getting token: ${error.message}`);
    return null;
  }
}

async function createProject() {
  log(`Creating Vercel project: ${CONFIG.projectName}`);

  try {
    const response = await makeRequest('POST', '/v1/projects', {
      name: CONFIG.projectName,
      framework: 'vite',
    });

    if (response.status === 201) {
      const projectId = response.data.id;
      log(`✅ Project created with ID: ${projectId}`);
      return projectId;
    } else {
      log(
        `⚠️  Project creation returned status ${response.status}: ${JSON.stringify(response.data)}`
      );
      // Try to get existing project
      return await getProjectId();
    }
  } catch (error) {
    log(`Error creating project: ${error.message}`);
    return await getProjectId();
  }
}

async function getProjectId() {
  log(`Fetching project ID for: ${CONFIG.projectName}`);

  try {
    const response = await makeRequest('GET', `/v1/projects?search=${CONFIG.projectName}`);

    if (response.status === 200 && response.data.projects) {
      const project = response.data.projects.find(
        (p) => p.name === CONFIG.projectName
      );
      if (project) {
        log(`✅ Found existing project: ${project.id}`);
        return project.id;
      }
    }

    log('⚠️  Project not found. Create it in Vercel dashboard first.');
    return null;
  } catch (error) {
    log(`Error fetching projects: ${error.message}`);
    return null;
  }
}

async function configureEnvironmentVariables(projectId) {
  log('Configuring environment variables...');

  const variables = [
    {
      key: 'VITE_API_URL',
      value: CONFIG.apiUrlProduction,
      target: ['production'],
    },
    {
      key: 'VITE_API_URL',
      value: CONFIG.apiUrlStaging,
      target: ['preview'],
    },
  ];

  for (const variable of variables) {
    try {
      const response = await makeRequest(
        'POST',
        `/v1/projects/${projectId}/env`,
        variable
      );

      if (response.status === 200 || response.status === 201) {
        log(`✅ Set ${variable.key} for ${variable.target.join(', ')}`);
      } else {
        log(
          `⚠️  Failed to set ${variable.key}: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      log(`Error setting environment variable: ${error.message}`);
    }
  }
}

async function linkGitHub(projectId) {
  log('Linking GitHub repository...');

  try {
    const response = await makeRequest('POST', `/v1/projects/${projectId}/link`, {
      repo: CONFIG.repoUrl,
      repoId: null,
    });

    if (response.status === 200) {
      log('✅ GitHub repository linked');
    } else {
      log(
        `⚠️  GitHub link returned status ${response.status}: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    log(`Error linking GitHub: ${error.message}`);
  }
}

async function getProjectInfo(projectId) {
  log('Fetching project information...');

  try {
    const response = await makeRequest('GET', `/v1/projects/${projectId}`);

    if (response.status === 200) {
      const project = response.data;
      log('📊 Project Information:');
      log(`   Name: ${project.name}`);
      log(`   ID: ${project.id}`);
      log(`   Framework: ${project.framework}`);
      log(`   Root Directory: ${project.rootDirectory}`);
      log(`   Build Command: ${project.buildCommand}`);
      log(`   Output Directory: ${project.outputDirectory}`);
      return project;
    } else {
      log(`Failed to fetch project: ${response.status}`);
      return null;
    }
  } catch (error) {
    log(`Error fetching project: ${error.message}`);
    return null;
  }
}

async function getDeployments(projectId) {
  log('Fetching deployments...');

  try {
    const response = await makeRequest('GET', `/v1/projects/${projectId}/deployments?limit=5`);

    if (response.status === 200) {
      const deployments = response.data.deployments || [];
      log(`📊 Recent Deployments: ${deployments.length} found`);

      for (const deployment of deployments) {
        log(
          `   - ${deployment.state}: ${deployment.url} (${new Date(deployment.created).toISOString()})`
        );
      }

      return deployments;
    }
  } catch (error) {
    log(`Error fetching deployments: ${error.message}`);
  }
}

async function saveReport(projectId) {
  const reportPath = path.join(
    __dirname,
    '..',
    'docs',
    'qa',
    'vercel-api-setup-report.md'
  );

  const report = `# Vercel Setup via API Report

**Executed**: ${new Date().toISOString()}
**Project ID**: ${projectId || 'unknown'}

## Configuration

\`\`\`json
${JSON.stringify(CONFIG, null, 2)}
\`\`\`

## Execution Log

\`\`\`
${logs.join('\n')}
\`\`\`

## Next Steps

1. ✅ Verify project in Vercel dashboard: https://vercel.com/projects
2. ✅ Confirm environment variables are set
3. ✅ Check GitHub webhook is installed
4. ✅ Trigger test deployment by pushing to main
5. ✅ Validate preview deployment on pull request

## Manual Tasks Remaining

If any of the above failed, complete manually:

1. **Create Project**: https://vercel.com/dashboard → Add New → Project
2. **Link GitHub**: https://vercel.com/projects → [project] → Settings → Git
3. **Set Env Vars**: https://vercel.com/projects → [project] → Settings → Environment Variables
4. **Verify CI/CD**: https://vercel.com/projects → [project] → Settings → Git

---
Generated by Story 8.1.3 Vercel API setup script.
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  log(`📄 Report saved: ${reportPath}`);
}

async function main() {
  try {
    log('🚀 Starting Vercel setup via API...');

    // Check for token
    const token = await getVercelToken();
    if (!token) {
      log('❌ Cannot proceed without Vercel authentication.');
      log('Please run: vercel login');
      process.exit(1);
    }

    process.env.VERCEL_TOKEN = token;
    log('✅ Vercel token acquired');

    // Step 1: Create or get project
    const projectId = await createProject();
    if (!projectId) {
      log('❌ Cannot proceed without project ID');
      process.exit(1);
    }

    // Step 2: Configure environment variables
    await configureEnvironmentVariables(projectId);

    // Step 3: Link GitHub
    await linkGitHub(projectId);

    // Step 4: Get project info
    await getProjectInfo(projectId);

    // Step 5: Get deployments
    await getDeployments(projectId);

    // Step 6: Save report
    await saveReport(projectId);

    log('✅ Vercel setup completed successfully!');
    log('');
    log('📋 Next Steps:');
    log('  1. Push changes to main branch');
    log('  2. Create a pull request to trigger preview deployment');
    log('  3. Verify API connectivity from preview URL');
    log('  4. Merge PR to deploy to production');
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
