/**
 * Test Data Seeding and Cleanup
 * Populates and clears test data for E2E tests
 */

import { testUsers, testContent, testProfiles } from '../fixtures/test-data';

interface SeededUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SetupContext {
  apiUrl: string;
  seededUsers: SeededUser[];
  seededContent: string[];
}

/**
 * Initialize test data seeding context
 */
export async function setupContext(apiUrl: string): Promise<SetupContext> {
  return {
    apiUrl,
    seededUsers: [],
    seededContent: [],
  };
}

/**
 * Seed test users (admin, user, guest roles)
 */
export async function seedUsers(context: SetupContext): Promise<SeededUser[]> {
  console.log('🌱 Seeding test users...');

  const usersToCreate = [
    { ...testUsers.admin, email: `admin.${Date.now()}@nexus.test` },
    { ...testUsers.regularUser, email: `user.${Date.now()}@nexus.test` },
    { ...testUsers.guestUser, email: `guest.${Date.now()}@nexus.test` },
  ];

  const seededUsers: SeededUser[] = [];

  for (const userData of usersToCreate) {
    try {
      const response = await fetch(`${context.apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create user ${userData.email}: ${error.message}`);
      }

      const user = await response.json();
      seededUsers.push({
        id: user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });

      console.log(`  ✓ Created ${userData.role} user: ${userData.email}`);
    } catch (error) {
      console.error(`  ✗ Failed to seed user ${userData.email}:`, error);
      throw error;
    }
  }

  context.seededUsers = seededUsers;
  return seededUsers;
}

/**
 * Seed test content (posts, articles, etc)
 */
export async function seedContent(context: SetupContext): Promise<string[]> {
  if (context.seededUsers.length === 0) {
    throw new Error('No users seeded - seed users first');
  }

  console.log('🌱 Seeding test content...');

  const primaryUserId = context.seededUsers[0].id; // Use admin user
  const contentToCreate = [
    testContent.basicPost,
    testContent.draftPost,
    testContent.complexPost,
  ];

  const seededIds: string[] = [];

  // Login as admin to get token
  let token = '';
  try {
    const loginResponse = await fetch(`${context.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: context.seededUsers[0].email,
        password: testUsers.admin.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login admin user for content seeding');
    }

    const loginData = await loginResponse.json();
    token = loginData.token;
  } catch (error) {
    console.warn('  ⚠️  Could not authenticate for content seeding:', error);
    return seededIds;
  }

  // Create content
  for (const contentData of contentToCreate) {
    try {
      const response = await fetch(`${context.apiUrl}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...contentData,
          userId: primaryUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create content: ${error.message}`);
      }

      const content = await response.json();
      seededIds.push(content.id);

      console.log(`  ✓ Created content: ${contentData.title}`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to seed content:`, error);
      // Continue with other content even if one fails
    }
  }

  context.seededContent = seededIds;
  return seededIds;
}

/**
 * Seed user profiles
 */
export async function seedProfiles(context: SetupContext): Promise<void> {
  if (context.seededUsers.length === 0) {
    throw new Error('No users seeded - seed users first');
  }

  console.log('🌱 Seeding user profiles...');

  // Login to get token
  let token = '';
  try {
    const loginResponse = await fetch(`${context.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: context.seededUsers[0].email,
        password: testUsers.admin.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login for profile seeding');
    }

    const loginData = await loginResponse.json();
    token = loginData.token;
  } catch (error) {
    console.warn('  ⚠️  Could not authenticate for profile seeding:', error);
    return;
  }

  // Update profiles for each user
  for (const user of context.seededUsers) {
    try {
      const profile = testProfiles.complete;
      const response = await fetch(`${context.apiUrl}/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        console.log(`  ✓ Updated profile for: ${user.email}`);
      }
    } catch (error) {
      console.warn(`  ⚠️  Failed to update profile for ${user.email}:`, error);
    }
  }
}

/**
 * Clean up all test data
 */
export async function cleanupTestData(context: SetupContext): Promise<void> {
  console.log('🧹 Cleaning up test data...');

  // Delete content
  if (context.seededContent.length > 0) {
    for (const contentId of context.seededContent) {
      try {
        await fetch(`${context.apiUrl}/api/content/${contentId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn(`  ⚠️  Failed to delete content ${contentId}`);
      }
    }
    console.log(`  ✓ Deleted ${context.seededContent.length} content items`);
  }

  // Delete users
  if (context.seededUsers.length > 0) {
    for (const user of context.seededUsers) {
      try {
        await fetch(`${context.apiUrl}/api/users/${user.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn(`  ⚠️  Failed to delete user ${user.email}`);
      }
    }
    console.log(`  ✓ Deleted ${context.seededUsers.length} users`);
  }

  context.seededUsers = [];
  context.seededContent = [];
}

/**
 * Full setup: seed all test data
 */
export async function setupAllTestData(apiUrl: string): Promise<SetupContext> {
  console.log('\n🚀 Starting test data seeding...\n');

  const context = await setupContext(apiUrl);

  try {
    await seedUsers(context);
    await seedContent(context);
    await seedProfiles(context);

    console.log('\n✅ Test data seeding complete\n');
    console.log(`📊 Seeded ${context.seededUsers.length} users`);
    console.log(`📊 Seeded ${context.seededContent.length} content items\n`);

    return context;
  } catch (error) {
    console.error('\n❌ Test data seeding failed:', error);
    throw error;
  }
}

/**
 * Export seeded data for test access
 */
export function getSeededTestUsers(context: SetupContext) {
  return {
    admin: context.seededUsers.find((u) => u.role === 'admin'),
    user: context.seededUsers.find((u) => u.role === 'user'),
    guest: context.seededUsers.find((u) => u.role === 'guest'),
    all: context.seededUsers,
  };
}
