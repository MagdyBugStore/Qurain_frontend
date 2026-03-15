/**
 * Hook for managing ijazahs CRUD operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication } from '../../../shared/types/teacher.types';
import type { Ijazah } from '../types';

export interface UseIjazahsReturn {
  ijazahs: Ijazah[];
  addIjazah: () => void;
  updateIjazah: (index: number, field: string, value: string) => void;
  deleteIjazah: (index: number) => void;
  saveIjazahs: (onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  saving: boolean;
  setIjazahs: (ijazahs: Ijazah[]) => void;
}

export function useIjazahs(teacherApplication: TeacherApplication | null) {
  const [ijazahs, setIjazahs] = useState<Ijazah[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize ijazahs from teacher application data
  useEffect(() => {
    // Ijazahs are loaded from useTeacherProfileData hook
    // This effect will be triggered when ijazahs prop changes
  }, []);

  const addIjazah = useCallback(() => {
    setIjazahs([...ijazahs, { title: '', description: '', image: '' }]);
  }, [ijazahs]);

  const updateIjazah = useCallback((index: number, field: string, value: string) => {
    const updated = [...ijazahs];
    updated[index] = { ...updated[index], [field]: value };
    setIjazahs(updated);
  }, [ijazahs]);

  const deleteIjazah = useCallback((index: number) => {
    setIjazahs(ijazahs.filter((_, i) => i !== index));
  }, [ijazahs]);

  const saveIjazahs = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!teacherApplication?.id) {
      onError?.('Cannot save: missing teacherApplication.id');
      return;
    }

    setSaving(true);
    try {
      const teacherService = new TeacherService();
      const teacherId = teacherApplication.userId || teacherApplication.id;

      // Delete removed ijazahs
      const currentIjazahs = await teacherService.getIjazahs(teacherId);
      const currentIds = currentIjazahs.map(i => i.id).filter((id): id is string => !!id);
      const newIds = ijazahs.filter(i => i.id).map(i => i.id!).filter((id): id is string => !!id);
      const toDelete = currentIds.filter(id => !newIds.includes(id));

      for (const id of toDelete) {
        await teacherService.deleteIjazah(id);
      }

      // Add/update ijazahs
      for (const ijazah of ijazahs) {
        if (ijazah.id) {
          // Update existing
          await teacherService.updateIjazah(ijazah.id, {
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
          });
        } else {
          // Add new
          await teacherService.saveIjazah({
            teacherId,
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
          });
        }
      }

      // Refresh ijazahs list
      const ijazahsData = await teacherService.getIjazahs(teacherId);
      setIjazahs(ijazahsData as Ijazah[]);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving ijazahs:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإجازات';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [ijazahs, teacherApplication]);

  return {
    ijazahs,
    addIjazah,
    updateIjazah,
    deleteIjazah,
    saveIjazahs,
    saving,
    setIjazahs,
  };
}
