/**
 * Test Data Fixtures for E2E Testing
 * Reusable test data for users, content, profiles, etc.
 */

export interface TestUser {
  id?: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

export interface TestContent {
  id?: string;
  title: string;
  description: string;
  userId?: string;
  tags?: string[];
  published?: boolean;
}

export interface TestProfile {
  id?: string;
  userId?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
}

/**
 * Test user fixtures
 */
export const testUsers = {
  admin: {
    email: 'admin@nexus.test',
    password: 'Admin@123456!',
    name: 'Admin User',
    role: 'admin' as const,
  },
  regularUser: {
    email: 'user@nexus.test',
    password: 'User@123456!',
    name: 'Regular User',
    role: 'user' as const,
  },
  guestUser: {
    email: 'guest@nexus.test',
    password: 'Guest@123456!',
    name: 'Guest User',
    role: 'guest' as const,
  },
  alternateUser: {
    email: 'alternate@nexus.test',
    password: 'Alternate@123456!',
    name: 'Alternate User',
    role: 'user' as const,
  },
};

/**
 * Test content fixtures
 */
export const testContent = {
  basicPost: {
    title: 'Test Post Title',
    description: 'This is a test post description',
    tags: ['test', 'automation'],
    published: true,
  },
  draftPost: {
    title: 'Draft Post Title',
    description: 'This is a draft post',
    tags: ['draft'],
    published: false,
  },
  complexPost: {
    title: 'Complex Post with Special Characters: @#$%^&*()',
    description: 'Description with <html> & "quotes" and \'apostrophes\'',
    tags: ['special', 'characters', 'test'],
    published: true,
  },
  longPost: {
    title: 'Long Post Title',
    description: `This is a very long post description that contains multiple sentences and paragraphs.
    It includes various types of content to test rendering and storage.
    The description should handle line breaks, special formatting, and extended text.
    ${Array(50).fill('Lorem ipsum dolor sit amet. ').join('')}`,
    tags: ['long', 'content'],
    published: true,
  },
};

/**
 * Test profile fixtures
 */
export const testProfiles = {
  minimal: {
    bio: 'A test user',
  },
  complete: {
    bio: 'Complete test profile with all fields',
    avatar: 'https://example.com/avatar.jpg',
    socialLinks: {
      twitter: 'https://twitter.com/testuser',
      instagram: 'https://instagram.com/testuser',
      github: 'https://github.com/testuser',
    },
  },
  withSpecialChars: {
    bio: 'Bio with special chars: @#$%^&*()',
    socialLinks: {
      website: 'https://example.com?param=value&other=123',
    },
  },
};

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}.${timestamp}.${random}@nexus.test`;
}

/**
 * Generate unique test username
 */
export function generateTestUsername(prefix = 'user'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Create a unique test user
 */
export function createUniqueTestUser(
  overrides?: Partial<TestUser>
): TestUser {
  const email = generateTestEmail();
  return {
    email,
    password: 'Test@12345!',
    name: generateTestUsername(),
    role: 'user',
    ...overrides,
  };
}

/**
 * Create a unique test content
 */
export function createUniqueTestContent(
  overrides?: Partial<TestContent>
): TestContent {
  const timestamp = Date.now();
  return {
    title: `Test Content ${timestamp}`,
    description: `Generated test content at ${new Date().toISOString()}`,
    tags: ['generated', 'test'],
    published: true,
    ...overrides,
  };
}

/**
 * Create a unique test profile
 */
export function createUniqueTestProfile(
  overrides?: Partial<TestProfile>
): TestProfile {
  return {
    bio: `Test profile created at ${new Date().toISOString()}`,
    ...overrides,
  };
}

/**
 * Invalid input fixtures for edge case testing
 */
export const invalidInputs = {
  xssPayloads: [
    '<script>alert("xss")</script>',
    '<img src=x onerror="alert(\'xss\')">',
    'javascript:alert("xss")',
    '<svg onload="alert(\'xss\')">',
  ],
  sqlInjectionPayloads: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT * FROM passwords --",
    "admin'--",
  ],
  invalidEmails: [
    'not-an-email',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    '',
  ],
  invalidPasswords: [
    '123', // Too short
    'nouppercase123!', // Missing uppercase
    'NOLOWERCASE123!', // Missing lowercase
    'NoSpecial123', // Missing special character
    '           ', // Only spaces
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '%2e%2e%2fetc%2fpasswd',
  ],
};

/**
 * Performance testing data
 */
export const performanceTestData = {
  smallPayload: {
    title: 'Small content',
    description: 'Short description',
  },
  largePayload: {
    title: 'Large content title',
    description: Array(1000).fill('Lorem ipsum dolor sit amet. ').join(''),
  },
  batchSize: {
    small: 10,
    medium: 50,
    large: 100,
  },
};

/**
 * Timing expectations (milliseconds)
 */
export const performanceTargets = {
  apiLatency: {
    fast: 100, // 100ms
    normal: 500, // 500ms
    slow: 1000, // 1 second
  },
  pageLoad: {
    fast: 1000, // 1 second
    normal: 2500, // 2.5 seconds
    slow: 5000, // 5 seconds
  },
  databaseQuery: {
    fast: 100, // 100ms
    normal: 500, // 500ms
    slow: 1000, // 1 second
  },
};
