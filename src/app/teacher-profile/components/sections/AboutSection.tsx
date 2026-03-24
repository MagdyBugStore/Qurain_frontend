/**
 * About Me section component
 */

import { useState, useRef } from 'react';
import { EditButton } from '../shared/EditButton';
import { SaveCancelButtons } from '../shared/SaveCancelButtons';
import { getVideoEmbedUrl, isBackendVideoUrl, getFullVideoUrl } from '../../utils/videoEmbed';
import { uploadVideo } from '../../../../services/uploadService';
import React from 'react';

interface AboutSectionProps {
  bio: string;
  introVideo: string;
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onSave: (bio: string, introVideo: string) => Promise<void>;
  saving: boolean;
}

export function AboutSection({
  bio,
  introVideo,
  isEditing,
  isApproved,
  isPending,
  onToggleEdit,
  onSave,
  saving,
}: AboutSectionProps) {
  const [localBio, setLocalBio] = useState(bio);
  const [localIntroVideo, setLocalIntroVideo] = useState(introVideo);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await onSave(localBio, localIntroVideo);
  };

  const handleCancel = () => {
    setLocalBio(bio);
    setLocalIntroVideo(introVideo);
    setUploadError(null);
    onToggleEdit();
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. يرجى اختيار ملف فيديو (MP4, WebM, MOV, AVI)');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setUploadError('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت');
      return;
    }

    setUploadingVideo(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const uploadedFile = await uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      // Set the video URL from backend
      setLocalIntroVideo(uploadedFile.url);
      setUploadError(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadError(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الفيديو');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setLocalIntroVideo('');
    setUploadError(null);
  };

  const embedUrl = getVideoEmbedUrl(localIntroVideo);
  const isBackendVideo = localIntroVideo ? isBackendVideoUrl(localIntroVideo) : false;
  const fullVideoUrl = isBackendVideo ? getFullVideoUrl(localIntroVideo) : localIntroVideo;

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="absolute top-4 left-4 z-20">
        <EditButton onClick={onToggleEdit} />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="md:col-span-3">
            <h3 className="text-base font-semibold mb-2">نبذة عني وفلسفتي في التعليم</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {isEditing && !isPending ? (
                <textarea
                  rows={4}
                  value={localBio}
                  onChange={(e) => setLocalBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 leading-relaxed"
                  placeholder="اكتب نبذة عنك وفلسفتك في التعليم..."
                />
              ) : (
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {bio || 'لا توجد نبذة متاحة'}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-base font-semibold mb-2">فيديو تعريفي</h3>
            {localIntroVideo ? (
              <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700" style={{ aspectRatio: '16/9' }}>
                {isBackendVideo ? (
                  // Backend video - use video tag
                  <video
                    src={fullVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                ) : embedUrl && (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com')) ? (
                  // YouTube/Vimeo - use iframe
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Other URL - show link
                  <div className="absolute inset-0 flex items-center justify-center">
                    <a href={localIntroVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      فتح رابط الفيديو
                    </a>
                  </div>
                )}
                {isEditing && !isPending && (
                  <button
                    onClick={handleRemoveVideo}
                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    title="حذف الفيديو"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">play_circle</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد فيديو</p>
                </div>
              </div>
            )}
            {isEditing && !isPending && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    رفع فيديو جديد
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/mov,video/avi,video/quicktime"
                    onChange={handleVideoFileSelect}
                    disabled={uploadingVideo}
                    className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    الحد الأقصى: 50 ميجابايت (MP4, WebM, MOV, AVI)
                  </p>
                </div>
                {uploadingVideo && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      جاري الرفع... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
                {uploadError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {uploadError}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    أو أدخل رابط فيديو (YouTube, Vimeo)
                  </label>
                  <input
                    type="url"
                    value={localIntroVideo}
                    onChange={(e) => {
                      setLocalIntroVideo(e.target.value);
                      setUploadError(null);
                    }}
                    placeholder="https://youtube.com/... أو https://vimeo.com/..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isEditing && !isPending && (
        <div className="mt-4">
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            saveLabel="حفظ التغييرات"
          />
        </div>
      )}
    </div>
  );
}
