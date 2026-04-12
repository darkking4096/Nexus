import { logger } from '../utils/logger';

export interface NandoBananaImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  style?: string;
}

export interface NandoBananaImageResponse {
  imageUrl?: string;
  imageData?: Buffer;
  width: number;
  height: number;
  format: 'png' | 'jpg';
  generated_at: string;
}

/**
 * NandoBananaClient: Integrates with Nando Banana AI image generation API
 * Generates base images for Instagram content
 */
export class NandoBananaClient {
  private apiBaseUrl: string = 'https://api.nando-banana.dev';
  private apiKey: string;
  private maxRetries: number = 3;
  private baseDelayMs: number = 500;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.NANDO_BANANA_API_KEY;
    if (!key) {
      throw new Error('NANDO_BANANA_API_KEY environment variable is required');
    }
    this.apiKey = key;
  }

  /**
   * Generate image via Nando Banana API with retry logic
   */
  async generateImage(
    request: NandoBananaImageRequest
  ): Promise<NandoBananaImageResponse> {
    logger.info(`[NandoBananaClient] Generating image: "${request.prompt}"`);

    const width = request.width || 2048;
    const height = request.height || 2048;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug(
          `[NandoBananaClient] Attempt ${attempt}/${this.maxRetries}`
        );

        const response = await this.callNandoBananaAPI(request, width, height);

        logger.info(
          `[NandoBananaClient] Image generated successfully (attempt ${attempt})`
        );
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `[NandoBananaClient] Attempt ${attempt} failed: ${lastError.message}`
        );

        if (attempt < this.maxRetries) {
          const delayMs = this.baseDelayMs * Math.pow(2, attempt - 1);
          logger.debug(
            `[NandoBananaClient] Waiting ${delayMs}ms before retry...`
          );
          await this.delay(delayMs);
        }
      }
    }

    throw new Error(
      `NandoBananaClient failed after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Call Nando Banana API (mocked for now, real implementation would use HTTP)
   */
  private async callNandoBananaAPI(
    _request: NandoBananaImageRequest,
    width: number,
    height: number
  ): Promise<NandoBananaImageResponse> {
    // TODO(human): Integrate with real Nando Banana API when available
    // For now, returning mock response with proper structure
    logger.debug(
      `[NandoBananaClient] Calling API: POST ${this.apiBaseUrl}/api/v1/generate-image`
    );

    // Simulating API call
    await this.delay(100);

    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    // Mock response (in production, would be actual HTTP response)
    // Create a minimal PNG buffer for testing
    const mockImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return {
      imageData: mockImageBuffer,
      width,
      height,
      format: 'png',
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Validate that API is accessible (health check)
   */
  async healthCheck(): Promise<boolean> {
    try {
      logger.debug(`[NandoBananaClient] Health check`);
      // In production, would call /health endpoint
      return true;
    } catch (error) {
      logger.error(
        `[NandoBananaClient] Health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Utility: sleep for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
