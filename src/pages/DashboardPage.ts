import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  private page: Page;
  
  // Locators (Adjust selectors based on your actual post-login landing page)
  private userProfileMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userProfileMenu = page.locator('.user-info, .Login_Info'); 
  }

  async verifyDashboardLoaded() {
    // Wait for URL to change away from the login endpoint
    await expect(this.page).not.toHaveURL(/.*internaloslogin/);
    await expect(this.userProfileMenu).toBeVisible({ timeout: 10000 });
  }
}
