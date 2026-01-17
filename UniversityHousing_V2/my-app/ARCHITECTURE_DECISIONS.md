# 🏗️ Architecture Decisions & Security Model

## Overview

This document explains the key architectural decisions made for the University Housing Management System V2, why they were chosen, and how they ensure security, scalability, and maintainability.

---

## 1. Role-Based Access Control (RBAC)

### Decision
Implement a two-tier role system: `MANAGER` and `SUPERVISOR`

### Implementation
```
User Table:
├── id: String (unique)
├── role: Enum ["MANAGER", "SUPERVISOR"]
└── isActive: Boolean

IPC Handler Validation:
├── create-user → Requires role === "MANAGER"
├── reset-password → Requires role === "MANAGER"
├── delete-user → Requires role === "MANAGER"
└── Standard operations (get-student, add-student) → No role restriction
```

### Why This Approach?
1. **Server-Side Enforcement**: IPC handlers validate `requesterId` role before executing sensitive operations
2. **Defense in Depth**: UI layer (Sidebar) also filters menu items by role, but doesn't trust it for security
3. **Audit Trail**: Log table records who performed each action with timestamp
4. **Simple & Scalable**: Only 2 roles now, easy to add ADMIN, VIEWER in future

### Code Example
```typescript
// In main.ts - create-user handler
ipcMain.handle('create-user', async (_event, data) => {
  // CRITICAL: Verify requester is MANAGER
  const requester = await prisma.user.findUnique({
    where: { id: data.requesterId },
  });

  if (!requester || requester.role !== 'MANAGER') {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Proceed with user creation
  const user = await prisma.user.create({ ... });
  
  // Log the action
  await prisma.log.create({
    action: 'CREATE_USER',
    userId: data.requesterId,
    metadata: JSON.stringify({ newUserId: user.id }),
  });
});
```

### UI Layer (Secondary Security)
```typescript
// In Sidebar.tsx - role-based menu filtering
const allMenuItems = [
  { id: 'logs', roles: ['MANAGER'] },           // Hidden from SUPERVISOR
  { id: 'settings', roles: ['MANAGER'] },       // Hidden from SUPERVISOR
  { id: 'dashboard', roles: ['MANAGER', 'SUPERVISOR'] }, // Visible to both
];

const menuItems = allMenuItems.filter(item => 
  item.roles.includes(user.role)
);
```

---

## 2. Database Model & Relationships

### Schema Philosophy
- **Normalized**: No data duplication, single source of truth
- **Relational**: Uses foreign keys and cascading deletes for integrity
- **Audit-Ready**: Every model has `createdAt`, `updatedAt` timestamps
- **Metadata Flexible**: Complex data stored as JSON (not optimized for queries)

### Key Models

#### User (Authentication & Authorization)
```prisma
model User {
  id String @id @default(cuid())         // Unique ID
  email String @unique                    // Email index for fast lookup
  password String                         // Bcrypted hash (10 salt rounds)
  name String                             // Display name
  role UserRole                           // MANAGER | SUPERVISOR
  isActive Boolean @default(true)         // Soft delete capability
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  createdRequests Request[] @relation("RequestCreator")
  resolvedRequests Request[] @relation("RequestResolver")
  logs Log[]
  notifications Notification[]
}
```

**Why This Design?**
- Email is unique identifier for login (not ID)
- Role stored as enum (type-safe, enforces valid values)
- `isActive` allows deactivation without deletion (keeps audit trail)
- Relations track who created/approved requests

#### Student (Core Data)
```prisma
model Student {
  id String @id
  registrationNumber String @unique       // 10 digits - Saudi student ID
  nationalId String @unique               // 8-15 alphanumeric - Passport/ID
  nameAr String                           // Arabic name
  nameEn String                           // English name
  
  academicYear Int                        // 1-4 for undergraduate
  university UniversityType               // GOVERNMENT | PRIVATE
  roomType RoomType                       // STANDARD | PREMIUM
  status StudentStatus                    // ACTIVE | INACTIVE | etc
  
  photoPath String?                       // Relative: "student_photos/2024001.jpg"
  
  hasMissingData Boolean @default(false)  // FLAG: Incomplete record
  missingFields String?                   // JSON array of field names
  
  roomNumber String?                      // Current room assignment
  checkInDate DateTime?                   // When student moved in
}
```

