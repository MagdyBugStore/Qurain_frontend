/**
 * Protected Route Component
 * مكون حماية المسارات - يتحقق من تسجيل الدخول واكتمال الملف الشخصي
 */

'use client'

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStore } from '../../store/useUserStore';
import { isProfileComplete } from '../../models/UserModel';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean; // هل يتطلب اكتمال الملف الشخصي
}

export default function ProtectedRoute({ 
  children, 
  requireProfileComplete = false 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading, isProfileComplete: checkProfileComplete } = useUserStore();

  useEffect(() => {
    // Wait for auth to finish loading
    // انتظار انتهاء تحميل المصادقة
    if (authLoading || profileLoading) {
      return;
    }
    // If user is not authenticated, redirect to choose role page
    // إذا لم يكن المستخدم مسجلاً، إعادة التوجيه إلى صفحة اختيار الدور
    if (!user) {
      navigate('/choose-role', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If profile completion is required, check and redirect
    // إذا كان اكتمال الملف مطلوباً، تحقق وأعد التوجيه
    if (requireProfileComplete) {
      // First check if accountType is set
      if (!userProfile?.accountType) {
        navigate('/choose-role', { 
          state: { from: location.pathname },
          replace: true 
        });
        return;
      }

      const profileIsComplete = checkProfileComplete();
      
      if (!profileIsComplete) {
        // Redirect to appropriate page based on accountType
        // إعادة التوجيه إلى الصفحة المناسبة حسب نوع الحساب
        if (userProfile.accountType === 'student') {
          navigate('/personal-info', { 
            state: { from: location.pathname },
            replace: true 
          });
        } else if (userProfile.accountType === 'teacher') {
          navigate('/teacher-application', { 
            state: { from: location.pathname },
            replace: true 
          });
        } else {
          navigate('/choose-role', { 
            state: { from: location.pathname },
            replace: true 
          });
        }
        return;
      }
    }
  }, [user, authLoading, profileLoading, userProfile, requireProfileComplete, navigate, location, checkProfileComplete]);

  // Show loading state while checking authentication
  // عرض حالة التحميل أثناء التحقق من المصادقة
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children
  // إذا لم يكن المستخدم مسجلاً، لا تعرض المحتوى
  if (!user) {
    return null;
  }

  // If profile completion is required and not complete, don't render children
  // إذا كان اكتمال الملف مطلوباً ولم يكتمل، لا تعرض المحتوى
  if (requireProfileComplete && !checkProfileComplete()) {
    return null;
  }

  // Render protected content
  // عرض المحتوى المحمي
  return <>{children}</>;
}
