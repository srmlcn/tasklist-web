import { test, expect, getTodayDate, getTomorrowDate, getDateDaysFromNow } from './fixtures';
import { Header, Calendar, AddAppointmentDialog, EditItemDialog, DeleteConfirmDialog } from './pages';

test.describe('Appointment CRUD Operations', () => {
  let header: Header;
  let calendar: Calendar;
  let addAppointmentDialog: AddAppointmentDialog;
  let editDialog: EditItemDialog;
  let deleteDialog: DeleteConfirmDialog;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    header = new Header(page);
    calendar = new Calendar(page);
    addAppointmentDialog = new AddAppointmentDialog(page);
    editDialog = new EditItemDialog(page);
    deleteDialog = new DeleteConfirmDialog(page);
  });

  test('should create a new appointment with required fields only', async ({ page }) => {
    await header.clickAddAppointment();
    await expect(addAppointmentDialog.isOpen()).resolves.toBe(true);

    await addAppointmentDialog.addAppointment({
      name: 'Test Meeting',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    await expect(addAppointmentDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Test Meeting')).resolves.toBe(true);
  });

  test('should create an appointment with all fields', async ({ page }) => {
    await header.clickAddAppointment();

    await addAppointmentDialog.addAppointment({
      name: 'Team Meeting',
      description: 'Weekly team sync',
      startDate: getTomorrowDate(),
      startTime: '10:00',
      endDate: getTomorrowDate(),
      endTime: '11:00',
      attendees: 'Alice, Bob, Charlie',
      priority: 'High',
    });

    await expect(calendar.isItemVisible('Team Meeting')).resolves.toBe(true);
  });

  test('should edit an appointment name', async ({ page }) => {
    // Create appointment first
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Original Meeting',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    // Edit the appointment
    await calendar.clickItemEdit('Original Meeting');
    await expect(editDialog.isOpen()).resolves.toBe(true);
    await expect(editDialog.isEditingAppointment()).resolves.toBe(true);

    await editDialog.update({ name: 'Updated Meeting' });

    await expect(calendar.isItemVisible('Updated Meeting')).resolves.toBe(true);
    await expect(calendar.isItemVisible('Original Meeting')).resolves.toBe(false);
  });

  test('should create appointment with attendees', async ({ page }) => {
    // Create appointment with attendees
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Team Meeting',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
      attendees: 'Alice, Bob, Charlie',
    });

    await expect(calendar.isItemVisible('Team Meeting')).resolves.toBe(true);

    // Expand to verify attendees are shown
    await calendar.expandItem('Team Meeting');
    
    // Verify attendees are visible in expanded content (attendee pills)
    await page.waitForTimeout(200);
    const attendee = page.locator('span:has-text("Alice")').first();
    await expect(attendee).toBeVisible({ timeout: 2000 });
  });

  test('should delete an appointment', async ({ page }) => {
    // Create appointment first
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Meeting to Delete',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    await expect(calendar.isItemVisible('Meeting to Delete')).resolves.toBe(true);

    // Delete the appointment
    await calendar.clickItemDelete('Meeting to Delete');
    await expect(deleteDialog.isOpen()).resolves.toBe(true);

    const itemName = await deleteDialog.getItemName();
    expect(itemName).toContain('Meeting to Delete');

    await deleteDialog.confirm();

    await expect(deleteDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Meeting to Delete')).resolves.toBe(false);
  });

  test('should cancel appointment creation', async ({ page }) => {
    await header.clickAddAppointment();
    await expect(addAppointmentDialog.isOpen()).resolves.toBe(true);

    await addAppointmentDialog.fill({
      name: 'Cancelled Meeting',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });
    await addAppointmentDialog.cancel();

    await expect(addAppointmentDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Cancelled Meeting')).resolves.toBe(false);
  });

  test('should cancel appointment deletion', async ({ page }) => {
    // Create appointment first
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Meeting to Keep',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    // Delete the appointment but cancel
    await calendar.clickItemDelete('Meeting to Keep');
    await expect(deleteDialog.isOpen()).resolves.toBe(true);

    await deleteDialog.cancel();

    await expect(deleteDialog.isOpen()).resolves.toBe(false);
    await expect(calendar.isItemVisible('Meeting to Keep')).resolves.toBe(true);
  });

  test('should change appointment priority', async ({ page }) => {
    // Create appointment with default priority
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Priority Meeting',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    // Edit and change priority
    await calendar.clickItemEdit('Priority Meeting');
    await editDialog.setPriority('Medium');
    await editDialog.save();

    // Verify appointment still visible after priority change
    await expect(calendar.isItemVisible('Priority Meeting')).resolves.toBe(true);
  });

  test('should add appointment description', async ({ page }) => {
    await header.clickAddAppointment();
    await addAppointmentDialog.addAppointment({
      name: 'Meeting with Description',
      description: 'Agenda: Discuss Q4 goals',
      startDate: getTomorrowDate(),
      endDate: getTomorrowDate(),
    });

    // Expand the appointment to see description
    await calendar.expandItem('Meeting with Description');
    
    // Description should be visible in expanded content
    const descriptionText = page.locator('text=Agenda: Discuss Q4 goals');
    await expect(descriptionText.first()).toBeVisible();
  });

  test('should create multi-day appointment', async ({ page }) => {
    await header.clickAddAppointment();

    await addAppointmentDialog.addAppointment({
      name: 'Conference',
      startDate: getTodayDate(),
      startTime: '09:00',
      endDate: getTomorrowDate(),
      endTime: '17:00',
    });

    await expect(calendar.isItemVisible('Conference')).resolves.toBe(true);
  });
});
