/**
 * Reviews section component
 */

import type { Review } from '../../../shared/types/teacher.types';

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewsCount: number;
  isApproved: boolean;
  isPending: boolean;
}

export function ReviewsSection({
  reviews,
  rating,
  reviewsCount,
  isApproved,
  isPending,
}: ReviewsSectionProps) {
  return (
    <div id="reviews" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">reviews</span>
        <h3 className="text-lg sm:text-xl font-bold">آخر التقييمات</h3>
      </div>
      <div className="space-y-4 sm:space-y-6">
        {reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div key={review.id || `review-${review.name}-${review.time}`} className="p-4 sm:p-6 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-200 bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${review.avatar}')` }}
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-bold truncate">{review.name}</h5>
                      <p className="text-[10px] sm:text-xs text-slate-400">{review.time}</p>
                    </div>
                  </div>
                  <div className="flex text-primary shrink-0">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-xs sm:text-sm filled">star</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
              </div>
            ))}
            <button className="w-full text-center py-2 text-primary font-bold text-xs sm:text-sm hover:underline">
              مشاهدة جميع التقييمات
            </button>
          </>
        ) : (
          <p className="text-slate-500 text-xs sm:text-sm text-center py-6 sm:py-8">لا توجد تقييمات بعد</p>
        )}
      </div>
    </div>
  );
}
