import { Page, expect } from '@playwright/test';

/**
 * E2E Test Helpers and Utilities
 * Reusable functions for common test operations
 */

/**
 * Wait for element and get text
 */
export async function getElementText(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<string> {
  const element = await page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  return element.textContent() || '';
}

/**
 * Fill form input with clear + type
 */
export async function fillInput(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const input = page.locator(selector);
  await input.fill(''); // Clear first
  await input.type(value, { delay: 50 }); // Type with human-like delay
}

/**
 * Click button and wait for navigation
 */
export async function clickAndNavigate(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  await Promise.all([page.waitForNavigation({ timeout }), page.click(selector)]);
}

/**
 * Wait for API response matching condition
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 5000
): Promise<Response> {
  return page.waitForResponse((response) => {
    if (typeof urlPattern === 'string') {
      return response.url().includes(urlPattern);
    }
    return urlPattern.test(response.url());
  }, { timeout });
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element is hidden
 */
export async function isHidden(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'hidden', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract table data into array of objects
 */
export async function extractTableData(
  page: Page,
  tableSelector: string
): Promise<Record<string, string>[]> {
  const rows = page.locator(`${tableSelector} tbody tr`);
  const count = await rows.count();
  const data: Record<string, string>[] = [];

  for (let i = 0; i < count; i++) {
    const cells = rows.nth(i).locator('td');
    const cellCount = await cells.count();
    const row: Record<string, string> = {};

    for (let j = 0; j < cellCount; j++) {
      const text = await cells.nth(j).textContent();
      row[`col_${j}`] = text || '';
    }

    data.push(row);
  }

  return data;
}

/**
 * Take screenshot with automatic timestamping
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/e2e/screenshots/${name}-${timestamp}.png`,
  });
}

/**
 * Assert element has specific text (case-insensitive)
 */
export async function assertHasText(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toContainText(text, { ignoreCase: true });
}

/**
 * Get all text contents from elements matching selector
 */
export async function getAllTexts(page: Page, selector: string): Promise<string[]> {
  const elements = page.locator(selector);
  const count = await elements.count();
  const texts: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = await elements.nth(i).textContent();
    if (text) texts.push(text);
  }

  return texts;
}

/**
 * Handle browser dialog (alert, confirm, prompt)
 */
export async function handleDialog(
  page: Page,
  action: 'accept' | 'dismiss' = 'accept',
  inputText?: string
): Promise<void> {
  page.once('dialog', async (dialog) => {
    if (inputText && dialog.type() === 'prompt') {
      await dialog.accept(inputText);
    } else if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * Measure element visibility (for performance testing)
 */
export async function measureElementVisibility(
  page: Page,
  selector: string
): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await page.locator(selector).boundingBox();
  if (!box) {
    throw new Error(`Element ${selector} not found or not visible`);
  }
  return box;
}

/**
 * Wait for multiple elements to be visible
 */
export async function waitForElements(
  page: Page,
  selectors: string[],
  timeout = 5000
): Promise<void> {
  await Promise.all(
    selectors.map((selector) =>
      page.locator(selector).waitFor({ state: 'visible', timeout })
    )
  );
}

/**
 * Retry helper for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options = { maxAttempts: 3, delayMs: 1000 }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < options.maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Get API token from localStorage
 */
export async function getAuthToken(page: Page, key = 'authToken'): Promise<string | null> {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

/**
 * Set API token in localStorage
 */
export async function setAuthToken(page: Page, token: string, key = 'authToken'): Promise<void> {
  await page.evaluate(
    ({ storageKey, tokenValue }) => localStorage.setItem(storageKey, tokenValue),
    { storageKey: key, tokenValue: token }
  );
}

/**
 * Clear all localStorage
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => sessionStorage.clear());
}

/**
 * Make API request directly (bypass UI)
 */
export async function apiRequest(
  page: Page,
  method: string,
  url: string,
  options?: { headers?: Record<string, string>; body?: unknown }
): Promise<Response> {
  return page.evaluate(
    async ({ method: m, url: u, opts }) => {
      const response = await fetch(u, {
        method: m,
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      });
      return {
        status: response.status,
        statusText: response.statusText,
        body: await response.json().catch(() => null),
      };
    },
    { method, url, opts: options }
  );
}
