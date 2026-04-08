/**
 * CompetitorService
 * Handles competitor data fetching and management
 */
export class CompetitorService {
  /**
   * Validate Instagram username format
   */
  static validateInstagramUsername(username: string): boolean {
    // Instagram usernames must be 1-30 characters, alphanumeric + underscore + period
    const instagramRegex = /^[a-zA-Z0-9_.]{1,30}$/;
    return instagramRegex.test(username);
  }

  /**
   * Fetch competitor data from Instagram
   * (In production, would integrate with Instagram API)
   */
  static async fetchCompetitorData(
    username: string
  ): Promise<{ followers_count: number; top_posts: unknown[] }> {
    // Mock implementation for now
    // In production, this would call Instagram API or a service like Apify
    console.log(`Fetching data for @${username}...`);

    // Return mock data
    return {
      followers_count: Math.floor(Math.random() * 100000) + 1000,
      top_posts: [],
    };
  }

  /**
   * Parse competitor data for storage
   */
  static formatCompetitorData(data: { followers_count: number; top_posts: unknown[] }): {
    followers_count: number;
    top_posts_data: string;
  } {
    return {
      followers_count: data.followers_count,
      top_posts_data: JSON.stringify(data.top_posts),
    };
  }
}
