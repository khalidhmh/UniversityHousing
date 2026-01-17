/**
 * IPC Communication Examples & Best Practices
 *
 * This file demonstrates how to use the Electron IPC bridge from React components
 * with the useIPC hook, useIPCEffect hook, and useIPCMutation hook.
 */

// ============================================
// EXAMPLE 1: Basic IPC Call with useIPC
// ============================================

import React, { useState } from 'react';
import { useIPC } from '@/app/hooks/useIPC';

export function ExampleBasicIPC() {
  const { call, loading, error } = useIPC();
  const [students, setStudents] = useState([]);

  const handleFetchStudents = async () => {
    try {
      const result = await call('getStudents', { limit: 20 });

      if (result.success) {
        setStudents(result.data);
        console.log('✅ Fetched students:', result.data);
      } else {
        console.error('❌ Error:', result.error);
      }
    } catch (err) {
      console.error('❌ IPC Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleFetchStudents} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Students'}
      </button>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <ul>
        {students.map((student) => (
          <li key={student.id}>{student.nameAr}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Using useIPCEffect for Auto-Fetch
// ============================================

import { useIPCEffect } from '@/app/hooks/useIPC';

export function ExampleAutoFetch() {
  // Automatically fetches students when component mounts
  const { data: students, loading, error } = useIPCEffect('getStudents', {
    limit: 50,
    skip: 0,
  });

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Students ({students?.length || 0})</h2>
      <ul>
        {students?.map((student) => (
          <li key={student.id}>
            {student.nameAr} - {student.registrationNumber}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Using useIPCMutation for Adding Data
// ============================================

import { useIPCMutation } from '@/app/hooks/useIPC';

export function ExampleAddStudent() {
  const { mutate: addStudent, loading, error, reset } = useIPCMutation('addStudent');
  const [formData, setFormData] = useState({
    registrationNumber: '',
    nationalId: '',
    nameAr: '',
    nameEn: '',
    email: '',
    academicYear: 1,
    university: 'GOVERNMENT' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); // Clear previous errors

    const result = await addStudent(formData);

    if (result) {
      console.log('✅ Student added:', result);
      // Reset form
      setFormData({
        registrationNumber: '',
        nationalId: '',
        nameAr: '',
        nameEn: '',
        email: '',
        academicYear: 1,
        university: 'GOVERNMENT',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={(e) =>
          setFormData({ ...formData, registrationNumber: e.target.value })
        }
      />
      <input
        placeholder="National ID"
        value={formData.nationalId}
        onChange={(e) =>
          setFormData({ ...formData, nationalId: e.target.value })
        }
      />
      {/* Add more inputs... */}
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Student'}
      </button>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </form>
  );
}

// ============================================
// EXAMPLE 4: Handling User Creation (MANAGER ONLY)
// ============================================

export function ExampleCreateUser() {
  const { call, loading, error, clearError } = useIPC({ verbose: true });
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'SUPERVISOR' as const,
  });

  // In a real app, this would come from auth context
  const managerId = 'manager-user-id';

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const result = await call('createUser', {
        ...formData,
        requesterId: managerId,
      });

      if (result.success) {
        console.log('✅ User created:', result.data);
        console.log('📝 Temporary password:', result.data.tempPassword);
        // Show password to admin (copy-paste to email)
      } else {
        console.error('❌ Error:', result.error);
        // Handle specific error codes
        if (result.code === 'UNAUTHORIZED') {
          console.error('Only managers can create users');
        } else if (result.code === 'EMAIL_EXISTS') {
          console.error('Email already exists');
        }
      }
    } catch (err) {
      console.error('❌ IPC Error:', err);
    }
  };

  return (
    <form onSubmit={handleCreateUser}>
      <input
        placeholder="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <select
        value={formData.role}
        onChange={(e) =>
          setFormData({
            ...formData,
            role: e.target.value as 'MANAGER' | 'SUPERVISOR',
          })
        }
      >
        <option value="SUPERVISOR">Supervisor</option>
        <option value="MANAGER">Manager</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </form>
  );
}

// ============================================
// EXAMPLE 5: Image Upload
// ============================================

export function ExampleImageUpload() {
  const { call: saveImage, loading: saving } = useIPC();
  const { call: getPhoto } = useIPC();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // In a real app, you'd need to get the file path from Electron
      // For now, this is a simplified example
      const result = await saveImage('saveStudentImage', {
        tempFilePath: file.path || '', // This would come from Electron file dialog
        registrationNumber: '2024001',
      });

      if (result.success) {
        console.log('✅ Image saved:', result.path);

        // Get the photo URL for display
        const photoResult = await getPhoto(result.path);
        if (photoResult.success) {
          setPhotoUrl(photoResult.url);
        }
      }
    } catch (err) {
      console.error('❌ Error uploading image:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        disabled={saving}
      />
      {saving && <div>Uploading...</div>}
      {photoUrl && (
        <img src={photoUrl} alt="Student" style={{ maxWidth: '200px' }} />
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Advanced - Retry Logic
// ============================================

export function useIPCWithRetry(
  handler: string,
  params?: any,
  maxRetries: number = 3
) {
  const [retryCount, setRetryCount] = useState(0);
  const { call } = useIPC();

  const callWithRetry = useCallback(async () => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await call(handler, params);
        setRetryCount(0);
        return result;
      } catch (err) {
        lastError = err;
        setRetryCount(i + 1);

        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
        }
      }
    }

    throw lastError;
  }, [handler, params, call, maxRetries]);

  return { callWithRetry, retryCount };
}

// ============================================
// EXAMPLE 7: Type-Safe IPC Calls
// ============================================

import type { Student, User, IpcResponse } from '@/preload/index.d';

export function ExampleTypeSafe() {
  const { call } = useIPC();

  // Fully type-safe call
  const handleGetStudent = async (studentId: string) => {
    try {
      const result: IpcResponse<Student> = await call('getStudent', studentId);

      if (result.success && result.data) {
        // TypeScript knows result.data is Student here
        console.log(`Student: ${result.data.nameAr}`);
        console.log(`Email: ${result.data.email}`);
        console.log(`Status: ${result.data.status}`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <button onClick={() => handleGetStudent('student-id')}>
      Get Student (Type Safe)
    </button>
  );
}

// ============================================
// BEST PRACTICES & PATTERNS
// ============================================

/**
 * PATTERN 1: Form Submission with Validation
 *
 * - Clear errors before new request
 * - Show loading state during request
 * - Handle success and error responses
 * - Reset form on success
 */

/**
 * PATTERN 2: List Fetching with Pagination
 *
 * - Use useIPCEffect for initial load
 * - Use useIPC for pagination changes
 * - Track current page/skip in state
 * - Update UI based on loading/error states
 */

/**
 * PATTERN 3: Error Recovery
 *
 * - Always provide meaningful error messages
 * - Give user option to retry failed requests
 * - Log errors to console for debugging
 * - Don't silently fail
 */

/**
 * PATTERN 4: Loading States
 *
 * - Show spinner during loading
 * - Disable buttons/inputs while loading
 * - Prevent duplicate submissions
 * - Show loading text (e.g., "Adding...")
 */

/**
 * PATTERN 5: TypeScript Types
 *
 * - Always import and use types from preload/index.d.ts
 * - Define expected response types
 * - Use generics for useIPCEffect<T>
 * - Let TypeScript catch errors at compile time
 */
