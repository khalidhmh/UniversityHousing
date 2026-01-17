# Phase 2: IPC Bridge Implementation Guide

**Date**: January 16, 2026  
**Status**: ✅ Complete - IPC Bridge Ready for Integration  
**Files Created**: 3 core files + examples

---

## 📁 Files Created in Phase 2

### 1. **`src/preload/index.ts`** ✅
**Purpose**: Secure bridge between Electron main process and React renderer

**What it does**:
- Exposes 12 IPC methods via `window.electron`
- Each method corresponds to an IPC handler in `src/main/index.ts`
- Uses `contextBridge` for security (prevents direct ipcRenderer access)
- All methods are type-safe with JSDoc documentation

**Methods exposed**:
```typescript
window.electron.createUser()
window.electron.resetUserPassword()
window.electron.deleteUser()
window.electron.addStudent()
window.electron.getStudent()
window.electron.updateStudent()
window.electron.requestDeleteStudent()
window.electron.getStudents()
window.electron.saveStudentImage()
window.electron.getPhoto()
window.electron.getNotifications()
window.electron.markNotificationRead()
window.electron.on()
window.electron.off()
window.electron.once()
```

---

### 2. **`src/preload/index.d.ts`** ✅
**Purpose**: TypeScript type definitions for the Electron API

**What it defines**:
- `ElectronAPI` interface matching methods in preload script
- Response types: `IpcResponse<T>`
- Data models: `User`, `Student`, `Request`, `Notification`
- Global `Window` interface extension for `window.electron`

**Usage in React**:
```typescript
// TypeScript now recognizes window.electron
const user = await window.electron.createUser({...});
// Type: Promise<IpcResponse<User>>
```

---

### 3. **`src/app/hooks/useIPC.ts`** ✅
**Purpose**: React hook for easy IPC communication

**Three hooks provided**:

#### **useIPC()** - Manual IPC Calls
```typescript
const { call, loading, error, clearError, reset } = useIPC();

// Call IPC handler on demand
const result = await call('getStudents', { limit: 10 });
```

#### **useIPCEffect()** - Auto-Fetch on Mount
```typescript
const { data, loading, error } = useIPCEffect('getStudents', { limit: 20 });
// Fetches automatically when component mounts
```

#### **useIPCMutation()** - Mutations (Create/Update/Delete)
```typescript
const { mutate, loading, error } = useIPCMutation('addStudent');

// Call on demand (e.g., form submission)
const result = await mutate(studentData);
```

---

### 4. **`src/app/hooks/useIPC.examples.ts`** (Bonus)
**Purpose**: Real-world examples showing how to use the hooks

Contains 7 complete examples:
1. Basic IPC call with `useIPC`
2. Auto-fetch with `useIPCEffect`
3. Adding data with `useIPCMutation`
4. User creation (MANAGER-only)
5. Image upload
6. Retry logic with exponential backoff
7. Type-safe calls with imports

---

## 🔧 How It All Works Together

### Architecture Flow

```
React Component
     ↓
useIPC Hook
     ↓
window.electron.method()
     ↓ (contextBridge - SECURE!)
Preload Script (index.ts)
     ↓
ipcRenderer.invoke()
     ↓ (IPC Channel)
Electron Main Process (src/main/index.ts)
     ↓
ipcMain.handle() - IPC Handler
     ↓
Prisma Database Query
     ↓
SQLite Database
     ↓ (response)
Back through IPC → React Component
```

### Security Layers

```
Layer 1: Preload Script
├─ ✅ Only specific methods exposed (not entire ipcRenderer)
├─ ✅ contextBridge prevents renderer access to Node APIs
└─ ✅ No file system or os module access

Layer 2: IPC Handlers (main.ts)
├─ ✅ RequesterId validation on sensitive operations
├─ ✅ Role-based access control
├─ ✅ Error handling and validation
└─ ✅ Audit logging

Layer 3: React
├─ ✅ TypeScript prevents wrong method calls
├─ ✅ Error states handled
└─ ✅ Loading states prevent double-submits
```

---

## 🚀 Quick Start - Using the Hooks

### Example 1: Fetch Students on Component Mount

