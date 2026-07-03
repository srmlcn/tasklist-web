import { Page, Locator } from '@playwright/test';

export class EditItemDialog {
  private page: Page;

  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('h2:has-text("Edit Task"), h2:has-text("Edit Appointment")').locator('..').locator('..');
    this.nameInput = page.locator('input[placeholder*="name"]');
    this.descriptionInput = page.locator('textarea[placeholder*="description"]');
    this.cancelButton = this.dialog.locator('button:has-text("Cancel")');
    this.saveButton = this.dialog.locator('button:has-text("Save Changes")');
  }

  async isOpen(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async isEditingTask(): Promise<boolean> {
    const header = await this.dialog.locator('h2').textContent();
    return header?.includes('Task') ?? false;
  }

  async isEditingAppointment(): Promise<boolean> {
    const header = await this.dialog.locator('h2').textContent();
    return header?.includes('Appointment') ?? false;
  }

  async fill(data: {
    name?: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
    isComplete?: boolean;
  }): Promise<void> {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.priority) {
      await this.setPriority(data.priority);
    }
    if (data.isComplete !== undefined) {
      await this.setComplete(data.isComplete);
    }
  }

  async setPriority(priority: 'Low' | 'Medium' | 'High'): Promise<void> {
    await this.dialog.locator(`button:has-text("${priority}")`).click();
  }

  async setComplete(complete: boolean): Promise<void> {
    const checkbox = this.dialog.locator('input[type="checkbox"]#isComplete');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== complete) {
      await checkbox.click();
    }
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async update(data: {
    name?: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
    isComplete?: boolean;
  }): Promise<void> {
    await this.fill(data);
    await this.save();
  }
}
