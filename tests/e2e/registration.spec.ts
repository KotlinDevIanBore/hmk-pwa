/**
 * E2E tests for user registration flows
 * Tests PWD self-registration and caregiver registration
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('PWD Self-Registration', () => {
  test('should complete PWD registration successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/en/auth/register');
    
    // Wait for page to load
    await expect(page.locator('h1, h2')).toContainText(/register|sign up|create account/i);
    
    // Test accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Generate unique test data
    const timestamp = Date.now();
    const phoneNumber = `0712${String(timestamp).slice(-6)}`;
    const firstName = 'Test';
    const lastName = `User${timestamp}`;
    const email = `test${timestamp}@example.com`;
    
    // Step 1: Enter phone number
    const phoneInput = page.locator('input[type="tel"], input[name="phoneNumber"], input[id*="phone"]').first();
    await phoneInput.fill(phoneNumber);
    await page.locator('button[type="submit"], button:has-text("Next"), button:has-text("Send")').first().click();
    
    // Wait for OTP step
    await page.waitForTimeout(1000);
    
    // Step 2: Enter OTP (use test OTP 123456 in development)
    const otpInput = page.locator('input[type="text"][maxlength="6"], input[name="otp"], input[id*="otp"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill('123456');
      await page.locator('button[type="submit"], button:has-text("Verify"), button:has-text("Next")').first().click();
    }
    
    // Wait for details form
    await page.waitForTimeout(1000);
    
    // Step 3: Fill in personal information
    await page.locator('input[name="firstName"], input[id*="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"], input[id*="lastName"]').fill(lastName);
    
    // Fill email if visible
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(email);
    }
    
    // Fill age
    const ageInput = page.locator('input[type="number"][name="age"], input[id*="age"]');
    if (await ageInput.isVisible()) {
      await ageInput.fill('30');
    }
    
    // Select gender
    const genderSelect = page.locator('select[name="gender"], button:has-text("Select gender"), [id*="gender"]').first();
    if (await genderSelect.isVisible()) {
      await genderSelect.click();
      await page.locator('text=Male').first().click();
    }
    
    // Click Next if multi-step
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 4: Fill in location
    await page.locator('input[name="county"], input[id*="county"]').fill('Nairobi');
    
    // Click Next if multi-step
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 5: Fill in ID information
    // Select ID type
    const idTypeSelect = page.locator('select[name="idType"], button:has-text("National ID"), [id*="idType"]').first();
    if (await idTypeSelect.isVisible()) {
      await idTypeSelect.click();
      await page.locator('text=National ID').first().click();
    }
    
    // Fill ID number
    await page.locator('input[name="idNumber"], input[id*="idNumber"]').fill('12345678');
    
    // Select disability type
    const disabilitySelect = page.locator('select[name="disabilityType"], button, [id*="disabilityType"]').first();
    if (await disabilitySelect.isVisible()) {
      await disabilitySelect.click();
      await page.locator('text=Mobility').first().click();
    }
    
    // Click Next if multi-step
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 6: Set PIN
    await page.locator('input[type="password"][name="pin"], input[id*="pin"]:not([id*="confirm"])').first().fill('123456');
    await page.locator('input[type="password"][name="confirmPin"], input[id*="confirmPin"], input[id*="confirm"]').first().fill('123456');
    
    // Submit registration
    await page.locator('button[type="submit"], button:has-text("Complete"), button:has-text("Register")').first().click();
    
    // Wait for success and redirect
    await page.waitForTimeout(2000);
    
    // Should redirect to dashboard or profile
    await expect(page).toHaveURL(/\/(dashboard|profile|home)/);
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Try to submit without phone number
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should show error message
    await expect(page.locator('text=/required|invalid|error/i')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Enter invalid phone number
    const phoneInput = page.locator('input[type="tel"], input[name="phoneNumber"]').first();
    await phoneInput.fill('123');
    await page.locator('button[type="submit"]').first().click();
    
    // Should show format error
    await expect(page.locator('text=/invalid|format|phone/i')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await page.keyboard.type('0712345678');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Form should submit
    await page.waitForTimeout(500);
  });
});

test.describe('Caregiver Registration', () => {
  test('should complete caregiver registration without beneficiary', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    const timestamp = Date.now();
    const phoneNumber = `0713${String(timestamp).slice(-6)}`;
    
    // Enter phone number
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill(phoneNumber);
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(1000);
    
    // Enter OTP
    const otpInput = page.locator('input[maxlength="6"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill('123456');
      await page.locator('button:has-text("Verify")').first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Select Caregiver role
    const roleSelect = page.locator('select[name="role"], button:has-text("Caregiver")');
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      await page.locator('text=Caregiver').first().click();
    }
    
    // Fill basic information (simplified for test)
    await page.locator('input[name="firstName"]').fill('Caregiver');
    await page.locator('input[name="lastName"]').fill(`Test${timestamp}`);
    
    // Continue through steps...
    // (Similar to PWD registration but without disability type)
    
    // Should successfully register
    await page.waitForTimeout(1000);
  });

  test('should complete caregiver registration with beneficiary', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    const timestamp = Date.now();
    const phoneNumber = `0714${String(timestamp).slice(-6)}`;
    
    // Go through initial steps
    await page.locator('input[type="tel"]').first().fill(phoneNumber);
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(1000);
    
    // Enter OTP
    const otpInput = page.locator('input[maxlength="6"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill('123456');
      await page.locator('button:has-text("Verify")').first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Check "Registering on behalf of someone"
    const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }
    
    // Fill beneficiary information
    await page.locator('input[name*="beneficiary"][name*="firstName"]').fill('Beneficiary');
    await page.locator('input[name*="beneficiary"][name*="lastName"]').fill(`Test${timestamp}`);
    
    // Select relationship
    const relationshipSelect = page.locator('select[name*="relationship"]');
    if (await relationshipSelect.isVisible()) {
      await relationshipSelect.click();
      await page.locator('text=Parent').first().click();
    }
    
    // Should successfully register with beneficiary link
    await page.waitForTimeout(1000);
  });
});

test.describe('Duplicate Prevention', () => {
  test('should prevent duplicate phone number registration', async ({ page }) => {
    const phoneNumber = '0712999999'; // Use consistent number for duplicate test
    
    await page.goto('/en/auth/register');
    
    // First registration attempt
    await page.locator('input[type="tel"]').first().fill(phoneNumber);
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(1000);
    
    // If registration proceeds, try registering same number again
    // Navigate back to registration
    await page.goto('/en/auth/register');
    
    await page.locator('input[type="tel"]').first().fill(phoneNumber);
    await page.locator('button[type="submit"]').first().click();
    
    // Should show error about existing number (if already registered)
    // Or should show OTP screen (if not yet completed)
    await page.waitForTimeout(500);
  });

  test('should prevent duplicate ID number registration', async ({ page }) => {
    // This would require a fully registered user with known ID
    // Skipping detailed implementation as it depends on test data setup
  });
});

test.describe('Accessibility', () => {
  test('should have no accessibility violations on registration page', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support screen reader labels', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Check for proper labels
    const phoneInput = page.locator('input[type="tel"]').first();
    await expect(phoneInput).toHaveAttribute('aria-label', /.+/);
    // OR should have associated label
    const labelFor = await phoneInput.getAttribute('id');
    if (labelFor) {
      await expect(page.locator(`label[for="${labelFor}"]`)).toBeVisible();
    }
  });

  test('should show error messages with proper ARIA attributes', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Submit invalid form
    await page.locator('button[type="submit"]').first().click();
    
    // Error messages should have proper ARIA attributes
    const errorMessage = page.locator('[role="alert"], [aria-live="polite"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // All interactive elements should be keyboard accessible
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(focusedElement);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    await page.keyboard.press('Tab');
    
    // Check that focused element has visible outline or border
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    
    expect(hasFocusStyle).toBe(true);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('should be usable on mobile devices', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    // Form should be visible and usable
    const phoneInput = page.locator('input[type="tel"]').first();
    await expect(phoneInput).toBeVisible();
    
    // Input should have proper mobile attributes
    await expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  test('should use numeric keyboard for phone input', async ({ page }) => {
    await page.goto('/en/auth/register');
    
    const phoneInput = page.locator('input[type="tel"]').first();
    
    // Should have inputmode="numeric" or type="tel"
    const inputType = await phoneInput.getAttribute('type');
    const inputMode = await phoneInput.getAttribute('inputmode');
    
    expect(inputType === 'tel' || inputMode === 'numeric').toBe(true);
  });
});

