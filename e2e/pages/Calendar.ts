import { Page, Locator } from '@playwright/test';

export interface ItemTile {
  name: string;
  isTask: boolean;
  isComplete?: boolean;
}

export class Calendar {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getDayColumn(date: Date): Locator {
    const dayNumber = date.getDate();
    return this.page.locator(`[class*="DayColumn"], [data-testid*="day"]`).filter({ hasText: new RegExp(`^${dayNumber}$`) }).first();
  }

  private getItemTile(name: string): Locator {
    return this.page.locator('text=/^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$/').locator('..').locator('..');
  }

  async getItemsOnDate(date: Date): Promise<Locator[]> {
    const column = this.getDayColumn(date);
    const items = column.locator('[class*="ItemTile"], [class*="rounded-md"][class*="border"]');
    const count = await items.count();
    return Array.from({ length: count }, (_, i) => items.nth(i));
  }

  async expandItem(name: string): Promise<void> {
    const item = this.getItemTile(name);
    await item.click();
    // Wait for expanded content
    await this.page.waitForTimeout(100);
  }

  async clickItemEdit(name: string): Promise<void> {
    await this.expandItem(name);
    await this.page.locator(`button:has-text("Edit")`).click();
  }

  async clickItemDelete(name: string): Promise<void> {
    await this.expandItem(name);
    await this.page.locator(`button:has-text("Delete")`).click();
  }

  async toggleTaskComplete(name: string): Promise<void> {
    await this.expandItem(name);
    // Find the checkbox button in the expanded item
    const item = this.getItemTile(name);
    await item.locator('button[class*="rounded border"]').click();
  }

  async isItemVisible(name: string): Promise<boolean> {
    const item = this.getItemTile(name);
    return item.isVisible();
  }

  async isItemComplete(name: string): Promise<boolean> {
    const item = this.getItemTile(name);
    const checkbox = item.locator('button[class*="rounded border"]');
    const hasCompleteClass = await checkbox.evaluate(el => el.classList.contains('bg-green-600'));
    return hasCompleteClass;
  }

  async waitForNoItems(): Promise<void> {
    await this.page.waitForSelector('[class*="bg-gray-800"][class*="border"][class*="rounded-md"]', { state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  async getItemCount(): Promise<number> {
    const items = this.page.locator('[class*="ItemTile"], [class*="rounded-md"][class*="border"]');
    return items.count();
  }
}
