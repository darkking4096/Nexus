import Database from 'better-sqlite3';
import { ResearchService } from '../services/ResearchService.js';
import { SearchService } from '../services/SearchService.js';
import { ResearchResult } from '../services/ResearchSquad.js';

/**
 * Research output with metadata
 */
export interface ResearchOutput {
  profileId: string;
  userId: string;
  research: ResearchResult;
  searchContext: {
    trendsSearched: boolean;
    competitorsSearched: boolean;
  };
  cachedAt: string;
  expiresAt: string;
}

/**
 * Research Orchestrator — Combines Research + Search + Instagrapi data
 * Coordinates multiple research sources with caching and error handling
 */
export class ResearchOrchestrator {
  private researchService: ResearchService;
  private searchService: SearchService;
  private cache: Map<string, { data: ResearchOutput; timestamp: number }> = new Map();
  private cacheMaxAge = 24 * 60 * 60 * 1000; // 24 hours

  constructor(db: Database.Database, squadsDir?: string) {
    this.researchService = new ResearchService(db, squadsDir);
    this.searchService = new SearchService(db);
  }

  /**
   * Run complete research orchestration for a profile
   * Combines research squad analysis + web search + Instagrapi data
   *
   * @param profileId Profile to research
   * @param userId User ID (for ownership check)
   * @returns Complete research output with metadata
   * @throws Error if research fails after retries
   */
  async orchestrate(profileId: string, userId: string): Promise<ResearchOutput> {
    // Check cache first
    const cacheKey = `research:${profileId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 1. Get base research from squad (profile analysis + voice/tone/trends)
      const baseResearch = await this.researchService.runResearch(profileId, userId);

      // 2. Extract niche from trends or use bio as fallback
      const niche = baseResearch.trends[0]?.trend || 'general';

      // 3. Enrich with web search data
      let trendsSearched = false;
      let competitorsSearched = false;

      try {
        // Search for additional trends to supplement squad analysis
        const webTrends = await this.searchService.searchTrends(niche);
        if (webTrends.length > 0) {
          baseResearch.trends.push(
            ...webTrends.slice(0, 3).map((result) => ({
              trend: result.title,
              relevance_score: result.relevanceScore,
              description: result.snippet,
            }))
          );
          trendsSearched = true;
        }
      } catch (error) {
        console.warn('[ResearchOrchestrator] Trends enrichment failed:', error);
      }

      try {
        // Search for competitor data
        const competitors = await this.searchService.searchCompetitors([
          `${niche}_competitor_1`,
          `${niche}_competitor_2`,
        ]);
        baseResearch.competitors.push(
          ...competitors.map((comp) => ({
            username: comp.handle,
            followers_count: comp.followersEstimate,
            top_posts: comp.recentPosts?.map((p) => p.content) || [],
          }))
        );
        competitorsSearched = true;
      } catch (error) {
        console.warn('[ResearchOrchestrator] Competitors search failed:', error);
      }

      // 4. Package with metadata
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.cacheMaxAge);

      const output: ResearchOutput = {
        profileId,
        userId,
        research: baseResearch,
        searchContext: {
          trendsSearched,
          competitorsSearched,
        },
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // 5. Cache and return
      this.setCache(cacheKey, output);
      return output;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Research orchestration failed: ${msg}`);
    }
  }

  /**
   * Invalidate cache for a profile
   */
  invalidateCache(profileId: string): void {
    const cacheKey = `research:${profileId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Get cached research if valid
   */
  private getFromCache(key: string): ResearchOutput | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Cache research output
   */
  private setCache(key: string, data: ResearchOutput): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

/**
 * Helper function to create orchestrator with proper DI
 */
export function createResearchOrchestrator(
  db: Database.Database,
  squadsDir?: string
): ResearchOrchestrator {
  return new ResearchOrchestrator(db, squadsDir);
}
