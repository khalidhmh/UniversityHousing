/**
 * Authentication Context
 *
 * Global state management for user authentication
 * Handles login, logout, and session persistence
 *
 * Uses window.electron API directly to avoid circular dependencies
 *
 * Usage:
 * ```typescript
 * const { user, login, logout, loading } = useAuth();
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Declare window.electron type
declare global {
  interface Window {
    electron?: {
      login: (data: { email: string; password: string }) => Promise<{
        success: boolean;
        data?: { id: string; email: string; name: string; role: 'MANAGER' | 'SUPERVISOR'; isActive: boolean; createdAt: string; updatedAt: string };
        error?: string;
      }>;
    };
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'SUPERVISOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // LOAD PERSISTED SESSION ON MOUNT
  // ============================================

  useEffect(() => {
    const loadPersistedUser = () => {
      try {
        // Try to restore user from localStorage
        const persistedUser = localStorage.getItem('authUser');
        if (persistedUser) {
          const parsedUser = JSON.parse(persistedUser) as AuthUser;
          setUser(parsedUser);
        }
      } catch (err) {
        // Clear invalid data
        localStorage.removeItem('authUser');
        console.error('Failed to load persisted user:', err);
      }
    };

    loadPersistedUser();
  }, []);

  // ============================================
  // LOGIN FUNCTION
  // ============================================

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser | null> => {
      try {
        setLoading(true);
        setError(null);

        // Call IPC handler via electron API
        if (!window.electron) {
          throw new Error('Electron API not available');
        }

        const response = await window.electron.login({
          email,
          password,
        });

        if (!response.success) {
          const errorMsg = response.error || 'Login failed';
          setError(errorMsg);
          return null;
        }

        if (!response.data) {
          setError('No user data returned');
          return null;
        }

        // Set user state
        setUser(response.data);

        // Persist to localStorage
        localStorage.setItem('authUser', JSON.stringify(response.data));

        return response.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred during login';
        setError(errorMsg);
        console.error('Login error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================
  // LOGOUT FUNCTION
  // ============================================

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear state
      setUser(null);

      // Clear localStorage
      localStorage.removeItem('authUser');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CLEAR ERROR
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// CUSTOM HOOK FOR USING AUTH CONTEXT
// ============================================

/**
 * Hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context value
 *
 * @example
 * ```typescript
 * const { user, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
