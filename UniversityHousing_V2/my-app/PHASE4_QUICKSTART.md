# PHASE 4 QUICK REFERENCE GUIDE

## What Was Built

### 3 New Components
1. **DashboardPage** - Statistics overview with 4 stat cards
2. **StudentsPage** - Student data table with CRUD operations
3. **StudentForm** - Reusable modal form for create/edit

### 1 New IPC Handler
- `get-dashboard-stats` - Fetches dashboard statistics

### Updated Files
- `src/main/index.ts` - Added handler
- `src/preload/index.ts` - Added API method
- `src/preload/index.d.ts` - Added type definitions
- `src/app/App.tsx` - Updated routes
- `src/app/layouts/Sidebar.tsx` - Updated navigation

---

## Quick Start Testing

### Login
```
Email: manager@test.com
Password: password123
```

### Navigate to Dashboard
1. Click Sidebar "لوحة التحكم" (Dashboard)
2. View 4 stat cards: Total Students, Total Rooms, Occupied, Available

### Navigate to Students
1. Click Sidebar "إدارة الطلاب" (Student Management)
2. See all students in table
3. Use search to filter by name, ID, phone, or registration number

### Create Student
1. Click "Add Student" button
2. Fill in required fields (Arabic name, English name, email, phone, academic year, university, room type)
3. Click "Create Student"

### Edit Student
1. Find student in table
2. Click edit icon (pencil)
3. Update fields
4. Click "Update Student"

### Delete Student
1. Find student in table
2. Click delete icon (trash)
3. Confirm deletion
4. Student removed from table

---

## Component Imports

### Using DashboardPage
```typescript
import { DashboardPage } from './pages/Dashboard/DashboardPage';
```

### Using StudentsPage
```typescript
import { StudentsPage } from './pages/Students/StudentsPage';
```

### Using StudentForm
```typescript
import { StudentForm } from './components/students/StudentForm';
```

---

## IPC Methods Available

### Get Dashboard Stats
```typescript
const result = await window.electron.getDashboardStats();
// Returns: { success: true, data: { totalStudents, totalRooms, occupiedRooms, availableRooms } }
```

### Get Students
```typescript
const result = await window.electron.getStudents({});
// Returns: { success: true, data: { data: Student[], total: number } }
```

### Add Student
```typescript
const result = await window.electron.addStudent({
  nameAr: 'محمد علي',
  nameEn: 'Mohammed Ali',
  email: 'student@university.edu',
  phone: '+966501234567',
  academicYear: 2024,
  university: 'GOVERNMENT',
  roomType: 'STANDARD',
  registrationNumber: '20240001',
  nationalId: '1234567890'
});
// Returns: { success: true, data: Student }
```

### Update Student
```typescript
const result = await window.electron.updateStudent({
  id: 'student_id',
  nameEn: 'Updated Name',
  email: 'newemail@university.edu',
  status: 'ACTIVE'
});
// Returns: { success: true, data: Student }
```

### Delete Student
```typescript
const result = await window.electron.requestDeleteStudent({
  studentId: 'student_id',
  requesterId: 'current_user_id'
});
// Returns: { success: true, data: Request }
```

---

## Color Reference

```
Navy Blue:  #003366 (Primary)
Gold:       #D4AF37 (Accent)
Green:      #10B981 (Success)
Blue:       #3B82F6 (Info)
Red:        #EF4444 (Error)
Gray:       #6B7280 (Neutral)
```

---

## Form Field Requirements

### Required Fields
- Arabic Name (nameAr)
- English Name (nameEn)
- Email (must be valid email)
- Phone (must be non-empty)
- Academic Year (numeric)
- University (GOVERNMENT or PRIVATE)
- Room Type (STANDARD or PREMIUM)
- Registration Number (new students only)

### Optional Fields
- National ID
- Room Number
- Check-in Date
- Photo Path

---

## Error Handling

### Dashboard Errors
If stats fail to load, see red alert with error message

