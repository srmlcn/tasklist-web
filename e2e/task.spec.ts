import { test, expect, getTodayDate, getTomorrowDate, getDateDaysFromNow } from './fixtures';
import { Header, Calendar, AddTaskDialog, EditItemDialog, DeleteConfirmDialog } from './pages';

test.describe('Task CRUD Operations', () => {
  let header: Header;
  let calendar: Calendar;
  let addTaskDialog: AddTaskDialog;
  let editDialog: EditItemDialog;
  let deleteDialog: DeleteConfirmDialog;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    header = new Header(page);
    calendar = new Calendar(page);
    addTaskDialog = new AddTaskDialog(page);
    editDialog = new EditItemDialog(page);
    deleteDialog = new DeleteConfirmDialog(page);
  });

  test('should create a new task with required fields only', async ({ page }) => {
    await header.clickAddTask();
    await expect(addTaskDialog.isOpen()).resolves.toBe(true);

    await addTaskDialog.addTask({
      name: 'Test Task',
      deadlineDate: getTomorrowDate(),
    });

    await expect(addTaskDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Test Task')).resolves.toBe(true);
  });

  test('should create a task with all fields', async ({ page }) => {
    await header.clickAddTask();

    await addTaskDialog.addTask({
      name: 'Complete Task',
      description: 'This is a test description',
      deadlineDate: getTomorrowDate(),
      deadlineTime: '14:30',
      priority: 'High',
    });

    await expect(calendar.isItemVisible('Complete Task')).resolves.toBe(true);
  });

  test('should edit a task name', async ({ page }) => {
    // Create task first
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Original Task',
      deadlineDate: getTomorrowDate(),
    });

    // Edit the task
    await calendar.clickItemEdit('Original Task');
    await expect(editDialog.isOpen()).resolves.toBe(true);
    await expect(editDialog.isEditingTask()).resolves.toBe(true);

    await editDialog.update({ name: 'Updated Task' });

    await expect(calendar.isItemVisible('Updated Task')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Original Task')).resolves.toBe(false);
  });

  test('should toggle task completion', async ({ page }) => {
    // Create task first
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Toggle Test Task',
      deadlineDate: getTomorrowDate(),
    });

    // Initially not complete
    await expect(calendar.isItemComplete('Toggle Test Task')).resolves.toBe(false);

    // Toggle to complete
    await calendar.toggleTaskComplete('Toggle Test Task');
    await expect(calendar.isItemComplete('Toggle Test Task')).resolves.toBe(true);

    // Toggle back to incomplete
    await calendar.toggleTaskComplete('Toggle Test Task');
    await expect(calendar.isItemComplete('Toggle Test Task')).resolves.toBe(false);
  });

  test('should delete a task', async ({ page }) => {
    // Create task first
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task to Delete',
      deadlineDate: getTomorrowDate(),
    });

    await expect(calendar.isItemVisible('Task to Delete')).resolves.toBe(true);

    // Delete the task
    await calendar.clickItemDelete('Task to Delete');
    await expect(deleteDialog.isOpen()).resolves.toBe(true);

    const itemName = await deleteDialog.getItemName();
    expect(itemName).toContain('Task to Delete');

    await deleteDialog.confirm();

    await expect(deleteDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Task to Delete')).resolves.toBe(false);
  });

  test('should cancel task creation', async ({ page }) => {
    await header.clickAddTask();
    await expect(addTaskDialog.isOpen()).resolves.toBe(true);

    await addTaskDialog.fill({
      name: 'Cancelled Task',
      deadlineDate: getTomorrowDate(),
    });
    await addTaskDialog.cancel();

    await expect(addTaskDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Cancelled Task')).resolves.toBe(false);
  });

  test('should cancel task deletion', async ({ page }) => {
    // Create task first
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task to Keep',
      deadlineDate: getTomorrowDate(),
    });

    // Delete the task but cancel
    await calendar.clickItemDelete('Task to Keep');
    await expect(deleteDialog.isOpen()).resolves.toBe(true);

    await deleteDialog.cancel();

    await expect(deleteDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Task to Keep')).resolves.toBe(true);
  });

  test('should change task priority', async ({ page }) => {
    // Create task with default priority
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Priority Test Task',
      deadlineDate: getTomorrowDate(),
    });

    // Edit and change priority
    await calendar.clickItemEdit('Priority Test Task');
    await editDialog.setPriority('High');
    await editDialog.save();

    // Verify task still visible after priority change
    await expect(calendar.isItemVisible('Priority Test Task')).resolves.toBe(true);
  });

  test('should add task description', async ({ page }) => {
    await header.clickAddTask();
    await addTaskDialog.addTask({
      name: 'Task with Description',
      description: 'Important details here',
      deadlineDate: getTomorrowDate(),
    });

    // Expand the task to see description
    await calendar.expandItem('Task with Description');
    
    // Description should be visible in expanded content
    const descriptionText = page.locator('text=Important details here');
    await expect(descriptionText.first()).toBeVisible();
  });
});
