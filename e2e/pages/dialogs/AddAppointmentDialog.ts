import { Page, Locator } from '@playwright/test';

export class AddAppointmentDialog {
  private page: Page;

  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly startDateInput: Locator;
  readonly startTimeInput: Locator;
  readonly endDateInput: Locator;
  readonly endTimeInput: Locator;
  readonly attendeesInput: Locator;
  readonly priorityButtons: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('h2:has-text("Add New Appointment")').locator('..').locator('..');
    this.nameInput = page.locator('input[placeholder*="appointment name"]');
    this.descriptionInput = page.locator('textarea[placeholder*="description"]');
    this.startDateInput = page.locator('input[type="date"]').first();
    this.startTimeInput = page.locator('input[type="time"]').first();
    this.endDateInput = page.locator('input[type="date"]').nth(1);
    this.endTimeInput = page.locator('input[type="time"]').nth(1);
    this.attendeesInput = page.locator('input[placeholder*="John, Jane"]');
    this.priorityButtons = this.dialog.locator('button:has-text("Low"), button:has-text("Medium"), button:has-text("High")');
    this.cancelButton = this.dialog.locator('button:has-text("Cancel")');
    this.submitButton = this.dialog.locator('button:has-text("Add Appointment")');
  }

  async isOpen(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async fill(data: {
    name: string;
    description?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    attendees?: string;
    priority?: 'Low' | 'Medium' | 'High';
  }): Promise<void> {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.startDate) {
      await this.startDateInput.fill(data.startDate);
    }
    if (data.startTime) {
      await this.startTimeInput.fill(data.startTime);
    }
    if (data.endDate) {
      await this.endDateInput.fill(data.endDate);
    }
    if (data.endTime) {
      await this.endTimeInput.fill(data.endTime);
    }
    if (data.attendees) {
      await this.attendeesInput.fill(data.attendees);
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

  async addAppointment(data: {
    name: string;
    description?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    attendees?: string;
    priority?: 'Low' | 'Medium' | 'High';
  }): Promise<void> {
    await this.fill(data);
    await this.submit();
  }
}