```typescript
import React from 'react';
import { useIPCEffect } from '@/app/hooks/useIPC';

export function StudentList() {
  const { data: students, loading, error } = useIPCEffect('getStudents', {
    limit: 50,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {students?.map((s) => (
        <li key={s.id}>{s.nameAr}</li>
      ))}
    </ul>
  );
}
```

### Example 2: Add Student on Form Submit

```typescript
import React, { useState } from 'react';
import { useIPCMutation } from '@/app/hooks/useIPC';

export function AddStudentForm() {
  const { mutate: addStudent, loading, error } = useIPCMutation('addStudent');
  const [formData, setFormData] = useState({...});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addStudent(formData);
    
    if (result) {
      console.log('✅ Student added!');
      // Reset form, navigate, etc.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
      {error && <div style={{color: 'red'}}>{error}</div>}
    </form>
  );
}
```

### Example 3: Manual Call with Error Handling

```typescript
import React from 'react';
import { useIPC } from '@/app/hooks/useIPC';

export function CreateUserButton() {
  const { call, loading, error, clearError } = useIPC();

  const handleCreateUser = async () => {
    clearError();
    
    const result = await call('createUser', {
      email: 'supervisor@example.com',
      name: 'أحمد محمد',
      role: 'SUPERVISOR',
      requesterId: 'current-user-id',
    });

    if (result.success) {
      console.log('✅ User created:', result.data);
      console.log('📝 Temp password:', result.data.tempPassword);
    } else {
      console.error('❌ Error:', result.error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateUser} disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
```

---

## 📋 Integration Checklist

Before using the IPC bridge, verify:

- [ ] `src/preload/index.ts` is updated with all handlers
- [ ] `src/preload/index.d.ts` has type definitions
- [ ] `src/app/hooks/useIPC.ts` is in place
- [ ] `src/main/index.ts` has matching IPC handlers
- [ ] TypeScript compiles without errors: `npm run typecheck`
- [ ] Imports work in components: `import { useIPC } from '@/app/hooks/useIPC'`

### Verify in TypeScript

```bash
# Check that types compile correctly
npx tsc --noEmit

# You should see:
# ✓ 0 errors
```

### Verify at Runtime

In any React component:
```typescript
// This should work without TypeScript errors
const { call } = useIPC();
const result = await call('getStudents');
console.log('✅ IPC working!', result);
```

---

## 🎯 Response Format

All IPC handlers return this format:

```typescript
interface IpcResponse<T = any> {
  success: boolean;      // true if operation succeeded
  data?: T;              // Result data (if success = true)
  error?: string;        // Error message (if success = false)
  code?: string;         // Error code (e.g., 'UNAUTHORIZED', 'EMAIL_EXISTS')
}
```

### Examples:

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: '1',
    email: 'user@example.com',
    name: 'Ahmed',
    role: 'MANAGER',
    // ...
  }
}
```

**Error Response**:
```typescript
{
  success: false,
  error: 'Only managers can create users',
  code: 'UNAUTHORIZED'
}
```

---

## 🔐 Security Notes

### ✅ What's Secure

1. **Only whitelisted methods exposed** - Can't call arbitrary IPC handlers
2. **Context isolation enabled** - Renderer can't access Node APIs directly
3. **RequesterId validation** - Sensitive operations check who's calling
4. **Role-based access** - MANAGER-only operations enforced in main process
5. **No credentials in window** - Password hashing done server-side
6. **Error messages safe** - No stack traces or sensitive info in responses

### ⚠️ What NOT to Do

```typescript
// ❌ DON'T: Try to expose main process modules to window
window.fs = require('fs');  // This won't work - not available

// ❌ DON'T: Call arbitrary channels
await ipcRenderer.invoke('any-channel');  // Not exposed in preload

// ❌ DON'T: Store credentials in state
const [password, setPassword] = useState('');  // Use temporary, clear immediately

// ❌ DON'T: Trust client-side role checks alone
// Always validate in main process IPC handler
```

### ✅ DO This Instead

```typescript
// ✅ DO: Use only exposed preload methods
const result = await window.electron.createUser({...});

// ✅ DO: Handle async/await properly
try {
  const result = await call('method');
  if (result.success) { ... }
} catch (err) { ... }

// ✅ DO: Clear sensitive data
const [tempPassword, setTempPassword] = useState('');
// Clear after user copies it
setTempPassword('');

