import { chromium, Browser, Page } from 'playwright';
import { humanDelay } from '../utils/retry.js';

/**
 * Playwright-based Instagram browser automation
 * Provides realistic user behavior to avoid bot detection
 */

export interface PublishResult {
  postId: string;
  url: string;
  timestamp: string;
}

export class PlaywrightService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private headless: boolean;

  constructor(headless: boolean = true) {
    this.headless = headless;
  }

  /**
   * Initialize browser and load session cookies
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: this.headless,
      });

      this.page = await this.browser.newPage();

      // Set viewport to realistic size (not always 1920x1080)
      const viewportSizes = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 },
      ];
      const randomViewport = viewportSizes[Math.floor(Math.random() * viewportSizes.length)];
      await this.page.setViewportSize(randomViewport);

      // Navigate to Instagram
      await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
    } catch (error) {
      await this.close();
      throw new Error(`Failed to initialize browser: ${String(error)}`);
    }
  }

  /**
   * Load Instagram session cookies from decrypted session data
   * Session data is the serialized instagrapi client state
   */
  async loadSession(sessionJson: Record<string, unknown>): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // Extract cookies from Instagrapi session data
      const cookies = (sessionJson.cookies as Record<string, unknown>) || {};
      const cookieArray = Object.entries(cookies).map(([name, value]) => ({
        name,
        value: String(value),
        domain: '.instagram.com',
        path: '/',
      }));

      // Add cookies to browser context if available
      if (cookieArray.length > 0) {
        await this.page.context().addCookies(cookieArray);
      }

      // Navigate to Instagram with restored session
      await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });

      // Verify session is valid by checking if login page appears
      const loginButton = await this.page.$('a:has-text("Log in")');
      if (loginButton) {
        throw new Error('Session cookies invalid or expired - would require re-login');
      }
    } catch (error) {
      throw new Error(`Failed to load session: ${String(error)}`);
    }
  }

  /**
   * Publish a photo to Instagram feed
   *
   * @param imagePath Local file path to image
   * @param caption Post caption/description
   * @returns Post ID and Instagram URL
   */
  async publishPhoto(imagePath: string, caption: string): Promise<PublishResult> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // Navigate to home
      await this.navigateToHome();

      // Click "Create" button or "+" icon
      // NOTE: Instagram selectors change frequently - verify if UI changes
      // Selector matches the native Instagram create button (top navigation)
      const createButtonSelector = '[aria-label="Create"]';
      await this.clickWithDelay(createButtonSelector);

      // Upload image
      const fileInput = await this.page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('File input not found - Instagram UI may have changed');
      }
      await fileInput.setInputFiles(imagePath);
      await humanDelay(2000, 4000);

      // Wait for image to process
      await this.page.waitForTimeout(3000);

      // Click "Next" button
      await this.clickWithDelay('button:has-text("Next")');
      await humanDelay(1000, 2000);

      // Add caption
      const captionSelector = 'textarea[aria-label="Write a caption..."]';
      await this.typeWithDelay(captionSelector, caption);
      await humanDelay(1000, 3000);

      // Click "Share" button
      await this.clickWithDelay('button:has-text("Share")');

      // Wait for post to be published and redirect
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      await humanDelay(2000, 5000);

      // Extract post ID from URL
      const url = this.page.url();
      const postIdMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/);
      const postId = postIdMatch ? postIdMatch[1] : 'unknown';

      return {
        postId,
        url: `https://www.instagram.com/p/${postId}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to publish photo: ${String(error)}`);
    }
  }

  /**
   * Publish a carousel (multiple images) to Instagram feed
   *
   * @param imagePaths Array of local file paths
   * @param caption Post caption
   * @returns Post ID and Instagram URL
   */
  async publishCarousel(imagePaths: string[], caption: string): Promise<PublishResult> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // Navigate to home
      await this.navigateToHome();

      // Click "Create" button
      await this.clickWithDelay('[aria-label="Create"]');

      // Click "Select multiple" or carousel option
      await this.clickWithDelay('button:has-text("Select multiple")');
      await humanDelay(1000, 2000);

      // Upload all images
      const fileInput = await this.page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('File input not found');
      }

      await fileInput.setInputFiles(imagePaths);
      await humanDelay(3000, 5000);

      // Wait for images to process
      await this.page.waitForTimeout(5000);

      // Click "Next"
      await this.clickWithDelay('button:has-text("Next")');
      await humanDelay(1000, 2000);

      // Add caption
      const captionSelector = 'textarea[aria-label="Write a caption..."]';
      await this.typeWithDelay(captionSelector, caption);
      await humanDelay(1000, 3000);

      // Click "Share"
      await this.clickWithDelay('button:has-text("Share")');

      // Wait for post
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      await humanDelay(2000, 5000);

      // Extract post ID
      const url = this.page.url();
      const postIdMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/);
      const postId = postIdMatch ? postIdMatch[1] : 'unknown';

      return {
        postId,
        url: `https://www.instagram.com/p/${postId}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to publish carousel: ${String(error)}`);
    }
  }

  /**
   * Navigate to Instagram home/feed
   */
  async navigateToHome(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
    await humanDelay(1000, 2000);
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.page) {
      try {
        await this.page.close();
      } catch (e) {
        console.error('Error closing page:', e);
      }
    }

    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }

    this.page = null;
    this.browser = null;
  }

  /**
   * Click element with human-realistic delay
   */
  private async clickWithDelay(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    // Random mouse movement before click
    const element = await this.page.$(selector);
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await humanDelay(100, 500);
      }
    }

    await this.page.click(selector);
    await humanDelay(500, 2000);
  }

  /**
   * Type text with human-realistic delays between characters
   */
  private async typeWithDelay(selector: string, text: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.focus(selector);
    await humanDelay(300, 1000);

    // Type character by character with delays (more human-like than instant typing)
    for (const char of text) {
      await this.page.keyboard.type(char);
      await humanDelay(50, 200); // 50-200ms between chars
    }

    await humanDelay(500, 1500);
  }
}
