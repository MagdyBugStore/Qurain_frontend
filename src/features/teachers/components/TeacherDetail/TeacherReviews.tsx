/**
 * Teacher Reviews Component
 * Displays teacher reviews and ratings
 */

import React from 'react';
import type { Review } from '../../../../shared/types/teacher.types';

interface TeacherReviewsProps {
  reviews: Review[];
  rating: number;
  reviewsCount: number;
}

export function TeacherReviews({ reviews, rating, reviewsCount }: TeacherReviewsProps) {
  // Format time from timestamp or use provided time string
  const formatReviewTime = (review: Review): string => {
    if (review.time) {
      return review.time;
    }
    // If createdAt exists, format it
    if ((review as any).createdAt) {
      const date = (review as any).createdAt?.toDate?.() || new Date((review as any).createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'اليوم';
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `قبل ${diffDays} أيام`;
      if (diffDays < 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`;
      if (diffDays < 365) return `قبل ${Math.floor(diffDays / 30)} أشهر`;
      return `قبل ${Math.floor(diffDays / 365)} سنوات`;
    }
    return 'منذ فترة';
  };

  // Get review name from review data or use default
  const getReviewName = (review: Review): string => {
    return review.name || (review as any).userName || (review as any).studentName || 'مستخدم';
  };

  // Get review avatar or use default
  const getReviewAvatar = (review: Review): string => {
    return review.avatar || (review as any).userAvatar || (review as any).photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(getReviewName(review));
  };

  return (
    <div className="bg-bg-card rounded-xl p-6 sm:p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">reviews</span>
        <h3 className="text-xl font-bold text-text-dark">التقييمات</h3>
        <div className="flex items-center gap-2 mr-auto">
          <span className="material-symbols-outlined text-primary text-lg filled">star</span>
          <span className="text-lg font-bold text-text-dark">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
          <span className="text-text-light text-sm">({reviewsCount} {reviewsCount === 1 ? 'تقييم' : 'تقييمات'})</span>
        </div>
      </div>
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const reviewName = getReviewName(review);
            const reviewAvatar = getReviewAvatar(review);
            const reviewTime = formatReviewTime(review);
            const reviewRating = review.rating || 0;
            const reviewComment = review.comment || (review as any).text || '';

            return (
              <div key={review.id || index} className="p-6 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-full bg-gray-100 bg-cover bg-center border border-gray-200 flex-shrink-0"
                      style={{ backgroundImage: reviewAvatar ? `url('${reviewAvatar}')` : 'none' }}
                    >
                      {!reviewAvatar && (
                        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {reviewName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-text-dark">{reviewName}</h5>
                      <p className="text-xs text-text-light">{reviewTime}</p>
                    </div>
                  </div>
                  <div className="flex text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-sm ${
                          i < reviewRating ? 'filled' : ''
                        } ${i < reviewRating ? 'text-primary' : 'text-gray-300'}`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                {reviewComment && (
                  <p className="text-sm text-text-light leading-relaxed">{reviewComment}</p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">reviews</span>
            <p className="text-text-light text-sm">لا توجد تقييمات بعد</p>
            <p className="text-text-light text-xs mt-2">كن أول من يقيم هذا المعلم</p>
          </div>
        )}
      </div>
    </div>
  );
}
