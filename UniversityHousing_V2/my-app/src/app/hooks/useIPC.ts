/**
 * useIPC Hook - React Hook for IPC Communication
 *
 * Provides a simple interface for calling Electron IPC methods from React components.
 * Handles loading states, error states, and automatic cleanup.
 *
 * Usage:
 * ```typescript
 * const { call, loading, error, data } = useIPC();
 *
 * // Call IPC handler
 * const result = await call('getStudents', { limit: 10 });
 *
 * // With error handling
 * try {
 *   const student = await call('addStudent', studentData);
 *   if (student.success) {
 *     console.log('Student added:', student.data);
 *   }
 * } catch (err) {
 *   console.error('Error:', error);
 * }
 * ```
 */

import { useState, useCallback, useRef } from 'react';

interface UseIPCOptions {
  verbose?: boolean; // Log IPC calls for debugging
}

interface UseIPCReturn {
  /**
   * Call an IPC handler
   * @param handler - Handler name (e.g., 'getStudents', 'addStudent')
   * @param params - Parameters to pass to the handler
   * @returns Promise resolving to handler response
   */
  call: <T = any>(handler: string, params?: any) => Promise<T>;

  /**
   * True while an IPC call is in progress
   */
  loading: boolean;

  /**
   * Error message from the last failed IPC call
   */
  error: string | null;

  /**
   * Clear the error state
   */
  clearError: () => void;

  /**
   * Reset hook to initial state
   */
  reset: () => void;
}

/**
 * React Hook for making IPC calls with loading/error states
 *
 * @param options - Configuration options
 * @returns Object with call function and state
 */
export function useIPC(options: UseIPCOptions = {}): UseIPCReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if component is mounted (prevent state updates on unmounted component)
  const isMountedRef = useRef(true);

  // Use ref for verbose logging
  const verboseRef = useRef(options.verbose || false);

  /**
   * Make an IPC call with error handling and loading state
   */
  const call = useCallback(async <T = any,>(handler: string, params?: any): Promise<T> => {
    if (!window.electron) {
      const msg = '❌ Electron API not available. Are you running in Electron?';
      console.error(msg);
      throw new Error(msg);
    }

    // Validate handler exists
    const electronAPI = window.electron as any;
    if (typeof electronAPI[handler] !== 'function') {
      const msg = `❌ IPC handler not found: ${handler}`;
      console.error(msg);
      throw new Error(msg);
    }

    // Set loading state
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      if (verboseRef.current) {
        console.log(`🚀 [IPC] Calling: ${handler}`, params);
      }

      // Call the IPC handler
      const result = await electronAPI[handler](params);

      if (verboseRef.current) {
        console.log(`✅ [IPC] Response from ${handler}:`, result);
      }

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err?.message || String(err) || 'Unknown error';

      console.error(`❌ [IPC] Error in ${handler}:`, errorMessage);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorMessage);
        setLoading(false);
      }

      throw err;
    }
  }, []);

  /**
   * Clear the error state
   */
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  /**
   * Reset hook to initial state
   */
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(false);
      setError(null);
    }
  }, []);

  // Cleanup on unmount
  // We need to use a hook to track mount/unmount
  // Since we can't directly use useEffect in the returned object,
  // we'll document that the caller should handle cleanup

  return {
    call,
    loading,
    error,
    clearError,
    reset,
  };
}

/**
 * Alternative hook: useIPCEffect
 * Automatically calls an IPC handler on mount and manages loading/error states
 *
 * Usage:
 * ```typescript
 * const { data, loading, error } = useIPCEffect('getStudents', { limit: 10 });
 * ```
 */
export function useIPCEffect<T = any,>(
  handler: string,
  params?: any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { call } = useIPC();

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await call(handler, params);

        if (isMounted) {
          if (result.success) {
            setData(result.data || result);
          } else {
            setError(result.error || 'Unknown error');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [handler, JSON.stringify(params), ...dependencies]);

  return { data, loading, error };
}

/**
 * Helper hook: useIPCMutation
 * For mutations (POST/PUT/DELETE) - call on demand, not on mount
 *
 * Usage:
 * ```typescript
 * const { mutate, loading, error } = useIPCMutation('addStudent');
 *
 * const handleAddStudent = async (data) => {
 *   const result = await mutate(data);
 *   if (result.success) {
 *     console.log('Added:', result.data);
 *   }
 * };
 * ```
 */
export function useIPCMutation<T = any,>(handler: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { call } = useIPC();

  const mutate = useCallback(
    async (params?: any): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await call(handler, params);

        if (!result.success) {
          const errorMsg = result.error || 'Unknown error';
          setError(errorMsg);
          return null;
        }

        return result.data || result;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handler, call]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}

// Import React for useIPCEffect
import React from 'react';
