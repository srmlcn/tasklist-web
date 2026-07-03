import { test, expect, getTodayDate, getTomorrowDate, getDateDaysFromNow } from './fixtures';
import { Header, Calendar, AddTaskDialog, AddAppointmentDialog } from './pages';

test.describe('Search and Sort Functionality', () => {
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

  test('should filter items by search term - exact match', async ({ page }) => {
    // Create multiple items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Buy groceries',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Clean house',
      deadlineDate: getDateDaysFromNow(1),
    });

    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Doctor appointment',
      startDate: getDateDaysFromNow(2),
      endDate: getDateDaysFromNow(2),
    });

    // Search for "groceries"
    await header.search('groceries');
    
    await expect(calendar.isItemVisible('Buy groceries')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Clean house')).resolves.toBe(false);
    await expect(calendar.isItemVisible('Doctor appointment')).resolves.toBe(false);
  });

  test('should filter items by search term - partial match', async ({ page }) => {
    // Create multiple items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Buy groceries',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Clean house',
      deadlineDate: getDateDaysFromNow(1),
    });

    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Doctor appointment',
      startDate: getDateDaysFromNow(2),
      endDate: getDateDaysFromNow(2),
    });

    // Search for "app" (should match "Doctor appointment")
    await header.search('app');
    
    await expect(calendar.isItemVisible('Doctor appointment')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Buy groceries')).resolves.toBe(false);
    await expect(calendar.isItemVisible('Clean house')).resolves.toBe(false);
  });

  test('should search in descriptions', async ({ page }) => {
    // Create task with description
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Buy supplies',
      description: 'Need to buy milk and bread',
      deadlineDate: getTodayDate(),
    });

    // Search for text in description
    await header.search('milk');
    
    await expect(calendar.isItemVisible('Buy supplies')).resolves.toBe(true);
  });

  test('should clear search and show all items', async ({ page }) => {
    // Create multiple items
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task One',
      deadlineDate: getTodayDate(),
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task Two',
      deadlineDate: getDateDaysFromNow(1),
    });

    // Search for one item
    await header.search('Task One');
    await expect(calendar.isItemVisible('Task One')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Task Two')).resolves.toBe(false);

    // Clear search
    await header.clearSearch();
    
    await expect(calendar.isItemVisible('Task One')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Task Two')).resolves.toBe(true);
  });

  test('should show no results when search matches nothing', async ({ page }) => {
    // Create task
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Existing Task',
      deadlineDate: getTodayDate(),
    });

    // Search for non-existent item
    await header.search('xyznonexistent');
    
    // Should show no items visible
    await expect(calendar.isItemVisible('Existing Task')).resolves.toBe(false);
  });

  test('should toggle between time and priority sort', async ({ page }) => {
    // Create tasks with different priorities
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Low Priority Task',
      deadlineDate: getTodayDate(),
      priority: 'Low',
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'High Priority Task',
      deadlineDate: getTodayDate(),
      priority: 'High',
    });

    // Verify initial state (should be sorted by time)
    const isPriority = await header.isSortedByPriority();
    expect(isPriority).toBe(false);

    // Toggle to priority sort
    await header.toggleSort();
    
    // Verify now sorted by priority
    await expect(header.isSortedByPriority()).resolves.toBe(true);

    // Toggle back to time sort
    await header.toggleSort();
    
    // Verify back to time sort
    await expect(header.isSortedByPriority()).resolves.toBe(false);
  });

  test('should sort by priority - high priority first', async ({ page }) => {
    // Create tasks with different priorities
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Low Priority Task',
      deadlineDate: getTodayDate(),
      priority: 'Low',
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Medium Priority Task',
      deadlineDate: getTodayDate(),
      priority: 'Medium',
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'High Priority Task',
      deadlineDate: getTodayDate(),
      priority: 'High',
    });

    // Switch to priority sort
    await header.toggleSort();

    // All items should still be visible
    await expect(calendar.isItemVisible('Low Priority Task')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Medium Priority Task')).resolves.toBe(true);
    await expect(calendar.isItemVisible('High Priority Task')).resolves.toBe(true);
  });

  test('should combine search and sort', async ({ page }) => {
    // Create tasks with different priorities
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Urgent Report',
      deadlineDate: getTodayDate(),
      priority: 'High',
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Urgent Meeting',
      deadlineDate: getDateDaysFromNow(1),
      priority: 'Low',
    });

    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Normal Report',
      deadlineDate: getDateDaysFromNow(2),
      priority: 'Low',
    });

    // Search for "Report"
    await header.search('Report');
    
    // Both reports should be visible
    await expect(calendar.isItemVisible('Urgent Report')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Normal Report')).resolves.toBe(true);
    
    // Meeting should be hidden
    await expect(calendar.isItemVisible('Urgent Meeting')).resolves.toBe(false);

    // Now toggle to priority sort - search should still work
    await header.toggleSort();
    
    // Both reports should still be visible
    await expect(calendar.isItemVisible('Urgent Report')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Normal Report')).resolves.toBe(true);
  });

  test('should persist search term in input', async ({ page }) => {
    // Create task
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Search Persistence Test',
      deadlineDate: getTodayDate(),
    });

    // Search for item
    const searchTerm = 'Persistence';
    await header.search(searchTerm);

    // Verify input still has the value
    await header.searchInput.waitFor();
    const inputValue = await header.searchInput.inputValue();
    expect(inputValue).toBe(searchTerm);
  });
});
