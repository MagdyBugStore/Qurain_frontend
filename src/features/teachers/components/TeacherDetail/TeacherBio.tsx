/**
 * Teacher Bio Component
 * Displays teacher biography, teaching style, and qualifications
 */

import React from 'react';
import type { TeacherApplication, Qualification } from '../../../../shared/types/teacher.types';

interface TeacherBioProps {
  application: TeacherApplication;
  qualifications: Qualification[];
}

export function TeacherBio({ application, qualifications }: TeacherBioProps) {
  return (
    <div className="bg-bg-card rounded-xl p-6 sm:p-8 border border-gray-200 space-y-8">
      {/* Bio Section */}
      <section>
        <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          مرحباً بكم
        </h3>
        <div className="text-text-light leading-relaxed">
          <p className="mb-4">
            {application.bio || 'لا توجد نبذة متاحة'}
          </p>
        </div>
      </section>

      {/* Student Benefits */}
      {(() => {
        // Parse teachingStyle (benefits) from JSON string
        let benefits: Array<{ title: string; subject: string }> = [];
        try {
          if (application.teachingStyle) {
            const parsed = JSON.parse(application.teachingStyle);
            if (Array.isArray(parsed)) {
              benefits = parsed;
            }
          }
        } catch (e) {
          // If parsing fails, treat as empty
        }

        if (benefits.length === 0) {
          return null;
        }

        return (
          <section>
            <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              ما الثمار التي سيجنيها الطالب؟
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-bg-main p-4 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <h4 className="text-text-dark font-bold mb-1">{benefit.title || 'فائدة'}</h4>
                  <p className="text-sm text-text-light">{benefit.subject || 'وصف الفائدة...'}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Session Content */}
      {(() => {
        // Parse sessionContent from JSON string
        let sessionContent: Array<{ title: string; subject: string }> = [];
        try {
          if (application.sessionContent) {
            const parsed = JSON.parse(application.sessionContent);
            if (Array.isArray(parsed)) {
              sessionContent = parsed;
            }
          }
        } catch (e) {
          // If parsing fails, treat as empty
        }

        if (sessionContent.length === 0) {
          return null;
        }

        return (
          <section>
            <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              ماذا تتضمن الحصة؟
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {sessionContent.map((item, index) => (
                <div key={index} className="bg-bg-main p-4 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <h4 className="text-text-dark font-bold mb-1">{item.title || 'عنصر'}</h4>
                  <p className="text-sm text-text-light">{item.subject || 'وصف العنصر...'}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Resume / Certifications */}
      <section>
        <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          المؤهلات والشهادات
        </h3>
        <ul className="space-y-4">
          {qualifications.map((qual, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                {index < qualifications.length - 1 && (
                  <div className="w-0.5 bg-gray-200 flex-1 h-full mt-1"></div>
                )}
              </div>
              <div className={index < qualifications.length - 1 ? 'pb-4' : ''}>
                <h4 className="text-text-dark font-bold text-lg">{qual.title}</h4>
                <p className="text-text-light text-sm">{qual.institution} • {qual.year}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
