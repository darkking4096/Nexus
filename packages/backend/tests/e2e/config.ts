/**
 * E2E Test Configuration
 * Environment-specific settings for Playwright tests
 */

export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  environment: 'local' | 'staging' | 'preview' | 'production';
  timeouts: {
    navigation: number;
    api: number;
    assertion: number;
  };
  retries: {
    maxAttempts: number;
    delayMs: number;
  };
}

/**
 * Environment configurations
 */
const configs: Record<string, TestConfig> = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001',
    supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    supabaseKey: process.env.SUPABASE_KEY || 'local-test-key',
    environment: 'local',
    timeouts: {
      navigation: 30000, // 30 seconds
      api: 10000, // 10 seconds
      assertion: 5000, // 5 seconds
    },
    retries: {
      maxAttempts: 3,
      delayMs: 1000,
    },
  },

  staging: {
    baseUrl: process.env.STAGING_FRONTEND_URL || 'https://staging.nexus.example.com',
    apiUrl: process.env.STAGING_API_URL || 'https://staging-api.nexus.example.com',
    supabaseUrl: process.env.STAGING_SUPABASE_URL || 'https://staging-project.supabase.co',
    supabaseKey: process.env.STAGING_SUPABASE_KEY || '',
    environment: 'staging',
    timeouts: {
      navigation: 40000, // 40 seconds (slower network)
      api: 15000, // 15 seconds
      assertion: 10000, // 10 seconds
    },
    retries: {
      maxAttempts: 5,
      delayMs: 2000,
    },
  },

  preview: {
    baseUrl:
      process.env.VERCEL_PREVIEW_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.VERCEL_API_URL || process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001',
    supabaseUrl: process.env.SUPABASE_URL || 'https://project.supabase.co',
    supabaseKey: process.env.SUPABASE_KEY || '',
    environment: 'preview',
    timeouts: {
      navigation: 35000, // 35 seconds
      api: 12000, // 12 seconds
      assertion: 7000, // 7 seconds
    },
    retries: {
      maxAttempts: 4,
      delayMs: 1500,
    },
  },

  production: {
    baseUrl: 'https://nexus.example.com',
    apiUrl: 'https://api.nexus.example.com',
    supabaseUrl: process.env.PRODUCTION_SUPABASE_URL || 'https://project.supabase.co',
    supabaseKey: process.env.PRODUCTION_SUPABASE_KEY || '',
    environment: 'production',
    timeouts: {
      navigation: 45000, // 45 seconds
      api: 20000, // 20 seconds
      assertion: 10000, // 10 seconds
    },
    retries: {
      maxAttempts: 3,
      delayMs: 1000,
    },
  },
};

/**
 * Get configuration for current environment
 */
export function getConfig(): TestConfig {
  // Determine environment
  const env = (process.env.TEST_ENV || process.env.ENVIRONMENT || 'local').toLowerCase();

  // Try to get exact match first
  if (configs[env]) {
    return configs[env];
  }

  // Try to infer from environment variables
  if (process.env.VERCEL_ENV === 'production') {
    return configs.production;
  }

  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_PREVIEW_URL) {
    return configs.preview;
  }

  // Check if URLs look like staging
  if (
    process.env.PLAYWRIGHT_BASE_URL?.includes('staging') ||
    process.env.PLAYWRIGHT_API_URL?.includes('staging')
  ) {
    return configs.staging;
  }

  // Default to local
  return configs.local;
}

/**
 * Validate configuration
 */
export function validateConfig(config: TestConfig): string[] {
  const errors: string[] = [];

  if (!config.baseUrl) {
    errors.push('baseUrl is required');
  }

  if (!config.apiUrl) {
    errors.push('apiUrl is required');
  }

  if (config.environment !== 'local' && !config.supabaseKey) {
    errors.push(`supabaseKey is required for ${config.environment} environment`);
  }

  return errors;
}

/**
 * Log configuration (safe version without secrets)
 */
export function logConfig(config: TestConfig): void {
  console.log('📋 Test Configuration:');
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Supabase: ${config.supabaseUrl.split('//')[1]}`);
  console.log(`   Navigation Timeout: ${config.timeouts.navigation}ms`);
  console.log(`   Max Retries: ${config.retries.maxAttempts}`);
}
