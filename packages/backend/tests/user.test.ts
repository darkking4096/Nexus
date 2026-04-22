import { describe, it, expect, beforeAll } from 'vitest';
import { createMockDatabase } from './helpers/test-db';
import type { DatabaseAdapter } from '../src/config/database';
import { User } from '../src/models/User';

describe('User Model', () => {
  let db: DatabaseAdapter;
  let userModel: User;

  beforeAll(() => {
    // Use mock database for testing
    db = createMockDatabase();
    userModel = new User(db);
  });

  it('should create a user', async () => {
    const user = await userModel.create({
      email: 'test@example.com',
      password: 'securePassword123',
      name: 'Test User',
    });

    expect(user.id).toBeTruthy();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('should get user by ID', async () => {
    const created = await userModel.create({
      email: 'user2@example.com',
      password: 'password123',
    });

    const retrieved = await userModel.getById(created.id);

    expect(retrieved).toBeTruthy();
    expect(retrieved?.email).toBe('user2@example.com');
  });

  it('should get user by email', async () => {
    const created = await userModel.create({
      email: 'user3@example.com',
      password: 'password123',
      name: 'User Three',
    });

    const retrieved = await userModel.getByEmail('user3@example.com');

    expect(retrieved).toBeTruthy();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.password_hash).toBeTruthy();
  });

  it('should verify password correctly', async () => {
    const password = 'mySecurePassword123';
    const user = await userModel.create({
      email: 'user4@example.com',
      password,
    });

    const userWithHash = await userModel.getByEmail('user4@example.com');
    expect(userWithHash).toBeTruthy();

    const isValid = await User.verifyPassword(password, userWithHash!.password_hash);
    expect(isValid).toBe(true);
  });

  it('should reject invalid password', async () => {
    const password = 'correctPassword123';
    await userModel.create({
      email: 'user5@example.com',
      password,
    });

    const userWithHash = await userModel.getByEmail('user5@example.com');
    expect(userWithHash).toBeTruthy();

    const isValid = await User.verifyPassword('wrongPassword', userWithHash!.password_hash);
    expect(isValid).toBe(false);
  });

  it('should prevent duplicate emails', async () => {
    const email = 'duplicate@example.com';
    await userModel.create({
      email,
      password: 'password123',
    });

    // This would fail because email is unique
    await expect(
      userModel.create({
        email,
        password: 'password456',
      })
    ).rejects.toThrow();
  });

  it('should check if email exists', async () => {
    const email = 'exists@example.com';
    await userModel.create({
      email,
      password: 'password123',
    });

    expect(await userModel.emailExists(email)).toBe(true);
    expect(await userModel.emailExists('notexists@example.com')).toBe(false);
  });

  it('should update user', async () => {
    const user = await userModel.create({
      email: 'update@example.com',
      password: 'password123',
      name: 'Original Name',
    });

    const updated = await userModel.update(user.id, { name: 'Updated Name' });

    expect(updated?.name).toBe('Updated Name');
  });

  it('should delete user', async () => {
    const user = await userModel.create({
      email: 'delete@example.com',
      password: 'password123',
    });

    const deleted = await userModel.delete(user.id);
    expect(deleted).toBe(true);

    const retrieved = await userModel.getById(user.id);
    expect(retrieved).toBeNull();
  });
});
