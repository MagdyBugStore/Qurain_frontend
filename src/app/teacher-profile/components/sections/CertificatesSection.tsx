import React, { useEffect, useMemo, useState } from 'react';

import {
  teacherCertificatesApi,
  type TeacherCertificate,
} from '../../../../services/teacherCertificatesApi';

interface Props {
  isApproved: boolean;
  isPending: boolean;
}

export function CertificatesSection({ isApproved, isPending }: Props) {
  const [certificates, setCertificates] = useState<TeacherCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = useMemo(() => isApproved || isPending, [isApproved, isPending]);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const list = await teacherCertificatesApi.listMyCertificates();
      setCertificates(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ أثناء تحميل الشهادات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';

    try {
      setError(null);
      setSaving(true);
      const uploaded = await teacherCertificatesApi.uploadMyCertificates(files);
      setCertificates((prev) => [...uploaded, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء رفع الشهادة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      setSaving(true);
      await teacherCertificatesApi.deleteMyCertificate(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الشهادة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">workspace_premium</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">الشهادات</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || saving}
            className="px-3 py-2 rounded-lg border border-primary/20 text-slate-700 dark:text-slate-200 hover:bg-primary/5 disabled:opacity-50"
          >
            تحديث
          </button>
          <label className={`px-3 py-2 rounded-lg bg-primary text-white font-semibold cursor-pointer ${(!canEdit || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            رفع شهادة
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
              onChange={handleUpload}
              disabled={!canEdit || saving}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل الشهادات...</p>
      ) : certificates.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد شهادات مرفوعة بعد.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {certificates.map((c) => (
            <div
              key={c._id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {c.originalName}
                </p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  فتح الملف
                </a>
              </div>

              <button
                type="button"
                onClick={() => void handleDelete(c._id)}
                disabled={!canEdit || saving}
                className="text-slate-400 hover:text-red-500 disabled:opacity-50"
                title="حذف"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

