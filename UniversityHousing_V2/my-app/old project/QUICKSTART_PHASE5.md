# 🚀 Quick Start Guide - Phase 5 Database Setup

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```powershell
npm install
```
**What it does:** Installs Prisma, bcryptjs, and all dependencies

### 2. Create Database & Tables
```powershell
npm run db:push
```
**What it does:** Creates `university-housing.db` with all tables

### 3. Seed Test Data
```powershell
npm run db:seed
```
**What it does:** Populates with admin user, supervisor, and 10 students

### 4. Run Application
```powershell
npm run electron-dev
```
**What it does:** Starts app with real database connected

---

## 🔑 Test Login Credentials

After seeding, use these to test:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Full access |
| `supervisor` | `supervisor123` | Student management |

---

## ✅ Verify Setup

### Check Database File Created
```powershell
# Should exist in project root
dir university-housing.db
```

### Test Database Connection (from DevTools)
```javascript
const result = await window.electron.ipcRenderer.invoke('check-db-connection');
console.log(result); // Should show: {success: true, message: "..."}
```

### Test Getting Students
```javascript
const students = await window.electron.ipcRenderer.invoke('get-students');
console.log(students); // Should show array with 10 students
```

### Test Login
```javascript
const user = await window.electron.ipcRenderer.invoke('user-login', {
  username: 'admin',
  password: 'admin123'
});
console.log(user); // Should show user object with role
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database structure |
| `electron/database.ts` | Student CRUD operations |
| `electron/authService.ts` | Login & permissions |
| `electron/main.js` | IPC handlers (updated) |
| `package.json` | Dependencies & scripts |
| `.env` | Database configuration |

---

## 🛠️ Useful Commands

```powershell
# View database in browser GUI
npm run db:studio

# Reset database (WARNING: deletes all data!)
npm run db:reset

# Update database schema
npm run db:migrate

# Show database logs
npm run db:seed  # Includes debug info
```

---

## ⚠️ Common Issues

**Database file not created?**
```powershell
npx prisma generate
npm run db:push
```

**Password hashing slow?**
- Normal! bcryptjs with 10 rounds takes ~100ms
- Security > Speed for passwords

**Can't login with test user?**
```powershell
npm run db:reset  # Reseeds data
```

---

## 🎯 What's Working Now

✅ SQLite database with persistent storage  
✅ User authentication with password hashing  
✅ RBAC with MANAGER/SUPERVISOR roles  
✅ Complete student CRUD operations  
✅ Search and filtering  
✅ Audit logging on all changes  
✅ Error messages in Arabic  
✅ Type-safe TypeScript queries  
✅ Ready for PostgreSQL migration  

---

## 📖 Full Documentation

See `PHASE5_DATABASE_INTEGRATION.md` for:
- Complete architecture overview
- Detailed function reference
- Security implementation details
- Performance optimization
- PostgreSQL migration guide
- Troubleshooting & FAQs

---

**Status:** ✅ Ready for Testing

All infrastructure in place. Start with Step 1 above!
