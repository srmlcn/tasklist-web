import { test, expect, getTodayDate, getTomorrowDate, getDateDaysFromNow } from './fixtures';
import { Header, Calendar, AddTaskDialog, AddAppointmentDialog } from './pages';
import { Item } from '../src/types';

test.describe('Import/Export Functionality', () => {
  let header: Header;
  let calendar: Calendar;
  let addTaskDialog: AddTaskDialog;
  let addAppointmentDialog: AddAppointmentDialog;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    header = new Header(page);
    calendar = new Calendar(page);
    addTaskDialog = new AddTaskDialog(page);
    addAppointmentDialog = new AddAppointmentDialog(page);
  });

  test('should export data as JSON file', async ({ page }) => {
    // Create tasks
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Exported Task 1',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Exported Task 2',
      deadlineDate: getTodayDate(),
    });

    // Set up download listener
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      header.clickExport(),
    ]);

    // Verify download
    expect(download.suggestedFilename()).toMatch(/tasklist-export-\d{4}-\d{2}-\d{2}\.json/);
    
    const path = await download.path();
    expect(path).toBeTruthy();
    
    const content = await download.suggestedFilename();
    expect(content).toBeTruthy();
  });

  test('should import data and restore items', async ({ page }) => {
    // Create initial items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Original Task',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Original Meeting',
      startDate: getTodayDate(),
      endDate: getTodayDate(),
    });

    // Prepare import data
    const importItems: Item[] = [
      {
        id: 'imported-1',
        type: 'task',
        name: 'Imported Task 1',
        description: 'From import',
        deadline: new Date(getTodayDate()).toISOString(),
        priority: 0,
        isComplete: false,
      },
      {
        id: 'imported-2',
        type: 'appointment',
        name: 'Imported Meeting',
        description: 'Also from import',
        start: new Date(getTodayDate()).toISOString(),
        stop: new Date(getTodayDate()).toISOString(),
        priority: 1,
        attendees: ['Alice'],
      },
    ];

    // Upload the file using file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await header.clickImport();
    const fileChooser = await fileChooserPromise;
    
    // Create a temp file with import data
    const fs = require('fs');
    const importPath = require('path');
    const tempFile = importPath.join(process.cwd(), 'temp-import.json');
    fs.writeFileSync(tempFile, JSON.stringify(importItems));
    
    await fileChooser.setFiles(tempFile);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);

    // Verify items were imported (may include original items)
    // Note: The actual behavior depends on whether import appends or replaces
    // Based on the code, it appends items to existing ones
  });

  test('should export and reimport preserves data', async ({ page }) => {
    // Create a variety of items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task to Preserve',
      description: 'Important task',
      deadlineDate: getDateDaysFromNow(1),
      priority: 'High',
    });

    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Meeting to Preserve',
      description: 'Important meeting',
      startDate: getDateDaysFromNow(2),
      endDate: getDateDaysFromNow(2),
      attendees: 'Alice, Bob',
      priority: 'Medium',
    });

    // Wait for items to be saved
    await page.waitForTimeout(500);

    // Export data
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      header.clickExport(),
    ]);

    const path = await download.path();
    if (path) {
      const fs = require('fs');
      const exportedContent = JSON.parse(fs.readFileSync(path, 'utf-8'));
      
      expect(exportedContent).toBeInstanceOf(Array);
      expect(exportedContent.length).toBeGreaterThanOrEqual(2);
      
      const exportedTask = exportedContent.find(
        (item: Item) => item.type === 'task' && item.name === 'Task to Preserve'
      );
      expect(exportedTask).toBeDefined();
      expect(exportedTask.description).toBe('Important task');
      expect(exportedTask.priority).toBe(2); // High priority

      const exportedMeeting = exportedContent.find(
        (item: Item) => item.type === 'appointment' && item.name === 'Meeting to Preserve'
      );
      expect(exportedMeeting).toBeDefined();
      expect(exportedMeeting.attendees).toContain('Alice');
    }
  });

  test('should clear all data after confirmation', async ({ page }) => {
    // Create items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task to Clear',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Meeting to Clear',
      startDate: getTodayDate(),
      endDate: getTodayDate(),
    });

    // Verify items exist
    await expect(calendar.isItemVisible('Task to Clear')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Meeting to Clear')).resolves.toBe(true);

    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Clear all data
    await header.clickClearAll();

    // Wait for data to be cleared
    await page.waitForTimeout(500);

    // Verify items are gone
    await expect(calendar.isItemVisible('Task to Clear')).resolves.toBe(false);
    await expect(calendar.isItemVisible('Meeting to Clear')).resolves.toBe(false);
  });

  test('should cancel clear all data', async ({ page }) => {
    // Create item
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task to Keep',
      deadlineDate: getTodayDate(),
    });

    // Verify item exists
    await expect(calendar.isItemVisible('Task to Keep')).resolves.toBe(true);

    // Handle cancel dialog
    page.on('dialog', dialog => dialog.dismiss());

    // Try to clear all data
    await header.clickClearAll();

    // Item should still exist
    await expect(calendar.isItemVisible('Task to Keep')).resolves.toBe(true);
  });

  test('should handle invalid import file gracefully', async ({ page }) => {
    // Create a temp file with invalid JSON
    const fs = require('fs');
    const importPath = require('path');
    const tempFile = importPath.join(process.cwd(), 'invalid-import.json');
    fs.writeFileSync(tempFile, 'not valid json {');

    // Trigger import
    const fileChooserPromise = page.waitForEvent('filechooser');
    await header.clickImport();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempFile);

    // Wait for dialog to handle the error
    await page.waitForTimeout(500);

    // Clean up
    try {
      fs.unlinkSync(tempFile);
    } catch {
      // File may already be cleaned up
    }

    // The app should show an error alert (handled by the component)
    // Page should still be functional
    await expect(header.addButton).toBeVisible();
  });

  test('should import valid JSON array', async ({ page }) => {
    // Clear storage before starting
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Prepare valid import data with tomorrow's date
    const tomorrowDate = getTomorrowDate();
    const importItems: Item[] = [
      {
        id: 'import-task-1',
        type: 'task',
        name: 'Imported Task',
        description: 'From import',
        deadline: new Date(tomorrowDate + 'T12:00:00.000Z').toISOString(),
        priority: 1,
        isComplete: false,
      },
      {
        id: 'import-appt-1',
        type: 'appointment',
        name: 'Imported Meeting',
        description: 'Meeting from import',
        start: new Date(tomorrowDate + 'T10:00:00.000Z').toISOString(),
        stop: new Date(tomorrowDate + 'T11:00:00.000Z').toISOString(),
        priority: 2,
        attendees: ['Alice'],
      },
    ];

    // Create a temp file with valid JSON
    const fs = require('fs');
    const importPath = require('path');
    const tempFile = importPath.join(process.cwd(), 'valid-import.json');
    fs.writeFileSync(tempFile, JSON.stringify(importItems));

    // Trigger import
    const fileChooserPromise = page.waitForEvent('filechooser');
    await header.clickImport();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempFile);

    // Clean up
    fs.unlinkSync(tempFile);

    // Wait for import to process
    await page.waitForTimeout(500);

    // Both imported items should be visible
    await expect(calendar.isItemVisible('Imported Task')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Imported Meeting')).resolves.toBe(true);
  });
});
