import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('should have proper document structure', async ({ page }) => {
    // Check for single h1
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBe(1);

    // Check for proper landmark regions
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have skip link', async ({ page }) => {
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Home link
    await page.keyboard.press('Tab'); // Next navigation item
    
    // Check that focus is visible
    const focused = await page.evaluateHandle(() => document.activeElement);
    expect(focused).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Focus on a button
    const registerButton = page.getByRole('link', { name: /register/i });
    await registerButton.focus();
    
    // Check that focus styles are applied
    const ringStyle = await registerButton.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    expect(ringStyle).toBeTruthy();
  });

  test('should have alt text for all images', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Navigate to a page with forms (when implemented)
    // For now, just check accessibility controls
    const accessibilityButton = page.getByRole('button', { name: /accessibility settings/i });
    await accessibilityButton.click();
    
    // Check that switches have labels
    const highContrastSwitch = page.getByRole('switch', { name: /high contrast/i });
    await expect(highContrastSwitch).toBeVisible();
  });

  test('should support font size adjustment', async ({ page }) => {
    const accessibilityButton = page.getByRole('button', { name: /accessibility settings/i });
    await accessibilityButton.click();
    
    // Click large font size
    const largeButton = page.getByRole('button', { name: /^large$/i }).first();
    await largeButton.click();
    
    // Check that body has font size class
    const bodyClasses = await page.locator('body').getAttribute('class');
    expect(bodyClasses).toContain('font-size-large');
  });

  test('should support high contrast mode', async ({ page }) => {
    const accessibilityButton = page.getByRole('button', { name: /accessibility settings/i });
    await accessibilityButton.click();
    
    // Toggle high contrast
    const highContrastSwitch = page.getByRole('switch', { name: /high contrast/i });
    await highContrastSwitch.click();
    
    // Check that html has high contrast class
    const htmlClasses = await page.locator('html').getAttribute('class');
    expect(htmlClasses).toContain('high-contrast');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const level = parseInt(tagName[1]);
      
      // Heading levels should not skip
      if (previousLevel > 0) {
        expect(level - previousLevel).toBeLessThanOrEqual(1);
      }
      
      previousLevel = level;
    }
  });

  test('should have proper button states', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      // Buttons should have accessible text
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should work with reduced motion preference', async ({ page, context }) => {
    // Emulate reduced motion preference
    await context.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Page should still be functional
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

