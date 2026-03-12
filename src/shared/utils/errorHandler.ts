/**
 * Shared Error Handling Utility
 * Standardized error handling across services and repositories
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle and log error
   */
  static handleError(error: unknown, context: string): AppError {
    // Log error
    console.error(`[${context}] Error:`, error);

    // Extract error information
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: error,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      return {
        code: errorObj.code || 'UNKNOWN_ERROR',
        message: errorObj.message || 'حدث خطأ غير متوقع',
        details: errorObj,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'حدث خطأ غير متوقع',
      details: error,
    };
  }

  /**
   * Create a typed error response
   */
  static createErrorResponse(
    code: string,
    message: string,
    details?: any
  ): AppError {
    console.error(`[Error] ${code}: ${message}`, details);
    return {
      code,
      message,
      details,
    };
  }

  /**
   * Handle Firebase errors specifically
   */
  static handleFirebaseError(error: unknown, context: string): AppError {
    const baseError = this.handleError(error, context);

    // Map Firebase error codes to user-friendly messages
    if (baseError.details?.code) {
      const firebaseCode = baseError.details.code;
      switch (firebaseCode) {
        case 'permission-denied':
          return {
            ...baseError,
            code: 'PERMISSION_DENIED',
            message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
          };
        case 'not-found':
          return {
            ...baseError,
            code: 'NOT_FOUND',
            message: 'المورد المطلوب غير موجود',
          };
        case 'unavailable':
          return {
            ...baseError,
            code: 'SERVICE_UNAVAILABLE',
            message: 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً',
          };
        default:
          return baseError;
      }
    }

    return baseError;
  }

  /**
   * Check if error is a known error type
   */
  static isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }
}
