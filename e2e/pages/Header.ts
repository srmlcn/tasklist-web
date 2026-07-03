import { Page, Locator } from '@playwright/test';

export class Header {
  private page: Page;
  
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly sortButton: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.locator('header button:has-text("Add")');
    this.searchInput = page.locator('header input[placeholder*="Search"]');
    this.sortButton = page.locator('header button:has-text("Time"), header button:has-text("Priority")');
    this.menuButton = page.locator('header button svg[viewBox="0 0 24 24"]').last();
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async clickAddTask(): Promise<void> {
    await this.clickAddButton();
    await this.page.locator('button:has-text("Add Task")').click();
  }

  async clickAddAppointment(): Promise<void> {
    await this.clickAddButton();
    await this.page.locator('button:has-text("Add Appointment")').click();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    const clearButton = this.page.locator('header button svg[viewBox="0 0 24 24"][d*="M6 18L18 6M6 6l12 12"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  async toggleSort(): Promise<void> {
    await this.sortButton.click();
  }

  async isSortedByPriority(): Promise<boolean> {
    return this.sortButton.locator('text=Priority').isVisible();
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async clickExport(): Promise<void> {
    await this.openMenu();
    await this.page.locator('button:has-text("Export Data")').click();
  }

  async clickImport(): Promise<void> {
    await this.openMenu();
    await this.page.locator('button:has-text("Import Data")').click();
  }

  async clickClearAll(): Promise<void> {
    await this.openMenu();
    await this.page.locator('button:has-text("Clear All Data")').click();
    // Handle confirmation dialog
    await this.page.on('dialog', dialog => dialog.accept());
  }

  getMenuLocator(): Locator {
    return this.page.locator('header >> text=Export Data').locator('..');
  }
}
