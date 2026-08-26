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
    
    await loginPage.navigate();
    await loginPage.login(TestData.validUser.username, TestData.validUser.password);
    await dashboardPage.verifyDashboardLoaded();
  });

  test('Create Project', async () => {
    const dynamicProjectName = `${rowData.ProjectNamePrefix}_${Date.now()}`;

    // Step 1: Safely expand "Projects" and click "My Projects" sub-menu
    await projectCreationPage.navigateToCreateProject();
//step 2: create project button click
await projectCreationPage.clickCreateProjectButton();
    // Step 2: Proceed with form initialization using Excel row records
    await projectCreationPage.fillProjectDetailsFromExcel(
      rowData.CustomerName, 
      dynamicProjectName,
      rowData.ProjectManager,
      rowData.DeliveryManager,
      rowData.ProjectCategory,
      rowData.PrimaryServiceLine,
      rowData.Alliance  
    );

    // Step 3: Validate OutSystems reactive logic successfully loaded Customer Code & Project ID
    await projectCreationPage.verifyAutoPopulatedFields();

    // Step 4: Finalize data collection entry pipeline
    await projectCreationPage.submitForm();
  });
});
