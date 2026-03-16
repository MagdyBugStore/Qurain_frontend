/**
 * TechnicalCheck Component
 * Displays technical device check interface
 */

import React from 'react';
import type { TechnicalCheckResult } from '../../../domain/entities/Room';

interface TechnicalCheckProps {
  result: TechnicalCheckResult | null;
  checking: boolean;
  onRetry: () => void;
  onEnter: () => void;
}

export function TechnicalCheck({ result, checking, onRetry, onEnter }: TechnicalCheckProps) {
  if (!result) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">جاري التحقق من الأجهزة...</p>
        </div>
      </div>
    );
  }

  const allPassed = result.allPassed;

  // Success state - all checks passed
  if (allPassed) {
    return (
      <div className="w-full max-w-[800px] bg-white dark:bg-[#1a170d] rounded-xl shadow-sm border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-[#e6e3db] dark:border-[#3a3528]">
          <h1 className="text-2xl font-bold text-[#181611] dark:text-white mb-2">
            فحص الأجهزة قبل الحصة
          </h1>
          <p className="text-[#8a8060] dark:text-[#a39b80]">
            يرجى التأكد من أن جميع الأجهزة تعمل بشكل صحيح لضمان تجربة تعليمية ممتازة.
          </p>
        </div>

        {/* Checks List */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Camera Check */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
            <div className="relative w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
              <div className="absolute inset-0 bg-cover bg-center bg-gray-300"></div>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                LIVE
              </div>
            </div>
            <div className="flex-grow text-center sm:text-right w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">
                  videocam
                </span>
                <h3 className="font-bold text-lg text-[#181611] dark:text-white">الكاميرا</h3>
              </div>
              <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">
                {result.cameraDevice || 'Camera'}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-bold text-sm">جاهزة</span>
            </div>
          </div>

          {/* Microphone Check */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
            <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1e1b12] border border-dashed border-[#d1cdc2] dark:border-[#4a4433]">
              <div className="flex items-end gap-1 h-12">
                {[4, 8, 10, 6, 3].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-primary rounded-full animate-pulse"
                    style={{ height: `${height * 4}px` }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex-grow text-center sm:text-right w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">mic</span>
                <h3 className="font-bold text-lg text-[#181611] dark:text-white">الميكروفون</h3>
              </div>
              <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">
                {result.microphoneDevice || 'Microphone'}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-bold text-sm">يعمل جيداً</span>
            </div>
          </div>

          {/* Internet Speed Check */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
            <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1e1b12] border border-dashed border-[#d1cdc2] dark:border-[#4a4433]">
              <span className="material-symbols-outlined text-4xl text-primary mb-1">speed</span>
              <span className="text-xs font-bold text-[#181611] dark:text-white">
                {result.internetSpeed?.toFixed(0) || 'N/A'} Mbps
              </span>
            </div>
            <div className="flex-grow text-center sm:text-right w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">
                  wifi
                </span>
                <h3 className="font-bold text-lg text-[#181611] dark:text-white">سرعة الإنترنت</h3>
              </div>
              <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">
                الاتصال مستقر ومناسب للفيديو
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-bold text-sm">ممتاز</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 bg-[#f8f8f5] dark:bg-[#221e10] border-t border-[#e6e3db] dark:border-[#3a3528] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#8a8060] dark:text-[#a39b80] text-sm">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>إذا واجهت مشكلة، يرجى التواصل مع الدعم الفني</span>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={onRetry}
              disabled={checking}
              className="flex-1 sm:flex-none h-12 px-8 rounded-lg border border-[#d1cdc2] dark:border-[#4a4433] text-[#181611] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#2a261a] transition-colors disabled:opacity-50"
            >
              إعادة الفحص
            </button>
            <button
              onClick={onEnter}
              disabled={checking}
              className="flex-1 sm:flex-none h-12 px-8 rounded-lg bg-primary hover:bg-[#e0b020] text-[#181611] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>دخول الحصة</span>
              <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state - some checks failed
  return (
    <div className="w-full max-w-[720px] flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-3 text-center sm:text-right">
        <h1 className="text-text-main dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          فحص تقني قبل الجلسة
        </h1>
        <p className="text-text-secondary dark:text-gray-400 text-base font-normal leading-normal">
          نحن نتحقق من أجهزتك لضمان تجربة تعليمية سلسة وبدون انقطاع.
        </p>
      </div>

      {/* Check List Container */}
      <div className="flex flex-col gap-4">
        {/* Camera Item */}
        <div
          className={`flex items-center gap-4 p-5 rounded-xl border shadow-sm justify-between transition-all ${
            result.camera === 'passed'
              ? 'bg-white dark:bg-[#2a261a] border-[#e5e7eb] dark:border-[#3a3525] hover:shadow-md'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 relative overflow-hidden'
          }`}
        >
          {result.camera === 'failed' && (
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-error"></div>
          )}
          <div className="flex items-center gap-4 pr-3">
            <div
              className={`flex items-center justify-center rounded-full shrink-0 size-12 ${
                result.camera === 'passed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-success'
                  : 'bg-red-100 dark:bg-red-900/40 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {result.camera === 'passed' ? 'videocam' : 'videocam_off'}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-text-main dark:text-white text-lg font-bold leading-normal">
                الكاميرا
              </p>
              <p
                className={`text-sm font-medium leading-normal ${
                  result.camera === 'passed'
                    ? 'text-success'
                    : 'text-error font-bold'
                }`}
              >
                {result.camera === 'passed'
                  ? 'تم التحقق بنجاح'
                  : 'لم يتم العثور على كاميرا'}
              </p>
            </div>
          </div>
          <div className={`shrink-0 ${result.camera === 'passed' ? 'text-success' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[32px]">
              {result.camera === 'passed' ? 'check_circle' : 'cancel'}
            </span>
          </div>
        </div>

        {/* Microphone Item */}
        <div
          className={`flex items-center gap-4 p-5 rounded-xl border shadow-sm justify-between transition-all ${
            result.microphone === 'passed'
              ? 'bg-white dark:bg-[#2a261a] border-[#e5e7eb] dark:border-[#3a3525] hover:shadow-md'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 relative overflow-hidden'
          }`}
        >
          {result.microphone === 'failed' && (
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-error"></div>
          )}
          <div className="flex items-center gap-4 pr-3">
            <div
              className={`flex items-center justify-center rounded-full shrink-0 size-12 ${
                result.microphone === 'passed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-success'
                  : 'bg-red-100 dark:bg-red-900/40 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {result.microphone === 'passed' ? 'mic' : 'mic_off'}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-text-main dark:text-white text-lg font-bold leading-normal">
                الميكروفون
              </p>
              <p
                className={`text-sm font-medium leading-normal ${
                  result.microphone === 'passed'
                    ? 'text-success'
                    : 'text-error font-bold'
                }`}
              >
                {result.microphone === 'passed'
                  ? 'تم التحقق بنجاح'
                  : 'لم يتم العثور على ميكروفون'}
              </p>
            </div>
          </div>
          <div
            className={`shrink-0 ${result.microphone === 'passed' ? 'text-success' : 'text-error'}`}
          >
            <span className="material-symbols-outlined text-[32px]">
              {result.microphone === 'passed' ? 'check_circle' : 'cancel'}
            </span>
          </div>
        </div>

        {/* Internet Item */}
        <div
          className={`flex items-center gap-4 p-5 rounded-xl border shadow-sm justify-between transition-all ${
            result.internet === 'passed'
              ? 'bg-white dark:bg-[#2a261a] border-[#e5e7eb] dark:border-[#3a3525] hover:shadow-md'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 relative overflow-hidden'
          }`}
        >
          {result.internet === 'failed' && (
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-error"></div>
          )}
          <div className="flex items-center gap-4 pr-3">
            <div
              className={`flex items-center justify-center rounded-full shrink-0 size-12 ${
                result.internet === 'passed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-success'
                  : 'bg-red-100 dark:bg-red-900/40 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">wifi</span>
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-text-main dark:text-white text-lg font-bold leading-normal">
                الاتصال بالإنترنت
              </p>
              <p
                className={`text-sm font-medium leading-normal ${
                  result.internet === 'passed'
                    ? 'text-success'
                    : 'text-error font-bold'
                }`}
              >
                {result.internet === 'passed'
                  ? 'سرعة الاتصال جيدة'
                  : 'الاتصال غير مستقر'}
              </p>
            </div>
          </div>
          <div className={`shrink-0 ${result.internet === 'passed' ? 'text-success' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[32px]">
              {result.internet === 'passed' ? 'check_circle' : 'cancel'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice Box */}
      <div className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 items-start">
        <span className="material-symbols-outlined text-primary mt-0.5">info</span>
        <div>
          <h4 className="font-bold text-text-main dark:text-white text-sm mb-1">
            تعذر إكمال الفحص
          </h4>
          <p className="text-text-secondary dark:text-gray-300 text-sm">
            يرجى التأكد من توصيل الأجهزة وسماحها للمتصفح بالوصول إليها، ثم حاول مرة أخرى.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 mt-4">
        <button
          disabled
          className="w-full flex cursor-not-allowed items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-lg font-bold leading-normal tracking-[0.015em] transition-all"
        >
          <span className="truncate">دخول الحصة</span>
          <span className="material-symbols-outlined mr-2 text-xl">login</span>
        </button>
        <button
          onClick={onRetry}
          disabled={checking}
          className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 border-2 border-primary text-text-main dark:text-primary hover:bg-primary/10 transition-colors text-lg font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
        >
          <span className="truncate">إجراء الاختبار مجدداً</span>
          <span className="material-symbols-outlined mr-2 text-xl">refresh</span>
        </button>
        <div className="text-center mt-2">
          <a
            href="/support"
            className="text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-primary text-sm font-medium underline underline-offset-4 decoration-dotted"
          >
            تواجه مشكلة مستمرة؟ تواصل مع الدعم الفني
          </a>
        </div>
      </div>
    </div>
  );
}
