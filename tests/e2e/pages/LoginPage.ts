/**
 * LoginPage — Page Object for Signup + Login Flow (E2E-1)
 * Handles: signup form, email verification, login
 */

import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // Locators
  private signupForm = () => this.page.locator('form[data-testid="signup-form"]');
  private emailInput = () => this.page.locator('input[name="email"]');
  private passwordInput = () => this.page.locator('input[name="password"]');
  private createAccountBtn = () => this.page.locator('button:has-text("Create Account")');
  private verifyEmailModal = () => this.page.locator('[data-testid="verify-email-modal"]');
  private verifyLink = () => this.page.locator('a[data-testid="verify-email-link"]');
  private loginForm = () => this.page.locator('form[data-testid="login-form"]');
  private loginBtn = () => this.page.locator('button:has-text("Login")');
  private dashboard = () => this.page.locator('[data-testid="dashboard"]');
  private userNameHeader = () => this.page.locator('[data-testid="user-name"]');

  // Actions
  async navigateToSignup(): Promise<void> {
    await this.page.goto('/signup');
  }

  async fillSignupForm(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
  }

  async clickCreateAccount(): Promise<void> {
    await this.createAccountBtn().click();
  }

  async verifyEmail(): Promise<void> {
    // TODO(human): Implement email verification
    // Options:
    // 1. Click verify link from verifyLink() locator
    // 2. Extract token and call verification endpoint
    // 3. Mock email service in test environment
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginBtn().click();
  }

  async waitForDashboard(): Promise<void> {
    await this.dashboard().waitFor({ state: 'visible' });
  }

  async getLoggedInUserName(): Promise<string> {
    return await this.userNameHeader().textContent() || '';
  }

  // Assertions
  async assertSignupFormVisible(): Promise<void> {
    await expect(this.signupForm()).toBeVisible();
  }

  async assertVerifyEmailModalVisible(): Promise<void> {
    await expect(this.verifyEmailModal()).toBeVisible();
  }

  async assertDashboardVisible(): Promise<void> {
    await expect(this.dashboard()).toBeVisible();
  }

  async assertUserLoggedIn(expectedName: string): Promise<void> {
    const userName = await this.getLoggedInUserName();
    expect(userName).toContain(expectedName);
  }
}
