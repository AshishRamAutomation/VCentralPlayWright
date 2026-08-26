import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private url: string = '/VCentral_TH/internaloslogin';
  
  // Locators
  private usernameInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  //private errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
   
    this.usernameInput = page.locator('input[id*="Username"], input[type="text"]');
    this.passwordInput = page.locator('input[id*="Password"], input[type="password"]');
    this.loginButton = page.locator('button[type="submit"], input[type="submit"]');
    //this.errorMessage = page.locator('.feedback-message-error, .ValidationMessage');
  }

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // async verifyErrorMessage(expectedText: string) {
  //   await expect(this.errorMessage).toBeVisible();
  //   await expect(this.errorMessage).toContainText(expectedText);
  // }
}
