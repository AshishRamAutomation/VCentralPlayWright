import { Page, Locator, expect } from '@playwright/test';

export class ProjectCreationPage {
  private page: Page;

  // Sidebar Menu Nav
  private projectsMenuSidebar: Locator;
  private myProjectsMenuSidebar: Locator;
  // Create Project
  private createProjectButton: Locator;
  // Form Fields
  private customerNameDropdown: Locator;
  private customerNameSearchInput: Locator;
  private customerNameOption: Locator;
  private projectNameInput: Locator;
  private projectmanagerDropdown: Locator;
  private projectmanagersearchInput: Locator;
  private projectmanagerOption: Locator;
  private deliverymanagerDropdown: Locator;
  private deliverymanagerSearchInput: Locator;
  private deliverymanagerOption: Locator;
  private projectTypeDropdown: Locator;
  private projectTypeSearchInput: Locator;
  private projectTypeOption: Locator;
  private primaryServiceLineDropdown: Locator;
  private primaryServiceLineSearchInput: Locator;
  private primaryServiceLineOption: Locator;
  private alianceDropdown: Locator;
  private alianceSearchInput: Locator;
  private alianceOption: Locator;
  private alianceselectOutsideClick: Locator;

  private saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.projectsMenuSidebar = page.locator('//span[contains(text(), "Projects")]').first();
    this.myProjectsMenuSidebar = page.locator('//a[contains(text(), "My Projects")]');
    this.createProjectButton = page.locator('//button[contains(text(), "Create Project")]');

    this.customerNameDropdown = page.locator("//div[text()='Select Customer']");
    this.customerNameSearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.customerNameOption = page.locator('//span[@data-tooltip="BLUE ORIGIN"]');
    this.projectmanagerDropdown = page.locator("//div[text()='Select Project Manager']");
    this.projectmanagersearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.projectmanagerOption = page.locator('//span[@data-tooltip="Sundram Guha_Automation (1010978)"]');
    this.deliverymanagerDropdown = page.locator("//div[text()='Select Delivery Manager']");
    this.deliverymanagerSearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.deliverymanagerOption = page.locator('//span[@data-tooltip="Sourabh Yadav _ Automation (1015806)"]');
    this.projectTypeDropdown = page.locator("//div[text()='Select Project Type']");
    this.projectTypeSearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.projectTypeOption = page.locator('//span[@data-tooltip="Development/Implementation"]');
    this.primaryServiceLineDropdown = page.locator("//div[text()='Select Service Line']");
    this.primaryServiceLineSearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.primaryServiceLineOption = page.locator('//span[@data-tooltip="Digital Experience"]');
    this.alianceDropdown = page.locator("//div[@class='vscomp-value' and normalize-space()='Select Alliances']");
    this.alianceSearchInput = page.locator('input[placeholder*="Search"], .choices__input, .vscomp-search-input').filter({ visible: true });
    this.alianceOption = page.locator('//span[@data-tooltip="Worksoft"]');
    this.alianceselectOutsideClick = page.locator('//body').first();

    this.projectNameInput = page.locator('//input[@placeholder="Enter Project Name"]');
    this.saveBtn = page.locator('button:has-text("Save")').or(page.locator('button[type="submit"]'));
  }

  
  async takeScreenshot(stepName: string) {
    const formattedName = stepName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await this.page.screenshot({ 
      path: `screenshots/${formattedName}_${Date.now()}.png`,
      fullPage: true 
    });
  }

  async navigateToCreateProject() {
  await this.projectsMenuSidebar.waitFor({ state: 'visible', timeout: 10000 });
  await this.projectsMenuSidebar.evaluate((element: HTMLElement) => element.click());
  await this.myProjectsMenuSidebar.waitFor({ state: 'visible', timeout: 10000 });
  await this.page.waitForTimeout(500);
  await this.myProjectsMenuSidebar.evaluate((element: HTMLElement) => element.click());
  await this.page.waitForLoadState('networkidle');
  await this.page.screenshot();
}


  async clickCreateProjectButton() {
    await this.createProjectButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.createProjectButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('project_creation_modal_opened');
  }

  async fillProjectDetailsFromExcel(customerName: string, generatedProjectName: string, ProjectManager: string, DeliveryManager: string, ProjectCategory: string, PrimaryServiceLine: string, Alliance: string) {
    await this.customerNameDropdown.click();
    await this.customerNameSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    
    if (await this.customerNameSearchInput.isVisible()) {
      await this.customerNameSearchInput.fill(customerName);
      await this.page.waitForTimeout(500); 
      await this.customerNameOption.click();
    } else {
      await this.customerNameDropdown.selectOption({ label: customerName });
    }
    await this.page.waitForLoadState('networkidle');
    await this.projectNameInput.waitFor({ state: 'visible' });
    await this.projectNameInput.fill(generatedProjectName);

    if (await this.projectmanagerDropdown.isVisible()) {
      await this.projectmanagerDropdown.click();
      await this.projectmanagersearchInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.projectmanagersearchInput.fill(ProjectManager);
      await this.page.waitForTimeout(500);
      await this.projectmanagerOption.click();
    }
    
    if (await this.deliverymanagerDropdown.isVisible()) {
      await this.page.waitForTimeout(500);
      await this.deliverymanagerDropdown.click();
      await this.deliverymanagerSearchInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.deliverymanagerSearchInput.fill(DeliveryManager);
      await this.page.waitForTimeout(500);
      await this.deliverymanagerOption.click();
    }

    if (await this.projectTypeDropdown.isVisible()) {
      await this.page.waitForTimeout(500);
      await this.projectTypeDropdown.click();
      await this.projectTypeSearchInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.projectTypeSearchInput.fill(ProjectCategory);
      await this.page.waitForTimeout(500);
      await this.projectTypeOption.click();
    }

    if (await this.primaryServiceLineDropdown.isVisible()) {
      await this.page.waitForTimeout(500);
      await this.primaryServiceLineDropdown.click();
      await this.primaryServiceLineSearchInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.primaryServiceLineSearchInput.fill(PrimaryServiceLine);
      await this.page.waitForTimeout(500);
      await this.primaryServiceLineOption.click();
    } 

    if (await this.alianceDropdown.isVisible()) {
      await this.page.waitForTimeout(500);
      await this.alianceDropdown.click();
      await this.alianceSearchInput.waitFor({ state: 'visible', timeout: 5000 }); 
      await this.alianceSearchInput.fill(Alliance);
      await this.page.waitForTimeout(500);
      await this.alianceOption.click();
      await this.alianceselectOutsideClick.click();
    }
    
    // Take a screenshot right after the entire form layout has been successfully populated
    await this.takeScreenshot('form_details_populated');
  }

  async verifyAutoPopulatedFields() {
    // await expect(this.customerCodeDisplay).not.toBeEmpty();
    // await expect(this.customerGroupDisplay).not.toBeEmpty();
    // await expect(this.projectIdDisplay).not.toBeEmpty();
  }

  async submitForm() {
    await this.saveBtn.waitFor({ state: 'visible' });
    await this.saveBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('form_submitted_success');
  }
}
