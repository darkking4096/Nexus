import { test as base, Page } from '@playwright/test';
import * as helpers from './helpers';
import { testUsers, createUniqueTestUser, TestUser } from '../fixtures/test-data';

/**
 * Extended test fixture with common utilities
 */

export interface TestContext {
  // Browser utilities
  page: Page;
  helpers: typeof helpers;

  // API utilities
  api: {
    request: (method: string, url: string, options?: any) => Promise<any>;
    baseUrl: string;
  };

  // Authentication
  auth: {
    login: (email: string, password: string) => Promise<string>; // Returns token
    logout: () => Promise<void>;
    currentToken: () => Promise<string | null>;
  };

  // Test data management
  testData: {
    createUser: (overrides?: Partial<TestUser>) => Promise<TestUser & { id: string }>;
    deleteUser: (userId: string) => Promise<void>;
    clearAllData: () => Promise<void>;
  };

  // Performance measurement
  perf: {
    markStart: (name: string) => void;
    markEnd: (name: string) => void;
    measure: (name: string) => number;
  };
}

export const test = base.extend<TestContext>({
  helpers: async ({}, use) => {
    await use(helpers);
  },

  api: async ({ page }, use) => {
    const baseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001';

    const api = {
      baseUrl,
      async request(method: string, url: string, options?: any) {
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json().catch(() => ({}));
        return {
          status: response.status,
          body: data,
        };
      },
    };

    await use(api);
  },

  auth: async ({ page, api }, use) => {
    const auth = {
      async login(email: string, password: string): Promise<string> {
        const response = await api.request('POST', '/api/auth/login', {
          body: { email, password },
        });

        if (response.status !== 200) {
          throw new Error(`Login failed: ${response.body.message}`);
        }

        const token = response.body.token;
        if (token) {
          await helpers.setAuthToken(page, token);
        }

        return token;
      },

      async logout(): Promise<void> {
        await helpers.clearStorage(page);
      },

      async currentToken(): Promise<string | null> {
        return helpers.getAuthToken(page);
      },
    };

    await use(auth);
  },

  testData: async ({ api, auth }, use) => {
    const testData = {
      async createUser(overrides?: Partial<TestUser>) {
        const userData = createUniqueTestUser(overrides);

        const response = await api.request('POST', '/api/users/register', {
          body: userData,
        });

        if (response.status !== 201) {
          throw new Error(
            `Failed to create test user: ${response.body.message}`
          );
        }

        return {
          ...userData,
          id: response.body.id,
        };
      },

      async deleteUser(userId: string) {
        const response = await api.request('DELETE', `/api/users/${userId}`);

        if (response.status !== 200) {
          throw new Error(
            `Failed to delete test user: ${response.body.message}`
          );
        }
      },

      async clearAllData() {
        // Call cleanup endpoint if available
        try {
          await api.request('POST', '/api/test/cleanup');
        } catch {
          console.warn('Test data cleanup failed - continuing anyway');
        }
      },
    };

    await use(testData);
  },

  perf: async ({}, use) => {
    const marks: Record<string, number> = {};

    const perf = {
      markStart(name: string) {
        marks[`${name}-start`] = performance.now();
      },

      markEnd(name: string) {
        marks[`${name}-end`] = performance.now();
      },

      measure(name: string): number {
        const start = marks[`${name}-start`];
        const end = marks[`${name}-end`];

        if (start === undefined || end === undefined) {
          throw new Error(
            `Performance marks not found for "${name}". Did you call markStart/markEnd?`
          );
        }

        return end - start;
      },
    };

    await use(perf);
  },
});

export { expect } from '@playwright/test';
