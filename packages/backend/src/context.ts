import { Database } from 'better-sqlite3';
import { CacheService } from './services/cache.service';

/**
 * AppContext: Singleton container for app-wide services
 * Provides access to database and cache service
 */
export class AppContext {
  private static instance: AppContext;
  private db: Database | null = null;
  private cache: CacheService | null = null;

  private constructor() {}

  static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }
    return AppContext.instance;
  }

  setDatabase(db: Database): void {
    this.db = db;
  }

  getDatabase(): Database | null {
    return this.db;
  }

  setCache(cache: CacheService): void {
    this.cache = cache;
  }

  getCache(): CacheService | null {
    return this.cache;
  }
}

export const appContext = AppContext.getInstance();
