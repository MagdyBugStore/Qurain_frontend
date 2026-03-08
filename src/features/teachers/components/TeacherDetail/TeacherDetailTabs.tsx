/**
 * Teacher Detail Tabs Component
 * Tab navigation for teacher detail sections
 */

import React from 'react';
import type { TabType } from '../../../../shared/types/teacher.types';

interface TeacherDetailTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'personal' as TabType, label: 'نبذة عني', icon: 'person' },
  { id: 'availability' as TabType, label: 'الأوقات المتاحة', icon: 'calendar_month' },
  { id: 'reviews' as TabType, label: 'التقييمات', icon: 'reviews' },
];

export function TeacherDetailTabs({ activeTab, onTabChange }: TeacherDetailTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav aria-label="Tabs" className="-mb-px flex space-x-8 space-x-reverse">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 text-base flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-light hover:text-text-dark hover:border-gray-300 font-medium'
            }`}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
