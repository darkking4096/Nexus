import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * K6 Load Testing Script
 * Simulates 100 concurrent users for 5 minutes
 * Validates performance targets
 *
 * Run with: k6 run load-test.js
 * Or with options: k6 run --vus 100 --duration 5m load-test.js
 */

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up: 0 → 20 users over 1 minute
    { duration: '3m', target: 100 },  // Ramp up: 20 → 100 users over 3 minutes
    { duration: '2m', target: 100 },  // Stay: 100 users for 2 minutes
    { duration: '2m', target: 0 },    // Ramp down: 100 → 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95th percentile < 500ms, 99th < 1s
    'errors': ['rate<0.1'],                           // Error rate < 10%
    'http_req_failed': ['rate<0.05'],                 // Failed requests < 5%
  },
};

const BASE_URL = 'http://localhost:5000';
const DASHBOARD_URL = `${BASE_URL}/api/dashboard/overview`;

export default function () {
  group('Dashboard Performance Test', () => {
    // Test dashboard endpoint (most critical)
    const dashResponse = http.get(DASHBOARD_URL, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'dashboard' },
    });

    const dashSuccess = check(dashResponse, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
      'dashboard response has data': (r) => r.body.includes('profiles'),
    });

    errorRate.add(!dashSuccess);
    apiResponseTime.add(dashResponse.timings.duration, { endpoint: 'dashboard' });

    sleep(1);
  });

  group('API Compression Test', () => {
    // Test with gzip acceptance to validate compression
    const compResponse = http.get(DASHBOARD_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      tags: { name: 'compression' },
    });

    const compSuccess = check(compResponse, {
      'compression status is 200': (r) => r.status === 200,
      'response has compression': (r) => r.headers['Content-Encoding'] === 'gzip',
    });

    errorRate.add(!compSuccess);
    apiResponseTime.add(compResponse.timings.duration, { endpoint: 'compression' });

    sleep(1);
  });

  group('Cache Validation', () => {
    // Make two requests to same endpoint (should hit cache on second)
    const req1 = http.get(DASHBOARD_URL, {
      tags: { name: 'cache-first' },
    });

    const cacheFirstTime = req1.timings.duration;

    sleep(0.5); // Short delay between requests

    const req2 = http.get(DASHBOARD_URL, {
      tags: { name: 'cache-hit' },
    });

    const cacheHitTime = req2.timings.duration;

    check(req2, {
      'cache hit response time < first request': (r) =>
        cacheHitTime < cacheFirstTime * 0.9, // Cache should be ~90% faster
    });

    apiResponseTime.add(cacheHitTime, { endpoint: 'cache-hit' });

    sleep(1);
  });

  group('Query Performance Test', () => {
    // Test multiple queries to validate index usage
    const queryEndpoints = [
      `${BASE_URL}/api/profiles`,
      `${BASE_URL}/api/content`,
      `${BASE_URL}/api/analytics`,
    ];

    queryEndpoints.forEach(endpoint => {
      const response = http.get(endpoint, {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'query' },
      });

      const success = check(response, {
        'query status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401, // 401 expected without auth
        'query response time < 500ms': (r) => r.timings.duration < 500,
      });

      errorRate.add(!success);
      apiResponseTime.add(response.timings.duration, { endpoint: endpoint.split('/').pop() });

      sleep(0.5);
    });
  });
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'dist/load-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;

  let summary = '\n📊 LOAD TEST RESULTS\n';
  summary += '═'.repeat(60) + '\n';

  // HTTP metrics
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `Response Times:\n`;
    summary += `${indent}Mean: ${duration.mean?.toFixed(0)}ms\n`;
    summary += `${indent}P95: ${duration['p(95)']?.toFixed(0)}ms\n`;
    summary += `${indent}P99: ${duration['p(99)']?.toFixed(0)}ms\n`;
  }

  // Error metrics
  if (data.metrics.errors) {
    const errors = data.metrics.errors.value;
    summary += `\nError Rate: ${(errors * 100).toFixed(2)}%\n`;
  }

  // Check thresholds
  summary += '\nThreshold Results:\n';
  Object.entries(data.thresholds || {}).forEach(([threshold, result]) => {
    const status = result.ok ? '✅' : '❌';
    summary += `${indent}${status} ${threshold}\n`;
  });

  return summary;
}
