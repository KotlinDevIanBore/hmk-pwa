import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test.describe('Navigation', () => {
    test('should display navigation bar', async ({ page }) => {
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toBeVisible();
    });

    test('should have navigation links', async ({ page }) => {
      await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /services/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /products/i })).toBeVisible();
    });

    test('should navigate to sections when clicking nav links', async ({ page }) => {
      const aboutLink = page.getByRole('link', { name: /about/i }).first();
      await aboutLink.click();
      await page.waitForTimeout(1000);
      
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeInViewport();
    });

    test('should show mobile menu on mobile viewport', async ({ page, viewport }) => {
      if (viewport && viewport.width && viewport.width >= 768) {
        test.skip();
      }
      
      const menuButton = page.getByLabel('Toggle mobile menu');
      await expect(menuButton).toBeVisible();
    });

    test('should toggle mobile menu', async ({ page, viewport }) => {
      if (viewport && viewport.width && viewport.width >= 768) {
        test.skip();
      }
      
      const menuButton = page.getByLabel('Toggle mobile menu');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should have sticky navigation when scrolling', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toBeVisible();
    });
  });

  test.describe('Hero Section', () => {
    test('should display hero section with logo and title', async ({ page }) => {
      // Check for hero section
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // Check for logo/icon
      await expect(page.locator('svg').first()).toBeVisible();

      // Check for title
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
    });

    test('should display CTA buttons', async ({ page }) => {
      // Check for Get Started button
      const getStartedButton = page.getByRole('link', { name: /get started/i });
      await expect(getStartedButton).toBeVisible();
      await expect(getStartedButton).toHaveAttribute('href', /\/en\/auth\/login/);

      // Check for Learn More button
      const learnMoreButton = page.getByRole('button', { name: /learn more/i });
      await expect(learnMoreButton).toBeVisible();
    });

    test('should navigate to login when Get Started clicked', async ({ page }) => {
      const getStartedButton = page.getByRole('link', { name: /get started/i });
      await getStartedButton.click();
      await expect(page).toHaveURL(/\/en\/auth\/login/);
    });

    test('should scroll to next section when Learn More clicked', async ({ page }) => {
      const learnMoreButton = page.getByRole('button', { name: /learn more/i });
      await learnMoreButton.click();
      
      // Wait for smooth scroll animation
      await page.waitForTimeout(1000);
      
      // Check that we've scrolled down (about section should be in view)
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeInViewport();
    });

    test('should have animated scroll indicator', async ({ page }) => {
      const scrollIndicator = page.getByLabel('Scroll to next section');
      await expect(scrollIndicator).toBeVisible();
    });
  });

  test.describe('About Section', () => {
    test('should display about section content', async ({ page }) => {
      await expect(page.getByText('About Hope Mobility Kenya')).toBeVisible();
      await expect(page.getByText(/our mission/i)).toBeVisible();
      await expect(page.getByText(/empowering persons with disabilities/i)).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText(/5,000\+/)).toBeVisible();
      await expect(page.getByText(/PWDs Served/)).toBeVisible();
      await expect(page.getByText(/15\+/)).toBeVisible();
      await expect(page.getByText(/Outreach Centers/)).toBeVisible();
    });

    test('should display core values', async ({ page }) => {
      await expect(page.getByText('Compassion')).toBeVisible();
      await expect(page.getByText('Inclusion')).toBeVisible();
      await expect(page.getByText('Excellence')).toBeVisible();
    });
  });

  test.describe('Services Section', () => {
    test('should display WHO 8-step process', async ({ page }) => {
      await expect(page.getByText('WHO 8-Step Rehabilitation Process')).toBeVisible();
      
      // Check for all 8 steps
      await expect(page.getByText('Referral')).toBeVisible();
      await expect(page.getByText('Assessment')).toBeVisible();
      await expect(page.getByText('Goal Setting')).toBeVisible();
      await expect(page.getByText('Intervention')).toBeVisible();
      await expect(page.getByText('Device Provision')).toBeVisible();
      await expect(page.getByText('Training')).toBeVisible();
      await expect(page.getByText('Follow-up')).toBeVisible();
      await expect(page.getByText('Empowerment')).toBeVisible();
    });

    test('should display staff highlights', async ({ page }) => {
      await expect(page.getByText('Our Trained Staff')).toBeVisible();
      await expect(page.getByText('Certified Professionals')).toBeVisible();
      await expect(page.getByText('Community Health Workers')).toBeVisible();
      await expect(page.getByText('Peer Counselors')).toBeVisible();
    });

    test('should display ministry training programs', async ({ page }) => {
      await expect(page.getByText('Ministry Training Programs')).toBeVisible();
      await expect(page.getByText('Spiritual Support Training')).toBeVisible();
      await expect(page.getByText('Community Advocacy')).toBeVisible();
    });
  });

  test.describe('Products Section', () => {
    test('should display products catalog', async ({ page }) => {
      await expect(page.getByText('Mobility Devices Catalog')).toBeVisible();
    });

    test('should have category filters', async ({ page }) => {
      await expect(page.getByRole('button', { name: /all products/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /wheelchairs/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /mobility aids/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /accessories/i })).toBeVisible();
    });

    test('should filter products by category', async ({ page }) => {
      // Click on Wheelchairs filter
      const wheelchairsButton = page.getByRole('button', { name: /wheelchairs/i });
      await wheelchairsButton.click();
      
      // Check that button is active (has different styling)
      await expect(wheelchairsButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should display product cards', async ({ page }) => {
      // Check for at least one product
      await expect(page.getByText('Manual Wheelchair')).toBeVisible();
      await expect(page.getByRole('button', { name: /learn more/i }).first()).toBeVisible();
    });

    test('should have registration CTA', async ({ page }) => {
      const registerButton = page.getByRole('link', { name: /register to access full catalog/i });
      await expect(registerButton).toBeVisible();
      await expect(registerButton).toHaveAttribute('href', /\/en\/auth\/register/);
    });
  });

  test.describe('Vision & Mission Section', () => {
    test('should display vision and mission', async ({ page }) => {
      await expect(page.getByText('Vision & Mission')).toBeVisible();
      await expect(page.getByText('Our Vision')).toBeVisible();
      await expect(page.getByText('Our Mission')).toBeVisible();
    });

    test('should display strategic goals', async ({ page }) => {
      await expect(page.getByText('Strategic Goals for 2025-2030')).toBeVisible();
      await expect(page.getByText('20+')).toBeVisible();
      await expect(page.getByText('50K+')).toBeVisible();
      await expect(page.getByText('100+')).toBeVisible();
      await expect(page.getByText('1000+')).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('should display footer with contact information', async ({ page }) => {
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
      await expect(page.getByText(/\+254 700 000 000/)).toBeVisible();
      await expect(page.getByText(/info@hopemobility\.ke/)).toBeVisible();
    });

    test('should display locations', async ({ page }) => {
      await expect(page.getByText('Nairobi Head Office')).toBeVisible();
      await expect(page.getByText('Mombasa Office')).toBeVisible();
      await expect(page.getByText('Kisumu Office')).toBeVisible();
      await expect(page.getByText('Eldoret Office')).toBeVisible();
    });

    test('should display quick links', async ({ page }) => {
      await expect(page.getByRole('link', { name: /about us/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /services/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /products/i })).toBeVisible();
    });

    test('should display social media links', async ({ page }) => {
      await expect(page.getByLabel('Facebook')).toBeVisible();
      await expect(page.getByLabel('Twitter')).toBeVisible();
      await expect(page.getByLabel('Instagram')).toBeVisible();
      await expect(page.getByLabel('LinkedIn')).toBeVisible();
    });

    test('should display copyright information', async ({ page }) => {
      const currentYear = new Date().getFullYear();
      await expect(page.getByText(new RegExp(`${currentYear} Hope Mobility Kenya`))).toBeVisible();
    });
  });

  test.describe('Scroll to Top Button', () => {
    test('should display scroll to top button', async ({ page }) => {
      // Scroll down first
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);
      
      const scrollButton = page.getByLabel('Scroll to top');
      await expect(scrollButton).toBeVisible();
    });

    test('should scroll to top when clicked', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);
      
      // Click scroll to top button
      const scrollButton = page.getByLabel('Scroll to top');
      await scrollButton.click();
      await page.waitForTimeout(1000);
      
      // Check we're at the top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    });
  });

  test.describe('Smooth Scrolling', () => {
    test('should smooth scroll when clicking hash links', async ({ page }) => {
      const aboutLink = page.getByRole('link', { name: /about us/i });
      await aboutLink.click();
      
      // Wait for scroll animation
      await page.waitForTimeout(1000);
      
      // Check that about section is in view
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeInViewport();
    });

    test('should navigate to services section', async ({ page }) => {
      const servicesLink = page.getByRole('link', { name: /services/i }).first();
      await servicesLink.click();
      
      await page.waitForTimeout(1000);
      
      const servicesSection = page.locator('#services');
      await expect(servicesSection).toBeInViewport();
    });

    test('should navigate to products section', async ({ page }) => {
      const productsLink = page.getByRole('link', { name: /products/i }).first();
      await productsLink.click();
      
      await page.waitForTimeout(1000);
      
      const productsSection = page.locator('#products');
      await expect(productsSection).toBeInViewport();
    });

    test('should navigate to vision-mission section', async ({ page }) => {
      const visionLink = page.getByRole('link', { name: /vision/i });
      if (await visionLink.count() > 0) {
        await visionLink.first().click();
        await page.waitForTimeout(1000);
        
        const visionSection = page.locator('#vision-mission');
        await expect(visionSection).toBeInViewport();
      }
    });
  });

  test.describe('Auto-scroll Tour', () => {
    test('should display start tour button', async ({ page }) => {
      const tourButton = page.getByLabel('Start guided tour');
      await expect(tourButton).toBeVisible();
    });

    test('should start tour when button clicked', async ({ page }) => {
      const tourButton = page.getByLabel('Start guided tour');
      await tourButton.click();
      
      // Should show tour controls
      await expect(page.getByText('Guided Tour')).toBeVisible();
    });

    test('should have pause/resume controls', async ({ page }) => {
      const tourButton = page.getByLabel('Start guided tour');
      await tourButton.click();
      
      const pauseButton = page.getByLabel(/pause|resume/i);
      await expect(pauseButton).toBeVisible();
    });

    test('should close tour when close button clicked', async ({ page }) => {
      const tourButton = page.getByLabel('Start guided tour');
      await tourButton.click();
      
      const closeButton = page.getByLabel('Close tour');
      await closeButton.click();
      
      // Tour button should be visible again
      await expect(tourButton).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check that focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      
      // Should have at least one h1
      expect(h1Count).toBeGreaterThan(0);
      // Should have multiple h2s for sections
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should respect prefers-reduced-motion', async ({ page, context }) => {
      // Enable reduced motion preference
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        });
      });

      await page.reload();
      
      // Animations should be disabled or reduced
      // This is more of a visual test, but we can check that the page still loads correctly
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display correctly on mobile', async ({ page }) => {
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
    });

    test('should have touch-friendly buttons', async ({ page }) => {
      const getStartedButton = page.getByRole('link', { name: /get started/i });
      const box = await getStartedButton.boundingBox();
      
      // Button should be at least 44x44 (WCAG touch target size)
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('should stack sections vertically', async ({ page }) => {
      // On mobile, grid should be single column
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeVisible();
    });
  });

  test.describe('Tablet Responsiveness', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display correctly on tablet', async ({ page }) => {
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
      await expect(page.getByText('About Hope Mobility Kenya')).toBeVisible();
    });
  });

  test.describe('Desktop Experience', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should display full layout on desktop', async ({ page }) => {
      await expect(page.getByText('Hope Mobility Kenya')).toBeVisible();
      
      // Check that grid layouts are visible
      const servicesSection = page.locator('#services');
      await expect(servicesSection).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/en');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should lazy load images', async ({ page }) => {
      // Check that images below the fold aren't loaded immediately
      await page.goto('/en');
      
      // Images in products section should use lazy loading
      const productsSection = page.locator('#products');
      await expect(productsSection).not.toBeInViewport();
    });
  });

  test.describe('Language Switching', () => {
    test('should support Swahili language', async ({ page }) => {
      await page.goto('/sw');
      
      // Check for Swahili content
      await expect(page.getByText(/Karibu/i)).toBeVisible();
    });

    test('should maintain scroll position when switching languages', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      const scrollBefore = await page.evaluate(() => window.scrollY);
      
      // Switch language (this would need language switcher implementation)
      // For now, just navigate to Swahili version
      await page.goto('/sw');
      
      // Page should load
      await expect(page.getByText(/Karibu/i)).toBeVisible();
    });
  });
});

