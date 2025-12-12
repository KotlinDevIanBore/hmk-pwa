import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { LiveRegion } from '@/components/accessibility/LiveRegion';

describe('Accessibility Components', () => {
  describe('ScreenReaderOnly', () => {
    it('should render children', () => {
      render(<ScreenReaderOnly>Hidden text</ScreenReaderOnly>);
      expect(screen.getByText('Hidden text')).toBeInTheDocument();
    });

    it('should have sr-only class', () => {
      const { container } = render(<ScreenReaderOnly>Hidden text</ScreenReaderOnly>);
      const span = container.querySelector('span');
      expect(span).toHaveClass('sr-only');
    });
  });

  describe('SkipLink', () => {
    it('should render with correct href', () => {
      render(<SkipLink href="#main">Skip to main</SkipLink>);
      const link = screen.getByText('Skip to main');
      expect(link).toHaveAttribute('href', '#main');
    });

    it('should have sr-only class by default', () => {
      render(<SkipLink href="#main">Skip to main</SkipLink>);
      const link = screen.getByText('Skip to main');
      expect(link).toHaveClass('sr-only');
    });
  });

  describe('LiveRegion', () => {
    it('should render with correct ARIA attributes', () => {
      render(<LiveRegion politeness="polite">Update message</LiveRegion>);
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });

    it('should support assertive politeness', () => {
      render(<LiveRegion politeness="assertive">Urgent update</LiveRegion>);
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'assertive');
    });
  });
});

