/**
 * Quick navigation links component
 */

import type { QuickTab } from '../types';

interface QuickLinksProps {
  activeTab: QuickTab;
  onTabChange: (tab: 'personal' | 'wallet' | 'support') => void;
}

export function QuickLinks({ activeTab, onTabChange }: QuickLinksProps) {
  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-xl p-6 space-y-4">
      <h4 className="font-bold text-xs sm:text-sm text-slate-500 uppercase tracking-wider">روابط سريعة</h4>
      <nav className="space-y-1">
        <button
          onClick={() => {
            onTabChange('personal');
            scrollToElement('content');
          }}
          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${
            activeTab === 'personal'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined filled text-lg sm:text-xl">account_circle</span>
          <span className="text-xs sm:text-sm font-medium">الملف الشخصي</span>
        </button>
        <button
          onClick={() => {
            onTabChange('wallet');
            scrollToElement('wallet');
          }}
          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${
            activeTab === 'wallet'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">account_balance_wallet</span>
          <span className="text-xs sm:text-sm font-medium">إدارة المحفظة</span>
        </button>
        <button
          onClick={() => {
            onTabChange('support');
            scrollToElement('support');
          }}
          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${
            activeTab === 'support'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">support_agent</span>
          <span className="text-xs sm:text-sm font-medium">الدعم الفني</span>
        </button>
      </nav>
    </div>
  );
}
