import { Page, Locator } from '@playwright/test';

export class DeleteConfirmDialog {
  private page: Page;

  readonly dialog: Locator;
  readonly itemName: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('h2:has-text("Delete Item")').locator('..').locator('..');
    this.itemName = this.dialog.locator('p.font-medium');
    this.cancelButton = this.dialog.locator('button:has-text("Cancel")');
    this.deleteButton = this.dialog.locator('button:has-text("Delete")');
  }

  async isOpen(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async getItemName(): Promise<string> {
    return this.itemName.textContent() ?? '';
  }

  async confirm(): Promise<void> {
    await this.deleteButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
