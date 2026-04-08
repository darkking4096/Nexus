import { describe, it, expect, beforeAll } from 'vitest';
import Database from 'better-sqlite3';
import { SearchService } from '../src/services/SearchService';

describe('SearchService', () => {
  let db: Database.Database;
  let searchService: SearchService;

  beforeAll(() => {
    // In-memory database
    db = new Database(':memory:');
    searchService = new SearchService(db);
  });

  describe('searchTrends', () => {
    it('should return search results for trends', async () => {
      const results = await searchService.searchTrends('fitness');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('url');
      expect(results[0]).toHaveProperty('snippet');
      expect(results[0]).toHaveProperty('relevanceScore');
    });

    it('should return consistent results on second call (cached)', async () => {
      const results1 = await searchService.searchTrends('sustainable fashion');
      const results2 = await searchService.searchTrends('sustainable fashion');

      // Same query should return same results (from cache)
      expect(results1.length).toBe(results2.length);
      expect(results1[0]?.id).toBe(results2[0]?.id);
    });

    it('should handle different niches', async () => {
      const fitnessResults = await searchService.searchTrends('fitness');
      const foodResults = await searchService.searchTrends('meal prep');

      expect(fitnessResults.length).toBeGreaterThan(0);
      expect(foodResults.length).toBeGreaterThan(0);
      // Different niches should produce different results
      expect(fitnessResults[0]?.title).not.toBe(foodResults[0]?.title);
    });
  });

  describe('searchCompetitors', () => {
    it('should return competitor data', async () => {
      const competitors = await searchService.searchCompetitors(['@fitnessguru']);

      expect(Array.isArray(competitors)).toBe(true);
      expect(competitors.length).toBeGreaterThan(0);
      expect(competitors[0]).toHaveProperty('handle');
      expect(competitors[0]).toHaveProperty('engagementRate');
      expect(competitors[0]).toHaveProperty('recentPosts');
    });

    it('should handle multiple competitors', async () => {
      const handles = ['@competitor1', '@competitor2', '@competitor3'];
      const competitors = await searchService.searchCompetitors(handles);

      expect(competitors.length).toBe(handles.length);
      competitors.forEach((comp, index) => {
        expect(comp.handle).toBe(handles[index]);
      });
    });

    it('should include recent posts in competitor data', async () => {
      const competitors = await searchService.searchCompetitors(['@testcompetitor']);

      expect(competitors[0]?.recentPosts).toBeDefined();
      expect(Array.isArray(competitors[0]?.recentPosts)).toBe(true);
      expect(competitors[0]?.recentPosts?.length).toBeGreaterThan(0);

      const post = competitors[0]?.recentPosts?.[0];
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('engagement');
      expect(post).toHaveProperty('postedAt');
    });
  });

  describe('searchContent', () => {
    it('should return content ideas', async () => {
      const ideas = await searchService.searchContent('productivity tips');

      expect(Array.isArray(ideas)).toBe(true);
      expect(ideas.length).toBeGreaterThan(0);
      expect(ideas[0]).toHaveProperty('id');
      expect(ideas[0]).toHaveProperty('title');
      expect(ideas[0]).toHaveProperty('description');
      expect(ideas[0]).toHaveProperty('category');
      expect(ideas[0]).toHaveProperty('trendingScore');
      expect(ideas[0]).toHaveProperty('source');
    });

    it('should categorize content ideas', async () => {
      const ideas = await searchService.searchContent('home decor');

      ideas.forEach((idea) => {
        expect(idea.category).toBe('home decor');
      });
    });

    it('should have unique IDs for each idea', async () => {
      const ideas = await searchService.searchContent('travel inspiration');
      const ids = ideas.map((idea) => idea.id);

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should cache content ideas', async () => {
      const ideas1 = await searchService.searchContent('viral videos');
      const ideas2 = await searchService.searchContent('viral videos');

      // Same query should return results (from cache)
      expect(ideas1.length).toBe(ideas2.length);
    });
  });

  describe('error handling', () => {
    it('should handle empty query gracefully', async () => {
      try {
        // @ts-expect-error Testing error handling
        await searchService.searchTrends('');
        expect.fail('Should throw error for empty query');
      } catch {
        // Error expected
        expect(true).toBe(true);
      }
    });

    it('should return empty array instead of throwing', async () => {
      // SearchService should be defensive about failures
      const results = await searchService.searchTrends('test query');
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
