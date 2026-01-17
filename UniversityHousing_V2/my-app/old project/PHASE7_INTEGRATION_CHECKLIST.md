# Phase 7 - Quick Integration Checklist

## ✅ Completed Tasks

### Database & Backend
- [x] Request model added to schema.prisma
- [x] Notification model added to schema.prisma
- [x] User model relations updated
- [x] Migration created: 20251220153711_add_request_notification_models
- [x] Database tables created successfully
- [x] Backup handler in electron/main.js
- [x] Restore handler in electron/main.js
- [x] getDatabasePath() exported from database.ts
- [x] reconnect() function added to database.ts

### Frontend Components
- [x] NotificationCenter.tsx created
- [x] RequestsPage.tsx created
- [x] StudentProfilePage.tsx updated
- [x] DashboardPage.tsx updated with role-based views
- [x] SettingsPage.tsx completely rewritten

### Design & RTL
- [x] All components support RTL (dir="rtl")
- [x] Arabic text properly integrated
- [x] Consistent color scheme applied
- [x] Responsive design verified
- [x] Shadcn/ui components used

## 🚀 Ready to Test

You can now test the following without additional code:

### 1. Database Functionality
```bash
npm run electron-dev

# Verify:
- App starts without errors
- Database connects successfully
- Tables exist (requests, notifications)
```

### 2. UI Components
```bash
# In browser at http://localhost:5175:
- Navigate to all pages
- Check responsive design
- Verify Arabic text displays correctly
- Test RTL layout
```

### 3. Backup/Restore (Partially Working)
```bash
# In Electron app Settings:
1. Click "Create Backup"
   ✅ Dialog opens for file location
   ✅ Can select where to save
   ✅ File is created with .db extension

2. Click "Restore from Backup"
   ✅ Dialog opens to select file
   ✅ Can select backup file
   ✅ File is restored (may need app restart)
```

## ⏳ Still TODO - IPC Handlers (Priority Order)

