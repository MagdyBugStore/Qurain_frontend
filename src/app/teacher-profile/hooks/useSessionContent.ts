/**
 * Hook for managing session content CRUD operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication } from '../../../shared/types/teacher.types';
import type { SessionContentItem } from '../types';
import { parseSessionContentFromJSON, stringifySessionContent } from '../utils/dataParsing';
import { validateSessionContent } from '../utils/validation';

export interface UseSessionContentReturn {
  items: SessionContentItem[];
  addItem: () => void;
  updateItem: (index: number, field: 'title' | 'subject', value: string) => void;
  deleteItem: (index: number) => void;
  saveItems: (onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  saving: boolean;
  setItems: (items: SessionContentItem[]) => void;
}

export function useSessionContent(teacherApplication: TeacherApplication | null) {
  const [items, setItems] = useState<SessionContentItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize session content from teacher application
  useEffect(() => {
    if (teacherApplication?.sessionContent) {
      const parsed = parseSessionContentFromJSON(teacherApplication.sessionContent);
      setItems(parsed);
    } else {
      setItems([]);
    }
  }, [teacherApplication?.sessionContent]);

  const addItem = useCallback(() => {
    // Check if there are any empty items
    const hasEmpty = items.some(item => !item.title.trim() || !item.subject.trim());
    if (hasEmpty) {
      throw new Error('يرجى إكمال العناصر الحالية قبل إضافة عنصر جديد');
    }
    setItems([...items, { title: '', subject: '' }]);
  }, [items]);

  const updateItem = useCallback((index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }, [items]);

  const deleteItem = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }, [items]);

  const saveItems = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!teacherApplication?.id) {
      onError?.('Cannot save: missing teacherApplication.id');
      return;
    }

    const validation = validateSessionContent(items);
    if (!validation.isValid) {
      onError?.(validation.error || 'Validation failed');
      return;
    }

    // Filter out empty items before saving
    const validItems = items.filter(item => item.title.trim() && item.subject.trim());
    setSaving(true);

    try {
      const teacherService = new TeacherService();
      const currentTeachingStyle = teacherApplication.teachingStyle || '';
      const currentIntroVideo = teacherApplication.introVideo || '';
      const sessionContentJson = stringifySessionContent(validItems);

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        teachingStyle: currentTeachingStyle,
        sessionContent: sessionContentJson,
        introVideo: currentIntroVideo,
      });

      setItems(validItems);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving session content:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ محتوى الحصة';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [items, teacherApplication]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    saveItems,
    saving,
    setItems,
  };
}