**Why This Design?**
- Registration + National ID: Dual uniqueness ensures no duplicates
- Names in Arabic + English: Support bilingual operations
- `hasMissingData` + `missingFields`: Track incomplete records without separate table
- Photo: Relative path (survives app reinstalls)
- Status enum: Prevents invalid states

#### Request (Approval Workflow)
```prisma
model Request {
  id String @id
  type RequestType              // DELETE_STUDENT | ROOM_CHANGE | OTHER
  status RequestStatus          // PENDING | APPROVED | REJECTED
  
  studentId String?             // Which student is affected
  metadata String               // JSON details specific to request type
  
  requesterId String            // Who created the request
  requester User @relation("RequestCreator")
  
  resolverId String?            // Who approved/rejected (null if pending)
  resolver User? @relation("RequestResolver")
  
  rejectionReason String?       // Why it was rejected
  
  createdAt DateTime @default(now())
  resolvedAt DateTime?
}
```

**Why This Design?**
- Separate request table: Audit trail of decisions (not just final state)
- Both creator + resolver tracked: Know who requested and who approved
- Metadata as JSON: Flexible for different request types (DELETE_STUDENT, ROOM_CHANGE, etc)
- rejectionReason: Transparency for requester

#### Log (Audit Trail)
```prisma
model Log {
  id String @id
  action LogAction              // CREATE_USER | DELETE_STUDENT | etc
  userId String                 // Who did this
  user User @relation(...)
  
  metadata String               // JSON with context (studentId, requestId, etc)
  description String?           // Human-readable summary
  
  createdAt DateTime @default(now())
}

enum LogAction {
  LOGIN
  LOGOUT
  CREATE_USER
  DELETE_USER
  CREATE_STUDENT
  UPDATE_STUDENT
  DELETE_STUDENT
  CREATE_REQUEST
  APPROVE_REQUEST
  REJECT_REQUEST
  UPLOAD_IMAGE
  IMPORT_EXCEL
  BACKUP_DATABASE
  RESTORE_DATABASE
  OTHER
}
```

**Why This Design?**
- Immutable: Once created, never updated (append-only log)
- JSON metadata: Stores before/after states for critical operations
- Indexed by userId + action + timestamp: Fast queries ("What did user X do?")

---

## 3. Image Storage Strategy

### Decision
Store images in `${app.getPath('userData')}/student_photos/` with relative paths in database

### Why Not...?

#### ❌ Absolute Paths (e.g., `C:\Users\...\student_photos\2024001.jpg`)
- **Problem**: If app is reinstalled to different location, paths break
- **Problem**: Different between development and production environments
- **Problem**: Sharing database between computers fails

#### ❌ Base64 in Database
- **Problem**: Bloats database size (1MB photo = bloated database)
- **Problem**: Slow queries when photos are embedded
- **Problem**: Hard to update/replace a single photo

#### ❌ Cloud Storage (AWS S3, etc)
- **Problem**: Desktop app doesn't have internet guarantee
- **Problem**: Adds dependency on external service
- **Problem**: Cost, authentication complexity

### ✅ Our Solution: Relative Paths + `app://` Protocol

**Database Storage:**
```
photoPath = "student_photos/2024001.jpg"  // Relative to userData
```

**File System Storage:**
```
${userData}/student_photos/
├── 2024001.jpg
├── 2024002.jpg
└── 2024003.jpg
```

**Serving to UI:**
```typescript
// IPC Handler (main.ts)
ipcMain.handle('save-student-image', async (_event, data) => {
  const photoDir = join(app.getPath('userData'), 'student_photos');
  const destPath = join(photoDir, `${data.registrationNumber}.jpg`);
  fs.copyFileSync(data.tempFilePath, destPath);
  
  // Return relative path for storage
  return { success: true, path: 'student_photos/2024001.jpg' };
});

// UI Component (React)
<img src="app://student_photos/2024001.jpg" alt="Student" />

// App Protocol Handler (main.ts)
protocol.registerFileProtocol('app', (request, callback) => {
  const url = request.url.slice('app://'.length);
  
  // Security: Prevent directory traversal
  if (url.includes('..')) {
    callback({ statusCode: 403 });
    return;
  }
  
  const filePath = normalize(join(app.getPath('userData'), url));
  if (fs.existsSync(filePath)) {
    callback({ path: filePath });
  } else {
    callback({ statusCode: 404 });
  }
});
```

