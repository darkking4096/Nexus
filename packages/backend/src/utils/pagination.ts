/**
 * Pagination: Helpers for implementing pagination in queries
 * Prevents N+1 issues and reduces memory usage for large result sets
 */

export interface PaginationParams {
  page?: number; // 1-based page number
  limit?: number; // Results per page
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(
  query: PaginationParams,
  maxLimit: number = 100,
  defaultLimit: number = 20
): { limit: number; offset: number } {
  let page = query.page || 1;
  let limit = query.limit || defaultLimit;

  // Validate page number
  if (page < 1) page = 1;

  // Validate and cap limit (prevent abuse)
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { limit, offset };
}

/**
 * Build paginated response
 */
export function buildPaginationResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginationResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Example usage in a route:
 *
 * router.get('/profiles', async (req, res) => {
 *   const { limit, offset } = parsePaginationParams(req.query);
 *
 *   // Get total count (without offset/limit)
 *   const countStmt = db.prepare('SELECT COUNT(*) as count FROM profiles');
 *   const { count: total } = countStmt.get() as { count: number };
 *
 *   // Get paginated results
 *   const stmt = db.prepare(
 *     'SELECT * FROM profiles ORDER BY id DESC LIMIT ? OFFSET ?'
 *   );
 *   const data = stmt.all(limit, offset) as Profile[];
 *
 *   const page = Math.floor(offset / limit) + 1;
 *   res.json(buildPaginationResponse(data, page, limit, total));
 * });
 *
 * Response:
 * {
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 250,
 *     "totalPages": 13,
 *     "hasMore": true
 *   }
 * }
 */
