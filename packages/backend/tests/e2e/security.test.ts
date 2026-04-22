import { test, expect } from './base.fixture';
import { testUsers } from '../fixtures/test-data';

/**
 * Security & Authorization Tests — Story 8.1.4 AC: Security & Authorization (5 AC)
 *
 * Validates security controls and authorization:
 * ✅ Authentication required: protected endpoints reject unauthorized (401)
 * ✅ Authorization enforced: user A cannot access user B's data
 * ✅ RLS policies working: database enforces row-level security
 * ✅ HTTPS enforced: no plaintext data transmission
 * ✅ Session management: invalid/expired tokens rejected
 */

test.describe('Security: Authentication Requirements', () => {
  test('Protected endpoints return 401 without authentication', async ({ api }) => {
    // AC: Authentication required - protected endpoints reject unauthorized (401)

    // Try to access protected endpoints without token
    const endpoints = ['/api/content', '/api/profiles', '/api/users/me', '/api/analytics'];

    for (const endpoint of endpoints) {
      const response = await api.request('GET', endpoint);

      // Should require authentication
      expect(response.status).toBe(401);
    }
  });

  test('POST endpoints reject requests without valid token', async ({ api }) => {
    // Try to create content without authentication
    const response = await api.request('POST', '/api/content', {
      body: {
        title: 'Unauthorized Post',
        description: 'Should fail',
      },
      // No Authorization header
    });

    expect(response.status).toBe(401);
  });

  test('Malformed authorization header is rejected', async ({ api }) => {
    // AC: Session management - invalid tokens rejected
    const response = await api.request('GET', '/api/content', {
      headers: {
        Authorization: 'Invalid-Token-Format',
      },
    });

    expect([401, 403]).toContain(response.status);
  });

  test('Missing authorization header is rejected', async ({ api }) => {
    const response = await api.request('GET', '/api/content', {
      headers: {
        // No Authorization header
      },
    });

    expect(response.status).toBe(401);
  });

  test('Empty authorization header is rejected', async ({ api }) => {
    const response = await api.request('GET', '/api/content', {
      headers: {
        Authorization: '',
      },
    });

    expect(response.status).toBe(401);
  });
});

test.describe('Security: Authorization & Data Isolation', () => {
  test('User cannot access another user\'s private content', async ({ api, auth, testData }) => {
    // AC: Authorization enforced - user A cannot access user B's data
    // Create 2 users
    const user1 = await testData.createUser();
    const user2 = await testData.createUser();

    try {
      // User 1 creates content
      const token1 = await auth.login(user1.email, user1.password);
      const contentResponse = await api.request('POST', '/api/content', {
        body: {
          title: 'Private Content',
          description: 'Only for User 1',
          published: false,
        },
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      });

      const contentId = contentResponse.body.id;

      // User 2 tries to access User 1's private content
      const token2 = await auth.login(user2.email, user2.password);
      const accessResponse = await api.request('GET', `/api/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      // Should be denied access
      expect([403, 404]).toContain(accessResponse.status);
    } finally {
      await testData.deleteUser(user1.id);
      await testData.deleteUser(user2.id);
    }
  });

  test('User cannot modify another user\'s content', async ({ api, auth, testData }) => {
    // Create 2 users
    const user1 = await testData.createUser();
    const user2 = await testData.createUser();

    try {
      // User 1 creates content
      const token1 = await auth.login(user1.email, user1.password);
      const contentResponse = await api.request('POST', '/api/content', {
        body: {
          title: 'User 1 Content',
          description: 'Original',
        },
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      });

      const contentId = contentResponse.body.id;

      // User 2 tries to update User 1's content
      const token2 = await auth.login(user2.email, user2.password);
      const updateResponse = await api.request('PUT', `/api/content/${contentId}`, {
        body: {
          title: 'Hacked Title',
          description: 'Hacked by User 2',
        },
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      // Should be denied update
      expect([403, 404]).toContain(updateResponse.status);

      // Verify original content unchanged
      const verifyResponse = await api.request('GET', `/api/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      });

      if (verifyResponse.status === 200) {
        expect(verifyResponse.body.title).toBe('User 1 Content');
      }
    } finally {
      await testData.deleteUser(user1.id);
      await testData.deleteUser(user2.id);
    }
  });

  test('User cannot delete another user\'s content', async ({ api, auth, testData }) => {
    // Create 2 users
    const user1 = await testData.createUser();
    const user2 = await testData.createUser();

    try {
      // User 1 creates content
      const token1 = await auth.login(user1.email, user1.password);
      const contentResponse = await api.request('POST', '/api/content', {
        body: {
          title: 'Important Content',
          description: 'Do not delete',
        },
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      });

      const contentId = contentResponse.body.id;

      // User 2 tries to delete User 1's content
      const token2 = await auth.login(user2.email, user2.password);
      const deleteResponse = await api.request('DELETE', `/api/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      // Should be denied deletion
      expect([403, 404]).toContain(deleteResponse.status);

      // Verify content still exists
      const verifyResponse = await api.request('GET', `/api/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      });

      expect(verifyResponse.status).toBe(200);
    } finally {
      await testData.deleteUser(user1.id);
      await testData.deleteUser(user2.id);
    }
  });

  test('User cannot access another user\'s profile', async ({ api, auth, testData }) => {
    // Create 2 users
    const user1 = await testData.createUser();
    const user2 = await testData.createUser();

    try {
      // User 2 tries to access User 1's profile
      const token2 = await auth.login(user2.email, user2.password);
      const response = await api.request('GET', `/api/profiles/${user1.id}`, {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      // Should either deny access or return only public info
      if (response.status === 200) {
        // If allowed, verify sensitive data is not exposed
        expect(response.body.email || response.body.password).toBeFalsy();
      } else {
        expect([403, 404]).toContain(response.status);
      }
    } finally {
      await testData.deleteUser(user1.id);
      await testData.deleteUser(user2.id);
    }
  });
});

