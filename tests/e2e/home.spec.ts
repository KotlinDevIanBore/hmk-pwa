import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/en');

    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HMK PWA');

    // Check for welcome message
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Welcome');

    // Check for login and register buttons
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/en');

    // The skip link should be present
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeInTheDocument();
  });

  test('should have accessibility controls', async ({ page }) => {
    await page.goto('/en');

    // Check for accessibility settings button
    const accessibilityButton = page.getByRole('button', { name: /accessibility settings/i });
    await expect(accessibilityButton).toBeVisible();

    // Click to open the menu
    await accessibilityButton.click();

    // Check for font size options
    await expect(page.getByRole('button', { name: /normal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /large/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /extra large/i })).toBeVisible();

    // Check for high contrast toggle
    await expect(page.getByRole('switch', { name: /high contrast/i })).toBeVisible();
  });

  test('should have language switcher', async ({ page }) => {
    await page.goto('/en');

    // Check for language switcher
    const languageButton = page.getByRole('button', { name: /english/i });
    await expect(languageButton).toBeVisible();

    // Click to open language menu
    await languageButton.click();

    // Check for language options
    await expect(page.getByRole('menuitem', { name: /kiswahili/i })).toBeVisible();
  });

  test('should switch language to Swahili', async ({ page }) => {
    await page.goto('/en');

    // Open language switcher
    const languageButton = page.getByRole('button', { name: /english/i });
    await languageButton.click();

    // Click Kiswahili option
    await page.getByRole('menuitem', { name: /kiswahili/i }).click();

    // Wait for navigation
    await page.waitForURL('/sw');

    // Check that content is in Swahili
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Karibu');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/en');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // The first focusable element should be the skip link
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Continue tabbing to ensure navigation works
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate elements with Enter/Space
    await page.keyboard.press('Enter');
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/en');

    // Check for feature cards
    await expect(page.getByText(/appointments/i)).toBeVisible();
    await expect(page.getByText(/mobility devices/i)).toBeVisible();
    await expect(page.getByText(/services/i)).toBeVisible();
    await expect(page.getByText(/caregiver support/i)).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/en');

    // Check heading levels
    const h1 = page.getByRole('heading', { level: 1 });
    const h2List = page.getByRole('heading', { level: 2 });
    const h3List = page.getByRole('heading', { level: 3 });

    await expect(h1).toHaveCount(1);
    await expect(h2List).toHaveCount.greaterThan(0);
    await expect(h3List).toHaveCount.greaterThan(0);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');

    // Check that page loads correctly
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check that buttons are accessible
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
    
    // Check responsive menu items
    await expect(page.getByRole('button', { name: /accessibility settings/i })).toBeVisible();
  });
});

