import { Page, Locator } from '@playwright/test';

export class AddTaskDialog {
  private page: Page;

  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly deadlineDateInput: Locator;
  readonly deadlineTimeInput: Locator;
  readonly priorityButtons: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('h2:has-text("Add New Task")').locator('..').locator('..');
    this.nameInput = page.locator('input[placeholder*="task name"]');
    this.descriptionInput = page.locator('textarea[placeholder*="description"]');
    this.deadlineDateInput = page.locator('input[type="date"]').first();
    this.deadlineTimeInput = page.locator('input[type="time"]').first();
    this.priorityButtons = this.dialog.locator('button:has-text("Low"), button:has-text("Medium"), button:has-text("High")');
    this.cancelButton = this.dialog.locator('button:has-text("Cancel")');
    this.submitButton = this.dialog.locator('button:has-text("Add Task")');
  }

  async isOpen(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async fill(data: {
    name: string;
    description?: string;
    deadlineDate?: string;
    deadlineTime?: string;
    priority?: 'Low' | 'Medium' | 'High';
  }): Promise<void> {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.deadlineDate) {
      await this.deadlineDateInput.fill(data.deadlineDate);
    }
    if (data.deadlineTime) {
      await this.deadlineTimeInput.fill(data.deadlineTime);
    }
    if (data.priority) {
      await this.setPriority(data.priority);
    }
  }

  async setPriority(priority: 'Low' | 'Medium' | 'High'): Promise<void> {
    await this.dialog.locator(`button:has-text("${priority}")`).click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async addTask(data: {
    name: string;
    description?: string;
    deadlineDate?: string;
    deadlineTime?: string;
    priority?: 'Low' | 'Medium' | 'High';
  }): Promise<void> {
    await this.fill(data);
    await this.submit();
  }
}
