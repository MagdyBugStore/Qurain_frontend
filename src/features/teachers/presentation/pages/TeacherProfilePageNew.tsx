/**
 * TeacherProfilePage - Refactored Version
 * 
 * This is the new, clean version of the teacher profile page.
 * It demonstrates the clean architecture pattern:
 * - Uses hooks for data management (presentation layer)
 * - Uses use cases for business logic (application layer)
 * - Uses repository for data access (infrastructure layer)
 * - Separates concerns into focused section components
 * 
 * File size: ~150 lines (vs 1,767 lines in original)
 */

import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Header from '../../../../components/layout/Header';
import { useTeacherProfile } from '../hooks/useTeacherProfile';
import { PersonalInfoSection } from '../components/TeacherProfile/PersonalInfoSection';
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl, getTeacherSpecialization } from '../../../../shared/utils/teacher';

export function TeacherProfilePageNew() {
  const { user, userProfile } = useAuth();
  const { data: profileData, loading, error, refetch } = useTeacherProfile(user?.uid);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show loading state
  if (loading) {
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

  // Show error state
  if (error || !profileData) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">حدث خطأ أثناء تحميل البيانات</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </>
    );
  }

  const { application, profile } = profileData;
  const isPending = application?.status === 'pending';
  const isApproved = application?.status === 'approved';

  // Use utility functions to get teacher data
  const teacherName = getTeacherDisplayName(profile, application);
  const teacherTitle = getTeacherTitle(application);
  const profileImage = getTeacherImageUrl(profile);
  const specialization = getTeacherSpecialization(application);

  const sessionPrice = application?.hourlyRate || 0;
  const currency = application?.currency === 'SAR' ? 'ر.س' : 
                   application?.currency === 'USD' ? '$' :
                   application?.currency === 'EGP' ? 'ج.م' : 'ر.س';

  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveSuccess = () => {
    showSaveMessage('success', 'تم الحفظ بنجاح');
    refetch(); // Refresh data after save
  };

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <main className="flex-1 px-6 py-8 lg:px-20">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 rounded-xl p-4 flex items-center gap-3 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <span className={`material-symbols-outlined ${
                saveMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className={`font-bold ${
                saveMessage.type === 'success' 
                  ? 'text-green-900 dark:text-green-200' 
                  : 'text-red-900 dark:text-red-200'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          )}

          {/* Pending Status Banner */}
          {isPending && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">schedule</span>
              <div className="flex-1">
                <p className="font-bold text-amber-900 dark:text-amber-200">طلبك قيد المراجعة</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">سيتم مراجعة طلبك خلال 48 ساعة. سيتم إشعارك عند الموافقة على طلبك.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Column */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="relative shrink-0">
                      <img
                        alt={`صورة ${teacherName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                        src={profileImage}
                      />
                      {isApproved && (
                        <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
                          <span className="block w-3 h-3 bg-white rounded-full"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{teacherName}</h3>
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            تم التحقق
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">{teacherTitle}</p>
                      {specialization && (
                        <div className="pt-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">التخصص: </span>
                          <span className="font-medium text-slate-900 dark:text-white">{specialization}</span>
                        </div>
                      )}
                      {sessionPrice > 0 && (
                        <div className="pt-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">سعر الجلسة: </span>
                          <span className="text-primary font-bold">{sessionPrice} {currency}/ساعة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isApproved && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-full mt-6 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isEditing
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          : 'bg-primary text-slate-900 hover:brightness-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                      {isEditing ? 'إلغاء التعديل' : 'تعديل الملف العام'}
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Personal Information Section */}
              <PersonalInfoSection
                application={application}
                profile={profile}
                userEmail={user?.email || null}
                isEditing={isEditing}
                isPending={isPending}
                onEditToggle={() => setIsEditing(false)}
                onSaveSuccess={handleSaveSuccess}
              />

              {/* TODO: Add other sections as they are created */}
              {/* 
              <QualificationsSection
                qualifications={profileData.qualifications}
                ijazahs={profileData.ijazahs}
                isEditing={isEditing}
                isPending={isPending}
                onSaveSuccess={handleSaveSuccess}
              />
              
              <AvailabilitySection
                availability={profileData.availability}
                isEditing={isEditing}
                isPending={isPending}
                onSaveSuccess={handleSaveSuccess}
              />
              
              <WalletSection
                wallet={profileData.wallet}
                onSaveSuccess={handleSaveSuccess}
              />
              
              <SupportSection
                tickets={profileData.supportTickets}
                onSaveSuccess={handleSaveSuccess}
              />
              */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
