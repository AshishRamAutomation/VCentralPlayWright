import { test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import { ProjectCreationPage } from '../src/pages/ProjectCreationPage';
import { TestData } from '../src/utils/TestData';
import { ExcelReader } from '../src/utils/ExcelReader';

test.describe('Vcentral Portal - Create Project Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let projectCreationPage: ProjectCreationPage;

  // Read data mapping for row "Create_Project" from spreadsheet
  const rowData = ExcelReader.getRowData('projectData.xlsx', 'Sheet1', 'Create_Project');

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    projectCreationPage = new ProjectCreationPage(page);
    
    // Grouping the prerequisite setup steps for cleaner reports
    await test.step('Navigate and Login to VCentral Portal', async () => {
      await loginPage.navigate();
      await loginPage.login(TestData.validUser.username, TestData.validUser.password);
      await dashboardPage.verifyDashboardLoaded();
    });
  });

  test('Create Project', async () => {
    const dynamicProjectName = `${rowData.ProjectNamePrefix}_${Date.now()}`;

    // Step 1: Expand menus and go to project tracking
    await test.step('Step 1: Expand "Projects" and click "My Projects" sub-menu', async () => {
      await projectCreationPage.navigateToCreateProject();
    });

    // Step 2: Trigger creation overlay/form
    await test.step('Step 2: Click the "Create Project" button', async () => {
      await projectCreationPage.clickCreateProjectButton();
    });

    // Step 3: Populate field records from excel
    await test.step('Step 3: Fill project profile configurations from Excel records', async () => {
      await projectCreationPage.fillProjectDetailsFromExcel(
        rowData.CustomerName, 
        dynamicProjectName,
        rowData.ProjectManager,
        rowData.DeliveryManager,
        rowData.ProjectCategory,
        rowData.PrimaryServiceLine,
        rowData.Alliance  
      );
    });

    // Step 4: Validate reactive values
    await test.step('Step 4: Verify all data filled', async () => {
      await projectCreationPage.verifyAutoPopulatedFields();
    });

    // Step 5: Post data payloads
    await test.step('Step 5: Submit form and project should created', async () => {
      await projectCreationPage.submitForm();
    });
  });
});