### Students Page Errors
- Failed to load students: red alert displayed
- Failed to create/update: error shown in form
- Failed to delete: error shown with confirmation dialog

### Form Validation Errors
- Required field missing: error shown below field
- Invalid email: error shown below field
- Errors clear when field is edited

---

## Keyboard Shortcuts

- **Esc**: Close modal (form or confirmation)
- **Enter**: Submit form (when no required errors)
- **Tab**: Navigate form fields

---

## Database Queries Used

### Dashboard Stats
```sql
-- Total Students
SELECT COUNT(*) FROM Student;

-- Total Rooms
SELECT COUNT(*) FROM Room;

-- Occupied Rooms
SELECT COUNT(*) FROM Room WHERE isOccupied = true;

-- Available Rooms
SELECT COUNT(*) FROM Room WHERE isOccupied = false;
```

### Get Students
```sql
SELECT * FROM Student 
ORDER BY createdAt DESC;
```

### Add Student
```sql
INSERT INTO Student (
  registrationNumber, nameAr, nameEn, email, phone,
  academicYear, university, roomType, status
) VALUES (...);
```

### Update Student
```sql
UPDATE Student SET {...} WHERE id = '...';
```

### Delete Student
```sql
INSERT INTO Request (type, studentId, requesterId, status)
VALUES ('DELETE_STUDENT', '...', '...', 'PENDING');
```

---

## Status Codes

### IPC Response
```typescript
interface IpcResponse {
  success: boolean;      // true/false
  data?: any;           // Result if success
  error?: string;       // Error message if failed
  code?: string;        // Error code if available
}
```

### Student Statuses
- `ACTIVE` - Student is active
- `INACTIVE` - Student is inactive
- `GRADUATED` - Student has graduated
- `SUSPENDED` - Student is suspended

### Room Types
- `STANDARD` - Standard room
- `PREMIUM` - Premium room

### University Types
- `GOVERNMENT` - Government university
- `PRIVATE` - Private university

---

## Performance Tips

1. **Search**: Uses client-side filtering for instant results
2. **Dashboard**: Single query on load, cached until page refresh
3. **Table**: Renders only visible rows (handled by browser)
4. **Modal**: Form state isolated, doesn't affect parent

---

## Troubleshooting

### Dashboard not loading
- Check browser console for errors
- Verify database connection
- Check IPC handler in main/index.ts

### Students table empty
- Check if students exist in database
- Verify getStudents handler is working
- Check browser console for errors

### Form not submitting
- Check required fields are filled
- Verify email format if entering email
- Check console for IPC errors

### Delete not working
- Verify requestDeleteStudent handler exists
- Check userId is stored in localStorage
- See confirmation dialog for error message

---

## File Locations

```
src/pages/Dashboard/DashboardPage.tsx      ← Dashboard component
src/pages/Students/StudentsPage.tsx         ← Students component
src/app/components/students/StudentForm.tsx ← Form component
src/main/index.ts                           ← IPC handler (get-dashboard-stats)
src/preload/index.ts                        ← API method (getDashboardStats)
src/preload/index.d.ts                      ← Type definitions
src/app/App.tsx                             ← Routes
src/app/layouts/Sidebar.tsx                 ← Navigation
```

---

## TypeScript Verification

All files compile successfully with 0 errors:
```bash
$ npx tsc --noEmit
# Returns: (no output = success)
```

---

## Next Actions

1. **Test the Dashboard**
   - Login and navigate to Dashboard
   - Verify stat cards display
   - Check quick stats calculations

2. **Test Student Management**
   - Create a new student
   - Search for student
   - Edit existing student
   - Delete student with confirmation

3. **Verify Integration**
   - Check browser console for errors
   - Verify database updates
   - Test error scenarios

4. **Review Code**
   - Check component logic
   - Review form validation
   - Verify IPC communication
   - Check styling matches theme

---

**Phase 4 is complete and ready for testing!**
