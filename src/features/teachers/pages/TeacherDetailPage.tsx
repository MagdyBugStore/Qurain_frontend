/**
 * Teacher Detail Page
 * Main page component for displaying teacher details
 * Refactored from TeacherDetailPageClient.tsx
 * 
 * All data is integrated from Firestore:
 * - Teacher application (bio, introVideo, teachingStyle, sessionContent, etc.)
 * - Teacher profile (displayName, photoURL, etc.)
 * - Ratings and reviews from reviews collection
 * - Qualifications from application
 * - Availability schedule from teacherAvailability collection
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import { useTeacherDetail } from '../hooks/useTeacherDetail';
import { TeacherDetailHeader } from '../components/TeacherDetail/TeacherDetailHeader';
import { TeacherVideoIntro } from '../components/TeacherDetail/TeacherVideoIntro';
import { TeacherDetailTabs } from '../components/TeacherDetail/TeacherDetailTabs';
import { TeacherBio } from '../components/TeacherDetail/TeacherBio';
import { TeacherAvailability } from '../components/TeacherDetail/TeacherAvailability';
import { TeacherReviews } from '../components/TeacherDetail/TeacherReviews';
import { TeacherSidebar } from '../components/TeacherDetail/TeacherSidebar';
import BookingModal from '../../../components/modals/BookingModal';
import LoginModal from '../../../components/modals/LoginModal';
import type { TabType } from '../../../shared/types/teacher.types';

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  const { data: teacherData, loading, error } = useTeacherDetail(id);

  const handleBookSession = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if user is a teacher - teachers cannot book other teachers
    if (userProfile?.accountType === 'teacher') {
      alert('المعلمون لا يمكنهم حجز حصص مع معلمين آخرين');
      return;
    }
    
    if (id) {
      navigate(`/teachers/${id}/book`);
    }
  };

  const handleSendMessage = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // TODO: Implement messaging
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !teacherData) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error ? 'حدث خطأ في تحميل البيانات' : 'المعلم غير موجود أو غير معتمد'}
            </p>
            <Link to="/teachers" className="text-primary hover:underline">
              العودة إلى قائمة المعلمين
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { application, profile, rating, reviewsCount, reviews, qualifications, availability } = teacherData;
  const isApproved = application.status === 'approved';
  const teacherName = profile?.displayName || application.fullName || 'المعلم';

  if (!isApproved) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">المعلم غير موجود أو غير معتمد</p>
            <Link to="/teachers" className="text-primary hover:underline">
              العودة إلى قائمة المعلمين
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl bg-bg-main">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-text-light mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/teachers" className="hover:text-primary transition-colors">
            المعلمين
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-text-dark font-medium">{teacherName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <TeacherDetailHeader
              application={application}
              profile={profile}
              rating={rating}
              reviewsCount={reviewsCount}
            />

            <TeacherVideoIntro introVideo={application.introVideo} />

            <TeacherDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'personal' && (
              <TeacherBio application={application} qualifications={qualifications} />
            )}

            {activeTab === 'availability' && (
              <TeacherAvailability availability={availability} />
            )}

            {activeTab === 'reviews' && (
              <TeacherReviews reviews={reviews} rating={rating} reviewsCount={reviewsCount} />
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <TeacherSidebar
              application={application}
              availability={availability}
              teacherId={id}
              onBookSession={handleBookSession}
              onSendMessage={handleSendMessage}
            />
          </aside>
        </div>
      </main>
      <BookingModal />
      <LoginModal />
    </>
  );
}