**Benefits:**
1. ✅ Survives app reinstalls/relocations
2. ✅ Same registration number = same file (easy updates)
3. ✅ Secure: Path traversal prevention, file existence check
4. ✅ Fast: Images served from local filesystem
5. ✅ Portable: Database can be copied to another computer

---

## 4. IPC (Inter-Process Communication) Pattern

### Architecture
```
Renderer Process                Main Process
(React App)                     (Electron)

useIPC()
  ↓
window.electron.invoke()
  ↓ (IPC message over bridge)
ipcMain.handle()
  ↓
Prisma Client
  ↓
SQLite Database
```

### Why This Pattern?
1. **Security**: Renderer can't directly access database (sandboxed)
2. **Stability**: If React crashes, Electron main process keeps data safe
3. **Async**: IPC calls are async, doesn't block UI
4. **Type-Safe**: TypeScript types for all IPC methods

### Handler Naming Convention
```
Verb-Noun Pattern:
├── get-students (Fetch multiple)
├── get-student (Fetch one)
├── add-student (Create new)
├── update-student (Modify existing)
├── delete-student (Remove - but actually creates request)
├── save-student-image (Upload file)
├── get-photo (Retrieve file path/URL)
├── create-user (Admin only - role check)
├── reset-user-password (Admin only)
├── delete-user (Admin only - with safeguards)
├── get-notifications (Fetch alerts)
├── mark-notification-read (Update UI state)
└── [more as needed]
```

### Error Handling Pattern
```typescript
// In main.ts handler
ipcMain.handle('add-student', async (_event, studentData) => {
  try {
    const student = await prisma.student.create({ data: studentData });
    return { 
      success: true, 
      data: student 
    };
  } catch (error) {
    console.error('Error adding student:', error);
    return { 
      success: false, 
      error: 'Failed to add student' 
    };
  }
});

// In React hook
const { invoke, loading, error } = useIPC();

try {
  const result = await invoke('add-student', {
    registrationNumber: '2024001',
    nameAr: 'أحمد محمد',
    // ...
  });
  
  if (result.success) {
    console.log('Student added:', result.data);
  } else {
    console.error('Error:', result.error);
  }
} catch (err) {
  console.error('IPC error:', err);
}
```

---

## 5. Request Workflow (Deletion Example)

### Why a Request/Approval System?

❌ **Direct Deletion** (Old Approach)
```
User clicks "Delete" → Student deleted immediately → No undo possible
```

✅ **Request/Approval Workflow** (New Approach)
```
User clicks "Delete" → Creates Request (PENDING) 
                    → Manager notified
                    → Manager approves/rejects
                    → If approved, then deletes + creates Log entry
                    → Requester notified of decision
```

### Database State
```
Student: Status = ACTIVE, deletionRequest = null
    ↓ Request created
Request: type = DELETE_STUDENT, status = PENDING, requesterId = supervisor1, resolverId = null
    ↓ Manager approves
Request: type = DELETE_STUDENT, status = APPROVED, requesterId = supervisor1, resolverId = manager1
Student: Status = DELETED, deletionRequest = request1
Log: action = DELETE_STUDENT, userId = manager1, metadata = { studentId: ..., requestId: ... }
```

### Benefits
1. **Audit Trail**: Know who requested deletion and who approved
2. **Reversible**: Request can be rejected with reason
3. **Transparent**: Requester knows decision was made
4. **Notifications**: Managers alerted of pending requests
5. **Compliance**: Follows "separation of duties" principle

---

## 6. Sidebar Role-Based Filtering

### Implementation

