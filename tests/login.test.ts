import { test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import { TestData } from '../src/utils/TestData';

test.describe('OutSystems Portal - Authentication Suite', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

//   test('Should block login with invalid credentials', async () => {
//     await loginPage.login(TestData.invalidUser.username, TestData.invalidUser.password);
//     await loginPage.verifyErrorMessage(TestData.invalidUser.expectedError);
//   });

  test('Should successfully log in with valid credentials', async () => {
    await loginPage.login(TestData.validUser.username, TestData.validUser.password);
    await dashboardPage.verifyDashboardLoaded();
  });
});
