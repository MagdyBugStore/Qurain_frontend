/**
 * Device Check Service
 * Handles technical device checks (camera, microphone, internet)
 */

import type {
  TechnicalCheckResult,
  CheckStatus,
} from '../../domain/entities/Room';

export class DeviceCheckService {
  /**
   * Check camera availability
   */
  async checkCamera(): Promise<{
    status: CheckStatus;
    device?: string;
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        return { status: 'failed' };
      }

      // Try to access camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        return {
          status: 'passed',
          device: videoDevices[0]?.label || 'Camera',
        };
      } catch (error) {
        return { status: 'failed', device: videoDevices[0]?.label };
      }
    } catch (error) {
      console.error('Error checking camera:', error);
      return { status: 'failed' };
    }
  }

  /**
   * Check microphone availability
   */
  async checkMicrophone(): Promise<{
    status: CheckStatus;
    device?: string;
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter((device) => device.kind === 'audioinput');

      if (audioDevices.length === 0) {
        return { status: 'failed' };
      }

      // Try to access microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return {
          status: 'passed',
          device: audioDevices[0]?.label || 'Microphone',
        };
      } catch (error) {
        return { status: 'failed', device: audioDevices[0]?.label };
      }
    } catch (error) {
      console.error('Error checking microphone:', error);
      return { status: 'failed' };
    }
  }

  /**
   * Check internet connection speed
   */
  async checkInternetSpeed(): Promise<{
    status: CheckStatus;
    speed?: number; // Mbps
  }> {
    try {
      // Simple connection check
      if (!navigator.onLine) {
        return { status: 'failed' };
      }

      // Estimate speed based on connection type (simplified)
      // In production, you might want to use a more sophisticated speed test
      const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        // Map effective types to approximate speeds
        const speedMap: Record<string, number> = {
          'slow-2g': 0.5,
          '2g': 1,
          '3g': 2,
          '4g': 10,
        };

        const estimatedSpeed = downlink || speedMap[effectiveType] || 5;

        return {
          status: estimatedSpeed >= 2 ? 'passed' : 'failed',
          speed: estimatedSpeed,
        };
      }

      // Fallback: assume connection is good if online
      return { status: 'passed', speed: 5 };
    } catch (error) {
      console.error('Error checking internet speed:', error);
      return { status: 'failed' };
    }
  }

  /**
   * Run all device checks
   */
  async runAllChecks(): Promise<TechnicalCheckResult> {
    const [cameraResult, micResult, internetResult] = await Promise.all([
      this.checkCamera(),
      this.checkMicrophone(),
      this.checkInternetSpeed(),
    ]);

    const result: TechnicalCheckResult = {
      camera: cameraResult.status,
      microphone: micResult.status,
      internet: internetResult.status,
      cameraDevice: cameraResult.device,
      microphoneDevice: micResult.device,
      internetSpeed: internetResult.speed,
      allPassed:
        cameraResult.status === 'passed' &&
        micResult.status === 'passed' &&
        internetResult.status === 'passed',
    };

    return result;
  }
}
