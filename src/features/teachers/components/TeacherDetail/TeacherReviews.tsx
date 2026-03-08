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
  return (
    <div className="bg-bg-card rounded-xl p-6 sm:p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">reviews</span>
        <h3 className="text-xl font-bold text-text-dark">التقييمات</h3>
        <div className="flex items-center gap-2 mr-auto">
          <span className="material-symbols-outlined text-primary text-lg filled">star</span>
          <span className="text-lg font-bold text-text-dark">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
          <span className="text-text-light text-sm">({reviewsCount} تقييم)</span>
        </div>
      </div>
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={review.id || index} className="p-6 border border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-full bg-gray-100 bg-cover bg-center border border-gray-200"
                    style={{ backgroundImage: `url('${review.avatar}')` }}
                  />
                  <div>
                    <h5 className="text-sm font-bold text-text-dark">{review.name}</h5>
                    <p className="text-xs text-text-light">{review.time}</p>
                  </div>
                </div>
                <div className="flex text-primary">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm filled">star</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-text-light leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-text-light text-sm text-center py-8">لا توجد تقييمات بعد</p>
        )}
      </div>
    </div>
  );
}
