/**
 * About Me section component
 */

import { useState } from 'react';
import { EditButton } from '../shared/EditButton';
import { SaveCancelButtons } from '../shared/SaveCancelButtons';
import { getVideoEmbedUrl } from '../../utils/videoEmbed';

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

  const handleSave = async () => {
    await onSave(localBio, localIntroVideo);
  };

  const handleCancel = () => {
    setLocalBio(bio);
    setLocalIntroVideo(introVideo);
    onToggleEdit();
  };

  const embedUrl = getVideoEmbedUrl(localIntroVideo);

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
      {isApproved && !isPending && (
        <div className="absolute top-4 left-4">
          <EditButton onClick={onToggleEdit} />
        </div>
      )}
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
            {localIntroVideo ? (
              <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700" style={{ aspectRatio: '16/9' }}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <a href={localIntroVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      فتح رابط الفيديو
                    </a>
                  </div>
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
              <input
                type="url"
                value={localIntroVideo}
                onChange={(e) => setLocalIntroVideo(e.target.value)}
                placeholder="رابط الفيديو"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 mt-2"
              />
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
