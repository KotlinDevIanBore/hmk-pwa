import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'sw'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix for routes
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except static files and API routes
  matcher: [
    // Match all pathnames except:
    // - api routes
    // - _next (Next.js internals)
    // - static files (files with extensions)
    // - /admin (handled separately)
    '/((?!api|_next/static|_next/image|favicon.ico|admin|.*\\..*).*)',
  ],
};


