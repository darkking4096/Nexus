import React, { Suspense, lazy, ReactElement } from 'react';

/**
 * LazyLoadWrapper: Dynamically load components only when needed
 * Reduces initial bundle size by splitting route-based components
 *
 * Usage:
 * const DashboardPage = lazyLoad(() => import('../pages/DashboardPage'));
 */
export function lazyLoad<P extends Record<string, unknown> = Record<string, unknown>>(
  importStatement: () => Promise<{ default: React.ComponentType<P> }>
): React.ComponentType<P> {
  const Component = lazy(importStatement);

  return (props: P): ReactElement => (
    <Suspense fallback={<LazyLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Fallback component while lazy-loaded component is loading
 */
function LazyLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Example: How to use lazy loading in App.tsx
 *
 * import { lazyLoad } from './utils/lazyLoad';
 *
 * const DashboardPage = lazyLoad(() => import('./pages/DashboardPage'));
 * const ProfileWizard = lazyLoad(() => import('./pages/ProfileWizard'));
 *
 * // Then in routes:
 * <Route path="/dashboard" element={<DashboardPage />} />
 * <Route path="/profile-wizard" element={<ProfileWizard />} />
 */
