import { logger } from './logger';

/**
 * QueryAnalyzer: Detects N+1 query patterns and performance issues
 * Logs query execution with timing information for debugging
 */
export class QueryAnalyzer {
  private queryLog: Array<{
    sql: string;
    params?: unknown[];
    duration: number;
    timestamp: number;
  }> = [];

  private readonly SLOW_QUERY_THRESHOLD_MS = 500;

  /**
   * Log a query execution
   */
  logQuery(sql: string, duration: number, params?: unknown[]): void {
    this.queryLog.push({
      sql: this.normalizeSql(sql),
      params,
      duration,
      timestamp: Date.now(),
    });

    // Warn if query is slow
    if (duration > this.SLOW_QUERY_THRESHOLD_MS) {
      logger.warn(
        `[QueryAnalyzer] SLOW QUERY (${duration}ms): ${this.normalizeSql(sql)}`
      );
    }

    // Debug log for all queries
    logger.debug(`[QueryAnalyzer] Query (${duration}ms): ${this.normalizeSql(sql)}`);
  }

  /**
   * Detect potential N+1 query patterns
   */
  detectN1Patterns(): {
    detected: boolean;
    patterns: Array<{
      sql: string;
      count: number;
      totalTime: number;
    }>;
  } {
    const patterns: Map<string, { count: number; totalTime: number }> = new Map();

    // Group queries by normalized SQL
    this.queryLog.forEach(query => {
      const key = query.sql;
      const existing = patterns.get(key);

      if (existing) {
        existing.count++;
        existing.totalTime += query.duration;
      } else {
        patterns.set(key, { count: 1, totalTime: query.duration });
      }
    });

    // Find potential N+1 patterns (same query executed 10+ times)
    const n1Patterns = Array.from(patterns.entries())
      .filter(([_, data]) => data.count >= 10)
      .map(([sql, data]) => ({
        sql,
        count: data.count,
        totalTime: data.totalTime,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      detected: n1Patterns.length > 0,
      patterns: n1Patterns,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    totalQueries: number;
    totalTime: number;
    slowQueries: number;
    averageQueryTime: number;
    n1Detected: boolean;
  } {
    const totalTime = this.queryLog.reduce((sum, q) => sum + q.duration, 0);
    const slowQueries = this.queryLog.filter(
      q => q.duration > this.SLOW_QUERY_THRESHOLD_MS
    ).length;

    const n1Analysis = this.detectN1Patterns();

    return {
      totalQueries: this.queryLog.length,
      totalTime,
      slowQueries,
      averageQueryTime: this.queryLog.length > 0 ? totalTime / this.queryLog.length : 0,
      n1Detected: n1Analysis.detected,
    };
  }

  /**
   * Clear query log (e.g., between test cases)
   */
  clear(): void {
    this.queryLog = [];
  }

  /**
   * Get full query log
   */
  getLog() {
    return [...this.queryLog];
  }

  /**
   * Normalize SQL for comparison (remove whitespace variations)
   */
  private normalizeSql(sql: string): string {
    return sql
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .substring(0, 100); // First 100 chars for grouping
  }

  /**
   * Format report for logging
   */
  formatReport(): string {
    const report = this.generateReport();
    const n1Analysis = this.detectN1Patterns();

    let output = '\n📊 QUERY ANALYSIS REPORT\n';
    output += '═'.repeat(50) + '\n';
    output += `Total Queries: ${report.totalQueries}\n`;
    output += `Total Time: ${report.totalTime}ms\n`;
    output += `Average Query Time: ${report.averageQueryTime.toFixed(2)}ms\n`;
    output += `Slow Queries (>${this.SLOW_QUERY_THRESHOLD_MS}ms): ${report.slowQueries}\n`;

    if (n1Analysis.detected) {
      output += '\n⚠️ POTENTIAL N+1 PATTERNS DETECTED:\n';
      n1Analysis.patterns.forEach(pattern => {
        output += `- ${pattern.sql} (executed ${pattern.count} times, ${pattern.totalTime}ms total)\n`;
      });
    } else {
      output += '\n✅ No N+1 patterns detected\n';
    }

    return output;
  }
}

// Singleton instance
let analyzerInstance: QueryAnalyzer | null = null;

export function getQueryAnalyzer(): QueryAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new QueryAnalyzer();
  }
  return analyzerInstance;
}
