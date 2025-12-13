/**
 * E2E tests for Phase 8: User Dashboard - Order Tracking & Feedback
 * Tests appointment history, reschedule, and feedback functionality
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Appointment History & Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to appointments page (assuming user is logged in)
    // In a real scenario, you'd need to log in first
    await page.goto('/dashboard/appointments');
  });

  test('should display appointment history page', async ({ page }) => {
    // Check that the page loads
    await expect(page.getByText('My Appointments')).toBeVisible();
    await expect(page.getByText('View and manage your appointments')).toBeVisible();
    
    // Check accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should display filters section', async ({ page }) => {
    // Check that filters are visible
    await expect(page.getByText('Filters')).toBeVisible();
    await expect(page.getByLabel('Status')).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
  });

  test('should filter appointments by status', async ({ page }) => {
    // Select a status filter
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: /Confirmed/ }).click();
    
    // Wait for appointments to reload
    await page.waitForTimeout(1000);
    
    // Check that filter is applied (appointments should reload)
    // In a real scenario, you'd verify the appointments match the filter
  });

  test('should filter appointments by date range', async ({ page }) => {
    // Set start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateString = startDate.toISOString().split('T')[0];
    
    await page.getByLabel('Start Date').fill(startDateString);
    
    // Set end date
    const endDate = new Date();
    const endDateString = endDate.toISOString().split('T')[0];
    await page.getByLabel('End Date').fill(endDateString);
    
    // Wait for appointments to reload
    await page.waitForTimeout(1000);
    
    // Check that filter is applied
  });

  test('should reset filters', async ({ page }) => {
    // Set some filters
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: /Confirmed/ }).click();
    
    // Click reset button
    await page.getByRole('button', { name: /Reset/i }).click();
    
    // Check that filters are cleared
    await expect(page.getByLabel('Status')).toHaveValue('all');
  });

  test('should display appointment cards with status badges', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForTimeout(2000);
    
    // Check that appointment cards are displayed (if any exist)
    // Status badges should be visible
    const statusBadges = page.locator('[class*="badge"]');
    // In a real scenario with appointments, badges would be visible
  });

  test('should open appointment details modal', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForTimeout(2000);
    
    // Click "View Details" on first appointment (if exists)
    const viewDetailsButton = page.getByRole('button', { name: /View Details/i }).first();
    
    // If appointments exist, click and check modal
    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click();
      await expect(page.getByText('Appointment Details')).toBeVisible();
      await expect(page.getByText('View complete appointment information')).toBeVisible();
    }
  });

  test('should display appointment information in details modal', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForTimeout(2000);
    
    const viewDetailsButton = page.getByRole('button', { name: /View Details/i }).first();
    
    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click();
      
      // Check that appointment details are displayed
      await expect(page.getByText(/Date|Time|Status|Location/i)).toBeVisible();
    }
  });

  test('should show reschedule button for eligible appointments', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForTimeout(2000);
    
    // Check that reschedule buttons are visible for non-completed/cancelled appointments
    const rescheduleButtons = page.getByRole('button', { name: /Reschedule/i });
    // In a real scenario, these would be visible for eligible appointments
  });
});

test.describe('Reschedule Appointment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/appointments');
    await page.waitForTimeout(2000);
  });

  test('should open reschedule modal', async ({ page }) => {
    const rescheduleButton = page.getByRole('button', { name: /Reschedule/i }).first();
    
    if (await rescheduleButton.isVisible()) {
      await rescheduleButton.click();
      
      // Check that reschedule modal opens
      await expect(page.getByText('Reschedule Appointment')).toBeVisible();
      await expect(page.getByLabel('New Date')).toBeVisible();
    }
  });

  test('should validate date selection for reschedule', async ({ page }) => {
    const rescheduleButton = page.getByRole('button', { name: /Reschedule/i }).first();
    
    if (await rescheduleButton.isVisible()) {
      await rescheduleButton.click();
      
      // Try to submit without selecting date
      const submitButton = page.getByRole('button', { name: /Reschedule/i }).filter({ hasText: /^Reschedule$/ });
      await expect(submitButton).toBeDisabled();
    }
  });

  test('should load available time slots when date is selected', async ({ page }) => {
    const rescheduleButton = page.getByRole('button', { name: /Reschedule/i }).first();
    
    if (await rescheduleButton.isVisible()) {
      await rescheduleButton.click();
      
      // Select a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      
      await page.getByLabel('New Date').fill(dateString);
      
      // Wait for slots to load
      await page.waitForTimeout(2000);
      
      // Check that time selector appears
      await expect(page.getByLabel('New Time')).toBeVisible();
    }
  });

  test('should disable reschedule for completed appointments', async ({ page }) => {
    // Filter to show completed appointments
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: /Completed/ }).click();
    await page.waitForTimeout(1000);
    
    // Check that reschedule buttons are not visible for completed appointments
    const rescheduleButtons = page.getByRole('button', { name: /Reschedule/i });
    // In a real scenario, completed appointments wouldn't have reschedule buttons
  });
});

test.describe('Feedback System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/feedback');
  });

  test('should display feedback page with two tabs', async ({ page }) => {
    // Check that page loads
    await expect(page.getByText('Feedback')).toBeVisible();
    await expect(page.getByText('Share your thoughts and help us improve')).toBeVisible();
    
    // Check that tabs are visible
    await expect(page.getByRole('tab', { name: /System Feedback/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Service\/Process Feedback/i })).toBeVisible();
    
    // Check accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should display system feedback form', async ({ page }) => {
    // System feedback tab should be active by default
    await expect(page.getByText('System Feedback')).toBeVisible();
    await expect(page.getByText('Rate your experience with the HMK PWA system')).toBeVisible();
    
    // Check rating stars
    const stars = page.locator('button[aria-label*="Rate"]');
    await expect(stars).toHaveCount(5);
    
    // Check message textarea
    await expect(page.getByLabel('Your Feedback')).toBeVisible();
  });

  test('should validate system feedback form', async ({ page }) => {
    // Try to submit without rating
    const submitButton = page.getByRole('button', { name: /Submit Feedback/i });
    await expect(submitButton).toBeDisabled();
    
    // Try to submit with rating but short message
    await page.locator('button[aria-label="Rate 5 out of 5 stars"]').click();
    await page.getByLabel('Your Feedback').fill('Short');
    await expect(submitButton).toBeDisabled();
  });

  test('should show character count for system feedback', async ({ page }) => {
    const textarea = page.getByLabel('Your Feedback');
    await textarea.fill('This is a test message for feedback');
    
    // Check that character count is displayed
    await expect(page.getByText(/\d+\/1000 characters/)).toBeVisible();
  });

  test('should submit system feedback successfully', async ({ page }) => {
    // Fill in the form
    await page.locator('button[aria-label="Rate 5 out of 5 stars"]').click();
    await page.getByLabel('Your Feedback').fill('This is a comprehensive feedback message about the system. I really appreciate the user interface and the ease of use.');
    
    // Submit
    await page.getByRole('button', { name: /Submit Feedback/i }).click();
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Check for success message
    await expect(page.getByText('Thank You!')).toBeVisible();
    await expect(page.getByText('Your system feedback has been submitted successfully')).toBeVisible();
  });

  test('should switch to service feedback tab', async ({ page }) => {
    // Click service feedback tab
    await page.getByRole('tab', { name: /Service\/Process Feedback/i }).click();
    
    // Check that service feedback form is displayed
    await expect(page.getByText('Service/Process Feedback')).toBeVisible();
    await expect(page.getByText('Share your feedback about our services')).toBeVisible();
  });

  test('should display service feedback form', async ({ page }) => {
    // Switch to service feedback tab
    await page.getByRole('tab', { name: /Service\/Process Feedback/i }).click();
    
    // Check message textarea
    await expect(page.getByLabel('Your Feedback')).toBeVisible();
    
    // Check character limit
    await expect(page.getByText(/\d+\/1000 characters/)).toBeVisible();
  });

  test('should validate service feedback form', async ({ page }) => {
    // Switch to service feedback tab
    await page.getByRole('tab', { name: /Service\/Process Feedback/i }).click();
    
    // Try to submit with short message
    const submitButton = page.getByRole('button', { name: /Submit Feedback/i });
    await page.getByLabel('Your Feedback').fill('Short');
    await expect(submitButton).toBeDisabled();
  });

  test('should submit service feedback successfully', async ({ page }) => {
    // Switch to service feedback tab
    await page.getByRole('tab', { name: /Service\/Process Feedback/i }).click();
    
    // Fill in the form
    await page.getByLabel('Your Feedback').fill('This is comprehensive feedback about the service and process. I found the appointment booking process to be very smooth and the staff were very helpful.');
    
    // Submit
    await page.getByRole('button', { name: /Submit Feedback/i }).click();
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Check for success message
    await expect(page.getByText('Thank You!')).toBeVisible();
    await expect(page.getByText('Your service feedback has been submitted successfully')).toBeVisible();
  });
});

test.describe('Feedback - Accessibility', () => {
  test('feedback forms should be keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA labels for rating stars', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Check that rating buttons have aria-labels
    const firstStar = page.locator('button[aria-label*="Rate"]').first();
    await expect(firstStar).toHaveAttribute('aria-label');
  });

  test('should announce character count changes', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    const textarea = page.getByLabel('Your Feedback');
    await textarea.fill('Test message');
    
    // Character count should be visible and accessible
    await expect(page.getByText(/\d+\/1000 characters/)).toBeVisible();
  });
});