### 1. Student Deletion Request (Required for StudentProfile)
```typescript
// Location: electron/main.js - Add after restore-database handler

ipcMain.handle('create-deletion-request', async (event, { studentId, requesterId }) => {
  try {
    const request = await database.prisma.request.create({
      data: {
        type: 'DELETE_STUDENT',
        status: 'PENDING',
        data: JSON.stringify({ studentId }),
        requesterId
      }
    });

    // Create notification for all managers
    const managers = await database.prisma.user.findMany({
      where: { role: 'MANAGER' }
    });

    const student = await database.prisma.student.findUnique({
      where: { id: studentId }
    });

    const requester = await database.prisma.user.findUnique({
      where: { id: requesterId }
    });

    for (const manager of managers) {
      await database.prisma.notification.create({
        data: {
          userId: manager.id,
          title: 'طلب حذف طالب جديد',
          message: `طلب من ${requester.fullName} لحذف بيانات الطالب ${student.name}`,
          isRead: false
        }
      });
    }

    return { success: true, request };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 2. Get Pending Requests (Required for RequestsPage)
```typescript
ipcMain.handle('get-pending-requests', async (event) => {
  try {
    const requests = await database.prisma.request.findMany({
      where: { status: 'PENDING' },
      include: {
        requester: {
          select: { id: true, fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, requests };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 3. Approve Request (Required for RequestsPage approve button)
```typescript
ipcMain.handle('approve-request', async (event, { requestId, resolverId }) => {
  try {
    const request = await database.prisma.request.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        resolverId,
        updatedAt: new Date()
      },
      include: { requester: true }
    });

    // Execute the actual deletion if it's a DELETE_STUDENT request
    if (request.type === 'DELETE_STUDENT') {
      const data = JSON.parse(request.data);
      await database.prisma.student.delete({
        where: { id: data.studentId }
      });

      // Log the action
      await database.prisma.log.create({
        data: {
          action: 'DELETE_STUDENT',
          details: JSON.stringify({ studentId: data.studentId, requestId }),
          userId: resolverId
        }
      });
    }

    // Notify the requester
    await database.prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: 'تم الموافقة على طلبك',
        message: `تمت الموافقة على طلبك`,
        isRead: false
      }
    });

    return { success: true, request };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 4. Reject Request (Required for RequestsPage reject button)
```typescript
ipcMain.handle('reject-request', async (event, { requestId, resolverId, reason }) => {
  try {
    const request = await database.prisma.request.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        resolverId,
        updatedAt: new Date()
      },
      include: { requester: true }
    });

    // Notify the requester
    await database.prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: 'تم رفض طلبك',
        message: `تم رفض طلبك${reason ? ': ' + reason : ''}`,
        isRead: false
      }
    });

    return { success: true, request };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 5. Get Notifications (Required for NotificationCenter)
```typescript
ipcMain.handle('get-notifications', async (event, { userId }) => {
  try {
    const notifications = await database.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return { success: true, notifications };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 6. Mark Notification Read (For NotificationCenter mark button)
```typescript
ipcMain.handle('mark-notification-read', async (event, { notificationId }) => {
  try {
    await database.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 7. Delete Notification (For NotificationCenter delete button)
```typescript
ipcMain.handle('delete-notification', async (event, { notificationId }) => {
  try {
    await database.prisma.notification.delete({
      where: { id: notificationId }
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 8. Create User (For SettingsPage add user button)
```typescript
ipcMain.handle('create-user', async (event, { username, fullName, role }) => {
  try {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    const user = await database.prisma.user.create({
      data: {
        username,
        fullName,
        role: role || 'SUPERVISOR',
        password: hashedPassword
      }
    });

    // TODO: Send email with temporary password

    return {
      success: true,
      message: `تم إنشاء المستخدم بنجاح. كلمة المرور المؤقتة: ${tempPassword}`,
      user
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 9. Reset User Password (For SettingsPage reset button)
```typescript
ipcMain.handle('reset-user-password', async (event, { userId }) => {
  try {
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    await database.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // TODO: Send email with temporary password

    return {
      success: true,
      message: `تم إعادة تعيين كلمة المرور. الكلمة المؤقتة: ${tempPassword}`
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 10. Delete User (For SettingsPage delete button)
```typescript
ipcMain.handle('delete-user', async (event, { userId }) => {
  try {
    // Prevent deleting the last manager
    const managers = await database.prisma.user.count({
      where: { role: 'MANAGER' }
    });

    const user = await database.prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role === 'MANAGER' && managers <= 1) {
      return {
        success: false,
        message: 'لا يمكن حذف آخر مدير في النظام'
      };
    }

    await database.prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: 'تم حذف المستخدم بنجاح' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

## 🔗 Frontend Integration Points

### 1. Add NotificationCenter to Header
**File:** `src/app/components/Layout.tsx`

```typescript
import { NotificationCenter } from './NotificationCenter';

// In the header, add:
<div className="flex items-center gap-4">
  <NotificationCenter />
  {/* other header items */}
</div>
```

### 2. Add RequestsPage to Routes
**File:** `src/app/App.tsx`

```typescript
import { RequestsPage } from './pages/RequestsPage';

// In your routes:
<Route path="/requests" element={<RequestsPage />} />
```

### 3. Uncomment IPC Calls
All components have TODO comments with IPC calls that need to be uncommented:

- StudentProfilePage.tsx - Line ~52: create-deletion-request
- RequestsPage.tsx - Line ~66: get-pending-requests, approve-request, reject-request
- NotificationCenter.tsx - Line ~42: get-notifications, mark-notification-read, delete-notification
- SettingsPage.tsx - Line ~95, 157, 188, 221: backup-database, restore-database, create-user, reset-user-password, delete-user

## 📋 Order of Implementation

1. **First** - Implement backup/restore handlers (already done, just test)
2. **Second** - Implement request handlers (create, get, approve, reject)
3. **Third** - Implement notification handlers
4. **Fourth** - Implement user management handlers
5. **Fifth** - Uncomment IPC calls in frontend
6. **Sixth** - Add NotificationCenter to Header
7. **Seventh** - Add RequestsPage to routes
8. **Eighth** - Full end-to-end testing

## 🧪 Testing Priority

1. Backup/Restore (highest impact)
2. Request deletion workflow
3. Manager approval workflow
4. Notifications
5. User management
6. Dashboard role-based views

## 📊 Estimated Time

- Implement all IPC handlers: 2-3 hours
- Test all workflows: 1-2 hours
- Bug fixes and refinement: 1 hour
- **Total: 4-6 hours**

## ✨ Once Complete

Phase 7 will provide:
- ✅ Safe deletion with approval workflow
- ✅ Full database backup/restore capability
- ✅ User management system
- ✅ Real-time notifications
- ✅ Role-based interfaces
- ✅ Audit trail of all operations

Ready to proceed? Start implementing the IPC handlers in order!