// ✅ DO: Validate on server
// IPC handler in main.ts checks requesterId role
```

---

## 📊 Method Reference

### User Management

| Method | Parameters | Returns | Requires |
|--------|-----------|---------|----------|
| `createUser` | email, name, role, requesterId | User | MANAGER |
| `resetUserPassword` | userId, requesterId | tempPassword, email | MANAGER |
| `deleteUser` | userId, requesterId | - | MANAGER |

### Student Management

| Method | Parameters | Returns | Public |
|--------|-----------|---------|--------|
| `addStudent` | studentData | Student | ✅ |
| `getStudent` | id | Student | ✅ |
| `updateStudent` | studentData | Student | ✅ |
| `requestDeleteStudent` | studentId, requesterId | Request | ✅ |
| `getStudents` | filters? | Student[], total | ✅ |

### Image Handling

| Method | Parameters | Returns | Notes |
|--------|-----------|---------|-------|
| `saveStudentImage` | tempFilePath, registrationNumber | path | Saves to userData |
| `getPhoto` | relativePath | url (app://) | For img src |

### Notifications

| Method | Parameters | Returns | Notes |
|--------|-----------|---------|-------|
| `getNotifications` | userId | Notification[] | Max 20 |
| `markNotificationRead` | notificationId | - | Updates UI state |

---

## 🧪 Testing the IPC Bridge

### Test 1: Verify Preload Works

```typescript
// In any React component
export function TestPreload() {
  React.useEffect(() => {
    console.log('window.electron exists?', !!window.electron);
    console.log('Methods available:', Object.keys(window.electron || {}));
  }, []);

  return <div>Check console</div>;
}
```

### Test 2: Verify Method Call

```typescript
export function TestIPC() {
  const { call } = useIPC({ verbose: true });

  const handleTest = async () => {
    const result = await call('getStudents', { limit: 1 });
    console.log('Result:', result);
  };

  return <button onClick={handleTest}>Test IPC</button>;
}
```

### Test 3: Verify Type Safety

```typescript
import type { Student, IpcResponse } from '@/preload/index.d';

export function TestTypes() {
  const { call } = useIPC();

  const test = async () => {
    const result: IpcResponse<Student> = await call('getStudent', 'id');
    // TypeScript will catch errors here ✓
    if (result.success && result.data) {
      console.log(result.data.nameAr); // ✓ TypeScript knows this exists
    }
  };
}
```

---

## 📚 Related Files

| File | Purpose | Status |
|------|---------|--------|
| `src/main/index.ts` | IPC handlers (12 handlers) | ✅ Complete |
| `src/preload/index.ts` | Expose API via contextBridge | ✅ Complete |
| `src/preload/index.d.ts` | TypeScript types | ✅ Complete |
| `src/app/hooks/useIPC.ts` | React hooks | ✅ Complete |
| `src/app/hooks/useIPC.examples.ts` | Usage examples | ✅ Complete |
| `prisma/schema.prisma` | Database models | ✅ From Phase 1 |
| `src/app/components/Layout.tsx` | Page wrapper | ✅ From Phase 1 |

---

## ✨ Next Steps (Phase 3)

Now that the IPC bridge is ready:

1. **Create Authentication Pages**
   - LoginPage.tsx (use `useIPC` to call IPC handlers)
   - Auth context provider

2. **Create Service Layer** (Optional)
   - Wrap useIPC hooks in service functions
   - Centralize data fetching logic

3. **Build Core Pages**
   - Dashboard (use `useIPCEffect` to fetch stats)
   - StudentList (paginated with `useIPC`)
   - AddStudentForm (use `useIPCMutation`)

4. **Add Error Boundaries**
   - Catch IPC errors gracefully
   - Show user-friendly messages

---

## 🎉 Phase 2 Complete!

**What you have now**:
- ✅ Secure preload script with 12+ methods
- ✅ Type-safe TypeScript definitions
- ✅ React hooks for IPC communication (3 variants)
- ✅ Comprehensive examples and documentation
- ✅ Ready to build React components

**Time to build first feature**: ~30 minutes (LoginPage or StudentList)

---

**Status**: 🟢 Ready for Phase 3 - React Components & Pages

Start building components using the examples in `useIPC.examples.ts` as templates!
