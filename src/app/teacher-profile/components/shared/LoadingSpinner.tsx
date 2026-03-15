/**
 * Loading spinner component
 */

import Header from '../../../../components/layout/Header';

export function LoadingSpinner() {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    </>
  );
}
