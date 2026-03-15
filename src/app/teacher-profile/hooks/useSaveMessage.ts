/**
 * Hook for managing save messages with auto-dismiss
 */

import { useState, useCallback } from 'react';
import type { SaveMessage } from '../types';

export function useSaveMessage() {
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

  const showSuccess = useCallback((text: string) => {
    setSaveMessage({ type: 'success', text });
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const showError = useCallback((text: string) => {
    setSaveMessage({ type: 'error', text });
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const showMessage = useCallback((message: SaveMessage) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const clear = useCallback(() => {
    setSaveMessage(null);
  }, []);

  return {
    saveMessage,
    showSuccess,
    showError,
    showMessage,
    clear,
  };
}