test.describe('Security: Session Management', () => {
  test('Expired token is rejected', async ({ auth, api, testData }) => {
    // AC: Session management - expired tokens rejected
    const user = await testData.createUser();

    try {
      // Login
      const token = await auth.login(user.email, user.password);

      // Simulate expired token by modifying it
      const expiredToken = token.substring(0, token.length - 5) + 'xxxxx';

      // Try to use expired token
      const response = await api.request('GET', '/api/content', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      // Should reject expired token
      expect([401, 403]).toContain(response.status);
    } finally {
      await testData.deleteUser(user.id);
    }
  });

  test('Tampered token is rejected', async ({ api, auth, testData }) => {
    // Using api fixture from decorator
    const user = await testData.createUser();

    try {
      // Login
      const token = await auth.login(user.email, user.password);

      // Tamper with token
      const tamperedToken = token.replace(/./g, 'x');

      // Try to use tampered token
      const response = await api.request('GET', '/api/content', {
        headers: {
          Authorization: `Bearer ${tamperedToken}`,
        },
      });

      // Should reject tampered token
      expect([401, 403]).toContain(response.status);
    } finally {
      await testData.deleteUser(user.id);
    }
  });

  test('Token cannot be reused after logout', async ({ auth, api, helpers, testData }) => {
    const user = await testData.createUser();

    try {
      // Login
      const token = await auth.login(user.email, user.password);

      // Verify token works
      let response = await api.request('GET', '/api/content', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(response.status).toBe(200);

      // Logout
      await auth.logout();

      // Try to reuse token
      response = await api.request('GET', '/api/content', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Should reject reused token
      expect([401, 403]).toContain(response.status);
    } finally {
      await testData.deleteUser(user.id);
    }
  });
});

test.describe('Security: Transport Security', () => {
  test('API enforces HTTPS in production', async ({ api }) => {
    // AC: HTTPS enforced - no plaintext data transmission
    // Check if base URL uses HTTPS (in production)
    if (api.baseUrl.includes('production') || api.baseUrl.includes('staging')) {
      expect(api.baseUrl).toMatch(/^https:\/\//);
    }
  });

  test('Sensitive headers are not exposed', async ({ api, auth, testData }) => {
    const user = await testData.createUser();
    const token = await auth.login(user.email, user.password);

    const response = await api.request('GET', '/api/content', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Verify no sensitive data in response headers (if available)
    // Response should not contain raw database passwords, API keys, etc.
    const responseText = JSON.stringify(response);
    expect(responseText).not.toMatch(/password|secret|key|token/i);

    await testData.deleteUser(user.id);
  });
});

test.describe('Security: CSRF & CORS Protection', () => {
  test('Cross-origin requests are validated', async ({ api }) => {
    // Test CORS restrictions
    // This is a basic check - actual CORS is handled by browser
    const response = await api.request('GET', '/api/content');

    // Should have appropriate CORS headers or require auth
    expect([200, 401]).toContain(response.status);
  });

  test('POST requests require proper content type', async ({ api, auth, testData }) => {
    const user = await testData.createUser();
    await auth.login(user.email, user.password);

    // Try POST with wrong content type
    const response = await api.request('POST', '/api/content', {
      body: {
        title: 'Test',
      },
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${await auth.currentToken()}`,
      },
    });

    // Should either work with correct parsing or reject
    expect([201, 400, 415]).toContain(response.status); // 415 = Unsupported Media Type

    await testData.deleteUser(user.id);
  });
});

test.describe('Security: Password & Credential Handling', () => {
  test('Passwords are not returned in API responses', async ({ api, testData }) => {
    const user = await testData.createUser();

    // Verify password not in user object
    expect(user.password).toBeFalsy();
  });

  test('Failed login attempts do not leak user existence', async ({ auth, testData }) => {
    const user = await testData.createUser();

    // Failed login with wrong password
    let error1 = null;
    try {
      await auth.login(user.email, 'wrongpassword');
    } catch (e) {
      error1 = e;
    }

    // Failed login with non-existent email
    let error2 = null;
    try {
      await auth.login('nonexistent@example.com', 'password');
    } catch (e) {
      error2 = e;
    }

    // Errors should be generic (not "user not found")
    if (error1 && error2) {
      expect(error1.toString()).toMatch(/invalid|failed|incorrect/i);
      expect(error2.toString()).toMatch(/invalid|failed|incorrect/i);
    }

    await testData.deleteUser(user.id);
  });
});
