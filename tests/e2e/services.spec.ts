import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Services Module E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[name="phoneNumber"]', '0712345678');
    await page.fill('[name="pin"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Complete operational service request flow', async ({ page }) => {
    // Navigate to services
    await page.goto('/dashboard/services');
    await expect(page.locator('h1')).toContainText('Services');

    // Click on Assessment/Fitting
    await page.click('text=Assessment/Fitting');
    await page.waitForURL('/dashboard/services/assessment');

    // Fill assessment form
    await expect(page.locator('text=Disability Assessment Questionnaire')).toBeVisible();
    
    // Answer first question
    await page.click('text=1-5 years');
    await page.click('button:has-text("Next")');

    // Answer second question
    await page.click('text=Requires assistance');
    await page.click('button:has-text("Next")');

    // Answer yes-no question
    await page.click('text=Yes');
    await page.click('button:has-text("Next")');

    // Fill open-ended question
    await page.fill('textarea', 'Previous device was helpful but needed replacement');
    await page.click('button:has-text("Next")');

    // Continue through remaining questions (simplified)
    // ... add more steps as needed

    // Submit assessment
    await page.click('button:has-text("Submit")');
    
    // Should redirect to device selection
    await page.waitForURL('/dashboard/services/devices');
    await expect(page.locator('h1')).toContainText('Device Catalog');

    // Select a device
    await page.click('input[type="checkbox"]').first();
    
    // Submit request
    await page.click('button:has-text("Submit Request")');
    
    // Should show success message
    await expect(page.locator('text=Service requested successfully')).toBeVisible();
  });

  test('Complete spiritual service request flow', async ({ page }) => {
    // Navigate to services
    await page.goto('/dashboard/services');
    
    // Click on Spiritual Assessment
    await page.click('text=Spiritual Assessment');
    await page.waitForURL('/dashboard/services/spiritual/assessment');

    // Check contact information is displayed
    await expect(page.locator('text=Contact Information')).toBeVisible();
    await expect(page.locator('text=Phone')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();

    // Click book appointment
    await page.click('button:has-text("Book Appointment")');
    
    // Should navigate to appointments page
    await expect(page).toHaveURL(/.*appointments/);
  });

  test('Questionnaire save and resume functionality', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/dashboard/services/assessment');
    
    // Answer first question
    await page.click('text=1-5 years');
    
    // Save and continue later
    await page.click('button:has-text("Save & Continue Later")');
    
    // Should show success message
    await expect(page.locator('text=Assessment saved')).toBeVisible();

    // Navigate away and come back
    await page.goto('/dashboard');
    await page.goto('/dashboard/services/assessment');

    // Check that previous answer is still there
    await expect(page.locator('input[value="1-5 years"]')).toBeChecked();
  });

  test('Device catalog filtering and selection', async ({ page }) => {
    await page.goto('/dashboard/services/devices');

    // Test category filter
    await page.selectOption('select', 'wheelchair');
    const wheelchairCount = await page.locator('[data-testid="device-card"]').count();
    expect(wheelchairCount).toBeGreaterThan(0);

    // Test search
    await page.fill('input[placeholder*="Search"]', 'crutch');
    await page.waitForTimeout(500); // Wait for debounce
    const searchResults = await page.locator('[data-testid="device-card"]').count();
    expect(searchResults).toBeGreaterThan(0);

    // Select multiple devices
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 0) {
      await checkboxes.first().check();
      if (count > 1) {
        await checkboxes.nth(1).check();
      }
    }

    // View device details
    await page.click('button:has-text("Details")').first();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Specifications')).toBeVisible();
  });

  test('Accessibility - Form navigation', async ({ page }) => {
    await page.goto('/dashboard/services/assessment');
    
    // Inject axe
    // Accessibility check ready
    
    // Check accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Select first option
    
    // Navigate to next button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Click next

    // Should move to next question
    await expect(page.locator('text=Step 2')).toBeVisible();
  });
});

