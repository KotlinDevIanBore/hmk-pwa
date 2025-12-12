/**
 * Performance utilities for low-bandwidth optimization
 */

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if device has slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
  }).connection;
  
  if (!connection) return false;
  
  return (
    connection.saveData ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  );
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Lazy load script
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Get image dimensions without loading the full image
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate image size for responsive images
 */
export function getResponsiveImageSize(
  containerWidth: number,
  devicePixelRatio = 1
): number {
  const sizes = [320, 640, 768, 1024, 1280, 1536, 1920];
  const targetWidth = containerWidth * devicePixelRatio;
  
  return sizes.find((size) => size >= targetWidth) || sizes[sizes.length - 1];
}

/**
 * Monitor web vitals
 */
export interface WebVitals {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function reportWebVitals(metric: WebVitals) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Web Vitals]', metric);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to analytics service
    // Example: gtag('event', metric.name, { value: metric.value });
  }
}

