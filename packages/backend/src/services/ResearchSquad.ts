import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { ProfileData } from '../models/Profile.js';

/**
 * Generic content record for analysis
 */
export type ContentRecord = Record<string, unknown>;

/**
 * Research output structure
 */
export interface CompetitorData {
  username: string;
  followers_count?: number;
  top_posts: string[];
}

export interface TrendData {
  trend: string;
  relevance_score: number;
  description: string;
}

export interface PostHistoryAnalysis {
  total_posts: number;
  avg_engagement: number;
  top_posts: Array<{
    caption: string;
    engagement: number;
  }>;
  patterns: string[];
}

export interface VoiceAnalysis {
  tone: string;
  audience: string;
  key_themes: string[];
  language_style: string;
}

export interface ResearchResult {
  competitors: CompetitorData[];
  trends: TrendData[];
  history: PostHistoryAnalysis;
  voice_analysis: VoiceAnalysis;
  insights: string[];
}

/**
 * Marketing Instagram Squad orchestrator
 * Calls Claude API with agent prompts to run research pipeline
 */
export class ResearchSquad {
  private client: Anthropic;
  private agentsDir: string;
  private model: string;

  constructor(agentsDir?: string, model?: string) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({ apiKey });
    this.agentsDir = agentsDir || path.join(process.cwd(), '../../squads/marketing-instagram-squad/agents');
    this.model = model || process.env.RESEARCH_MODEL || 'claude-sonnet-4-5-20251001';
  }

  /**
   * Run complete research pipeline for a profile
   *
   * @param profile Profile data to analyze
   * @param contentHistory Recent posts and engagement metrics
   * @returns Complete research result
   */
  async runResearch(profile: ProfileData, contentHistory: ContentRecord[]): Promise<ResearchResult> {
    // Phase 1: Voice & Tone Analysis (profile-strategist)
    const voiceAnalysis = await this.runProfileStrategist(profile);

    // Phase 2: Trend Research (trend-researcher)
    const trends = await this.runTrendResearcher(profile);

    // Phase 3: Performance Analysis (analytics-agent)
    const history = await this.runAnalyticsAgent(contentHistory);

    // Phase 4: Content Planning (content-planner)
    const contentInsights = await this.runContentPlanner(
      profile,
      voiceAnalysis,
      trends,
      history
    );

    return {
      competitors: [],      // Placeholder: would be extracted from trend-researcher
      trends,
      history,
      voice_analysis: voiceAnalysis,
      insights: contentInsights,
    };
  }

  /**
   * Phase 1: Profile Strategist — Voice & Tone Analysis
   */
  private async runProfileStrategist(profile: ProfileData): Promise<VoiceAnalysis> {
    const systemPrompt = this.loadAgentPrompt('profile-strategist');

    const userMessage = `
Analyze this Instagram profile and extract voice, tone, and communication style:

Profile: @${profile.instagram_username}
Bio: ${profile.bio || '(no bio)'}
Followers: ${profile.followers_count}

Context Voice (if set): ${profile.context_voice || 'not set'}
Context Tone (if set): ${profile.context_tone || 'not set'}
Context Audience (if set): ${profile.context_audience || 'not set'}

Provide a structured analysis with:
1. Overall tone (e.g., professional, casual, humorous, inspirational)
2. Target audience description
3. Key themes and values
4. Language style characteristics

Format as JSON: { "tone": "...", "audience": "...", "key_themes": [...], "language_style": "..." }
    `;

    const response = await this.runAgent(systemPrompt, userMessage);

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as VoiceAnalysis;
      }
    } catch (e) {
      console.error('Failed to parse voice analysis:', e);
    }

    // Fallback
    return {
      tone: 'unknown',
      audience: 'general',
      key_themes: [],
      language_style: 'unknown',
    };
  }

  /**
   * Phase 2: Trend Researcher — Web Search & Trend Analysis
   * NOTE: EXA integration stubbed for now (TODO(exa-integration))
   */
  private async runTrendResearcher(profile: ProfileData): Promise<TrendData[]> {
    const systemPrompt = this.loadAgentPrompt('trend-researcher');

    const userMessage = `
Research trending topics and hashtags relevant to @${profile.instagram_username} (${profile.instagram_username}).

Bio: ${profile.bio || 'general'}

Provide top trending topics in this niche with:
1. Trend name
2. Relevance score (0-10)
3. Brief description

Format as JSON array: [{ "trend": "...", "relevance_score": 9, "description": "..." }, ...]

TODO(exa-integration): EXA web search integration not yet implemented.
For now, base recommendations on the profile bio and follower count.
    `;

    const response = await this.runAgent(systemPrompt, userMessage);

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as TrendData[];
      }
    } catch (e) {
      console.error('Failed to parse trends:', e);
    }

    return [];
  }

  /**
   * Phase 3: Analytics Agent — Performance Pattern Analysis
   */
  private async runAnalyticsAgent(contentHistory: ContentRecord[]): Promise<PostHistoryAnalysis> {
    const systemPrompt = this.loadAgentPrompt('analytics-agent');

    const userMessage = `
Analyze this content history and extract performance patterns:

Posts (last 30): ${JSON.stringify(contentHistory.slice(0, 30), null, 2)}

Provide analysis with:
1. Total posts analyzed
2. Average engagement (likes/comments)
3. Top 3 performing posts with captions
4. Identified patterns (timing, format, caption length, hashtags, etc.)

Format as JSON: {
  "total_posts": N,
  "avg_engagement": X.X,
  "top_posts": [{ "caption": "...", "engagement": N }, ...],
  "patterns": ["pattern1", "pattern2", ...]
}
    `;

    const response = await this.runAgent(systemPrompt, userMessage);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as PostHistoryAnalysis;
      }
    } catch (e) {
      console.error('Failed to parse analytics:', e);
    }

    return {
      total_posts: contentHistory.length,
      avg_engagement: 0,
      top_posts: [],
      patterns: [],
    };
  }

  /**
   * Phase 4: Content Planner — Insights & Recommendations
   */
  private async runContentPlanner(
    profile: ProfileData,
    voiceAnalysis: VoiceAnalysis,
    trends: TrendData[],
    history: PostHistoryAnalysis
  ): Promise<string[]> {
    const systemPrompt = this.loadAgentPrompt('content-planner');

    const userMessage = `
Create content strategy recommendations based on:

Profile: @${profile.instagram_username} (${profile.followers_count} followers)
Voice: ${voiceAnalysis.tone}
Audience: ${voiceAnalysis.audience}
Key Themes: ${voiceAnalysis.key_themes.join(', ')}

Trending Topics: ${trends.map((t) => t.trend).join(', ') || 'none identified'}

Performance Patterns: ${history.patterns.join(', ')}

Provide 5-7 specific, actionable content recommendations that:
1. Align with the profile's voice and audience
2. Leverage trending topics
3. Follow performance patterns
4. Suggest content gaps

Format as JSON array of strings: ["recommendation 1", "recommendation 2", ...]
    `;

    const response = await this.runAgent(systemPrompt, userMessage);

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as string[];
      }
    } catch (e) {
      console.error('Failed to parse insights:', e);
    }

    return [];
  }

  /**
   * Run a single agent call to Claude API
   */
  private async runAgent(systemPrompt: string, userMessage: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      // Extract text from response
      if (response.content[0].type === 'text') {
        return response.content[0].text;
      }

      throw new Error('Unexpected response type from Claude API');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Agent call failed: ${errorMsg}`);
    }
  }

  /**
   * Load agent prompt from markdown file
   */
  private loadAgentPrompt(agentName: string): string {
    const filePath = path.join(this.agentsDir, `${agentName}.md`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.warn(`Failed to load agent prompt ${agentName}:`, error);
      // Return fallback prompt
      return `You are the ${agentName} agent. Provide expert analysis on the given topic.`;
    }
  }
}
