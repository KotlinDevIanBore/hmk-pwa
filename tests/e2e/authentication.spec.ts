/**
 * Authentication E2E Tests
 * Tests complete authentication flows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testPhoneNumber = '0712345678';
  const testPin = '1234';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/en');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('a[href="/en/auth/login"]');
    await expect(page).toHaveURL(/.*auth\/login/);
    await expect(page.locator('h2')).toContainText('Welcome back');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/en/auth/register"]');
    await expect(page).toHaveURL(/.*auth\/register/);
    await expect(page.locator('h2')).toContainText('Create your account');
  });

  test('should validate phone number on login', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Try to submit without phone number
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Phone number is required')).toBeVisible();
    
    // Try with invalid phone number
    await page.fill('input[type="tel"]', '123');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid Kenyan phone number')).toBeVisible();
  });

  test('should validate PIN on login', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Fill phone but not PIN
    await page.fill('input[type="tel"]', testPhoneNumber);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=PIN is required')).toBeVisible();
    
    // Try with short PIN
    await page.fill('input[type="password"]', '12');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=PIN must be 4-6 digits')).toBeVisible();
  });

  test('should show forgot PIN link', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    const forgotLink = page.locator('a[href="/auth/reset-pin"]');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toContainText('Forgot PIN');
  });

  test('should navigate to register from login', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*auth\/register/);
  });

  test('registration flow - phone step', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Verify initial step
    await expect(page.locator('h2')).toContainText('Create your account');
    
    // Validate phone number
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Phone number is required')).toBeVisible();
    
    // Enter valid phone
    await page.fill('input[type="tel"]', testPhoneNumber);
    
    // Note: In real test, we would mock the API response
    // For now, we just verify the form validation works
  });

  test('should show register link on login page', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    const registerLink = page.locator('a[href="/auth/register"]');
    await expect(registerLink).toBeVisible();
  });

  test('PIN reset flow - phone step', async ({ page }) => {
    await page.goto('/en/auth/reset-pin');
    
    // Verify page loaded
    await expect(page.locator('h2')).toContainText('Reset PIN');
    
    // Validate phone required
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Phone number is required')).toBeVisible();
    
    // Enter phone
    await page.fill('input[type="tel"]', testPhoneNumber);
  });

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Check for labels
    await expect(page.locator('label[for="phoneNumber"]')).toBeVisible();
    await expect(page.locator('label[for="pin"]')).toBeVisible();
    
    // Check inputs have proper attributes
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toHaveAttribute('placeholder');
    
    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toHaveAttribute('placeholder');
    await expect(pinInput).toHaveAttribute('maxlength', '6');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const forgotLink = page.locator('a[href="/auth/reset-pin"]');
    await expect(forgotLink).toBeFocused();
    
    await page.keyboard.press('Tab');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeFocused();
  });

  test('should show loading state on submit', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Fill form
    await page.fill('input[type="tel"]', testPhoneNumber);
    await page.fill('input[type="password"]', testPin);
    
    // Submit and check for loading state
    // Note: This will fail with API error, but we can check the button state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled();
  });

  test('registration - should show role selection', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // We would need to go through OTP verification first in a real scenario
    // For now, just verify the page structure
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test('should handle language switching on auth pages', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Verify English content
    await expect(page.locator('h2')).toContainText('Welcome back');
    
    // Switch to Swahili
    await page.click('button[aria-label*="language"]');
    await page.click('text=Swahili');
    
    // Verify Swahili content
    await expect(page).toHaveURL(/.*\/sw\/auth\/login/);
    await expect(page.locator('h2')).toContainText('Karibu tena');
  });

  test('should maintain accessibility on error states', async ({ page }) => {
    await page.goto('/en/auth/login');
    
    // Trigger validation errors
    await page.click('button[type="submit"]');
    
    // Check that error messages have proper ARIA roles
    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
    
    // Check that inputs have aria-invalid when errors
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('SMS Simulator Dashboard', () => {
  test('should load SMS simulator page', async ({ page }) => {
    await page.goto('/en/admin/sms-simulator');
    
    await expect(page.locator('h1')).toContainText('SMS Simulator Dashboard');
  });

  test('should have filters', async ({ page }) => {
    await page.goto('/en/admin/sms-simulator');
    
    // Check for filter controls
    await expect(page.locator('label[for="searchPhone"]')).toBeVisible();
    await expect(page.locator('label[for="filterStatus"]')).toBeVisible();
    await expect(page.locator('label[for="filterPurpose"]')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('/en/admin/sms-simulator');
    
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
  });

  test('phone number filter should work', async ({ page }) => {
    await page.goto('/en/admin/sms-simulator');
    
    const searchInput = page.locator('input[type="tel"]');
    await searchInput.fill('0712345678');
    
    // In a real test with data, we would verify filtered results
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/en/admin/sms-simulator');
    
    // Tab through filter controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate all interactive elements
    const searchInput = page.locator('input[type="tel"]');
    await expect(searchInput).toBeFocused();
  });
});

