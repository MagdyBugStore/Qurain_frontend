/**
 * Hook for managing all editing states
 */

import { useState, useCallback } from 'react';
import type { EditingSection, EditingStates } from '../constants/editingSections';
import { INITIAL_EDITING_STATES } from '../constants/editingSections';

export function useEditingStates() {
  const [editingStates, setEditingStates] = useState<EditingStates>(INITIAL_EDITING_STATES);

  const toggleEdit = useCallback((section: EditingSection) => {
    setEditingStates(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const setEditing = useCallback((section: EditingSection, isEditing: boolean) => {
    setEditingStates(prev => ({ ...prev, [section]: isEditing }));
  }, []);

  const isEditing = useCallback((section: EditingSection): boolean => {
    return editingStates[section];
  }, [editingStates]);

  const resetAll = useCallback(() => {
    setEditingStates(INITIAL_EDITING_STATES);
  }, []);

  return {
    editingStates,
    toggleEdit,
    setEditing,
    isEditing,
    resetAll,
  };
}
