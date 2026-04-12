import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

export interface CopywriterRequest {
  captionType: 'hook' | 'teaser' | 'cta';
  brandVoice: string;
  brandTone: 'casual' | 'profissional' | 'viral';
  targetAudience: string;
  insights?: string[];
  framework?: {
    framework: string;
    structure?: Record<string, string>;
  };
}

export interface CopywriterResponse {
  caption: string;
  rationale: string;
  confidenceScore: number;
}

/**
 * CopywriterClient: Integrates with @copywriter agent via Claude API
 * Uses persuasion frameworks: AIDA, 5 Levels of Awareness, Value Equation
 */
export class CopywriterClient {
  private anthropic: Anthropic;
  private maxRetries: number = 3;
  private baseDelayMs: number = 500;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.anthropic = new Anthropic({ apiKey: key });
  }

  /**
   * Generate caption using @copywriter agent frameworks
   */
  async generateCaption(request: CopywriterRequest): Promise<CopywriterResponse> {
    logger.info(
      `[CopywriterClient] Requesting ${request.captionType} caption (tone: ${request.brandTone})`
    );

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug(`[CopywriterClient] Attempt ${attempt}/${this.maxRetries}`);

        const message = await this.anthropic.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        const responseText =
          message.content[0]?.type === 'text' ? message.content[0].text : '';

        if (!responseText) {
          throw new Error('Empty response from Claude API');
        }

        // Parse response (expect JSON with caption and rationale)
        const parsed = this.parseResponse(responseText);

        logger.info(
          `[CopywriterClient] Caption generated successfully (attempt ${attempt})`
        );
        return parsed;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `[CopywriterClient] Attempt ${attempt} failed: ${lastError.message}`
        );

        if (attempt < this.maxRetries) {
          const delayMs = this.baseDelayMs * Math.pow(2, attempt - 1);
          logger.debug(`[CopywriterClient] Waiting ${delayMs}ms before retry...`);
          await this.delay(delayMs);
        }
      }
    }

    throw new Error(
      `CopywriterClient failed after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Build system prompt with @copywriter frameworks
   */
  private buildSystemPrompt(request: CopywriterRequest): string {
    return `You are the @copywriter agent from the marketing-instagram-squad. You write persuasive Instagram captions using proven frameworks:

**Frameworks:**
1. **AIDA:** Attention → Interest → Desire → Action (Gary Halbert)
2. **5 Levels of Awareness:** Adapt copy for audience knowledge level (Eugene Schwartz)
3. **Value Equation:** Maximize (Dream Outcome + Likelihood) / (Time Delay + Effort) (Alex Hormozi)
4. **Emotional Triggers:** Integrate awe, aspiration, curiosity, urgency, or empathy

**Brand Voice:** ${request.brandVoice}
**Brand Tone (${request.brandTone}}):**
${this.getToneGuidance(request.brandTone)}

**Target Audience:** ${request.targetAudience}

**Requirements:**
- Character limit: 50-150 characters (excluding hashtags)
- NO blocked words: "click here", "buy now", "free money", "guaranteed"
- Include 3-5 relevant hashtags
- Focus on benefits, not features
- Write in 2nd person ("you", not "people")
- Conversational, not corporate

**Output Format:**
Respond ONLY with a JSON object:
{
  "caption": "Your full caption with hashtags",
  "rationale": "Why this works (1-2 sentences)",
  "confidenceScore": 85
}`;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(request: CopywriterRequest): string {
    let prompt = `Create a ${request.captionType} caption.\n`;

    if (request.framework) {
      prompt += `\nRecommended Framework: ${request.framework.framework}`;
      if (request.framework.structure) {
        prompt += `\nStructure:\n${Object.entries(request.framework.structure)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n')}`;
      }
    }

    if (request.insights && request.insights.length > 0) {
      prompt += `\nKey Insights:\n${request.insights.map((i) => `- ${i}`).join('\n')}`;
    }

    prompt += `\n\nRespond with ONLY a valid JSON object (no markdown, no extra text).`;

    return prompt;
  }

  /**
   * Get tone-specific guidance
   */
  private getToneGuidance(tone: 'casual' | 'profissional' | 'viral'): string {
    const toneGuides = {
      casual:
        'Friendly, conversational, use emojis, light CTAs, relatable examples. Goal: Build community and trust.',
      profissional:
        'Formal language, no emojis, direct CTAs, data-driven insights. Goal: Establish thought leadership.',
      viral:
        'Provocative, FOMO-inducing, surprising, challenge expectations. Goal: Maximum reach and shareability.',
    };
    return toneGuides[tone];
  }

  /**
   * Parse Claude response (expect JSON)
   */
  private parseResponse(text: string): CopywriterResponse {
    try {
      // Try to extract JSON from response (in case of markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.caption || typeof parsed.caption !== 'string') {
        throw new Error('Invalid caption field');
      }

      if (!parsed.rationale || typeof parsed.rationale !== 'string') {
        throw new Error('Invalid rationale field');
      }

      if (
        parsed.confidenceScore === undefined ||
        typeof parsed.confidenceScore !== 'number'
      ) {
        throw new Error('Invalid confidenceScore field');
      }

      return {
        caption: parsed.caption.trim(),
        rationale: parsed.rationale.trim(),
        confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
      };
    } catch (error) {
      logger.error(
        `[CopywriterClient] Parse error: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Failed to parse copywriter response: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Utility: sleep for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
