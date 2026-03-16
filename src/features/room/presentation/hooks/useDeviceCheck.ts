/**
 * useDeviceCheck Hook
 * Hook for running technical device checks
 */

import { useState, useCallback } from 'react';
import { DeviceCheckService } from '../../application/services/deviceCheckService';
import type { TechnicalCheckResult, CheckStatus } from '../../domain/entities/Room';

export function useDeviceCheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<TechnicalCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      const service = new DeviceCheckService();
      const checkResult = await service.runAllChecks();
      setResult(checkResult);
      return checkResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run device check';
      setError(errorMessage);
      console.error('Device check error:', err);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  const checkCamera = useCallback(async (): Promise<{ status: CheckStatus; device?: string }> => {
    try {
      const service = new DeviceCheckService();
      return await service.checkCamera();
    } catch (err) {
      console.error('Camera check error:', err);
      return { status: 'failed' };
    }
  }, []);

  const checkMicrophone = useCallback(async (): Promise<{ status: CheckStatus; device?: string }> => {
    try {
      const service = new DeviceCheckService();
      return await service.checkMicrophone();
    } catch (err) {
      console.error('Microphone check error:', err);
      return { status: 'failed' };
    }
  }, []);

  const checkInternet = useCallback(async (): Promise<{ status: CheckStatus; speed?: number }> => {
    try {
      const service = new DeviceCheckService();
      return await service.checkInternetSpeed();
    } catch (err) {
      console.error('Internet check error:', err);
      return { status: 'failed' };
    }
  }, []);

  return {
    checking,
    result,
    error,
    runCheck,
    checkCamera,
    checkMicrophone,
    checkInternet,
  };
}