```typescript
// All available menu items
const allMenuItems = [
  { 
    id: 'dashboard', 
    path: '/dashboard', 
    icon: Home, 
    label: 'لوحة التحكم',
    roles: ['MANAGER', 'SUPERVISOR']  // ← Role restriction
  },
  { 
    id: 'logs', 
    path: '/logs', 
    icon: ClipboardList, 
    label: 'السجلات',
    roles: ['MANAGER']  // ← Only MANAGER sees this
  },
  { 
    id: 'settings', 
    path: '/settings', 
    icon: Settings, 
    label: 'الإعدادات',
    roles: ['MANAGER']  // ← Only MANAGER sees this
  },
];

// Filter based on user role
const menuItems = allMenuItems.filter(item => 
  item.roles.includes(user.role)
);
```

### Why This Isn't Enough
```
⚠️ User could bypass this by manually typing /logs in URL
⚠️ User could inspect Network tab and see what endpoints exist
⚠️ Not a security feature, just a UX feature
```

### True Security
```
✅ Backend validates requesterId on sensitive IPC handlers
✅ Main process (Electron) enforces permissions
✅ Database audit log tracks who did what
```

### This Sidebar Filter's Real Purpose
```
✅ Hide irrelevant options from SUPERVISOR (reduce confusion)
✅ Give MANAGER quick access to admin features
✅ Improve UX by showing only applicable menu items
```

---

## 7. Security Checklist

### ✅ Authentication
- [ ] Password hashed with bcryptjs (10 rounds)
- [ ] Temporary password on new user creation
- [ ] Login validates email + password combination
- [ ] Session/token management (TODO: add JWT or session store)

### ✅ Authorization
- [ ] Role-based access control (MANAGER, SUPERVISOR)
- [ ] IPC handlers validate requesterId
- [ ] Prevent deletion of last MANAGER
- [ ] UI hides unauthorized menu items

### ✅ Data Protection
- [ ] Parameterized queries prevent SQL injection
- [ ] Relative image paths (no absolute paths)
- [ ] Path traversal prevention in app:// protocol
- [ ] Relational integrity with foreign keys

### ✅ Audit & Logging
- [ ] Log table tracks all actions
- [ ] User ID logged with every action
- [ ] Timestamps on all records
- [ ] Metadata stored as JSON for context

### ✅ Process Security
- [ ] Electron sandbox enabled
- [ ] Context isolation enabled
- [ ] Preload script validates IPC calls
- [ ] DevTools disabled in production

---

## 8. Future Scalability

### What We Can Add Without Major Refactoring

1. **More Roles**
   ```prisma
   enum UserRole {
     ADMIN
     MANAGER
     SUPERVISOR
     STAFF
     STUDENT_VIEWER
   }
   ```

2. **Permission Matrix**
   ```typescript
   const permissions = {
     'MANAGER': ['CREATE_USER', 'DELETE_USER', 'APPROVE_REQUEST', ...],
     'SUPERVISOR': ['CREATE_STUDENT', 'UPDATE_STUDENT', 'CREATE_REQUEST', ...],
   };
   ```

3. **Room Management**
   - Already in schema: Room model with occupancy tracking
   - Just need pages and IPC handlers

4. **Multi-Building Support**
   ```prisma
   model Building {
     id String @id
     name String
     floors Int
     capacity Int
     rooms Room[] @relation(...)
   }
   ```

5. **Advanced Notifications**
   - Email notifications via nodemailer
   - SMS via Twilio
   - In-app polling (every 30s)

6. **Data Export**
   - Excel export: XLSX library already installed
   - PDF reports: Add pdfkit
   - CSV dumps

---

## Summary

**This architecture is:**
- ✅ Secure by design (defense in depth)
- ✅ Maintainable (clear separation of concerns)
- ✅ Scalable (easy to add features)
- ✅ Auditable (comprehensive logging)
- ✅ Type-safe (TypeScript throughout)
- ✅ User-friendly (role-based UI)
- ✅ Desktop-native (Electron best practices)

**Key Principles:**
1. Never trust the client (validate on server/main process)
2. Log everything (audit trail is critical)
3. Fail safely (don't delete without approval)
4. Make it simple (not over-engineered)
5. Think about the user (good UX for both roles)

---

## Questions?

Refer to:
- Schema: `prisma/schema.prisma`
- Implementation: `src/main/index.ts`
- UI: `src/app/layouts/Sidebar.tsx`
- Docs: This file + PHASE1_COMPLETION_REPORT.md
