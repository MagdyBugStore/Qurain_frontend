/**
 * Sub tabs component for personal tab sections
 */

import type { SubTab } from '../types';

interface SubTabsProps {
  activeTab: SubTab;
  onTabChange: (tab: 'content' | 'qualifications' | 'availability' | 'reviews') => void;
}

export function SubTabs({ activeTab, onTabChange }: SubTabsProps) {
  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="bg-white dark:bg-background-dark rounded-xl p-4 border border-primary/10 shadow-sm">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={() => {
            onTabChange('content');
            scrollToElement('content');
          }}
          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'content'
              ? 'bg-primary text-slate-900'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          المنهج
        </button>
        <button
          onClick={() => {
            onTabChange('availability');
            scrollToElement('availability');
          }}
          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'availability'
              ? 'bg-primary text-slate-900'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          جدول التوفر
        </button>
        <button
          onClick={() => {
            onTabChange('reviews');
            scrollToElement('reviews');
          }}
          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'reviews'
              ? 'bg-primary text-slate-900'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          التقييمات
        </button>
      </div>
    </div>
  );
}
