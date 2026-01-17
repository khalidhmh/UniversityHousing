# Phase 3: Demo Credentials & Database Setup

## 🔑 Demo Login Credentials

Use these credentials to test the authentication system:

### Manager Account
```
Email:    manager@test.com
Password: password123
Role:     MANAGER
Status:   ACTIVE
```

**Permissions**:
- Create new users (managers & supervisors)
- Reset user passwords
- Delete users (except last manager)
- View all student records
- Approve/Reject requests
- View audit logs
- Access settings

### Supervisor Account
```
Email:    supervisor@test.com
Password: password123
Role:     SUPERVISOR
Status:   ACTIVE
```

**Permissions**:
- View student records
- Create student requests
- Cannot create users
- Cannot access admin features

---

## 🗄️ Database Seeding

### Create Demo Users

Add these demo users to your Prisma database using `prisma seed`:

**File**: `prisma/seed.ts` (or `prisma/seed-users.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      email: 'manager@test.com',
      name: 'أحمد المدير',
      role: 'MANAGER',
      isActive: true,
      // TODO: Hash password with bcrypt in production
      // passwordHash: await bcrypt.hash('password123', 10)
      passwordHash: 'password123', // Demo only
    },
  });

  // Create supervisor user
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@test.com' },
    update: {},
    create: {
      email: 'supervisor@test.com',
      name: 'فاطمة المشرفة',
      role: 'SUPERVISOR',
      isActive: true,
      passwordHash: 'password123', // Demo only
    },
  });

  console.log('✅ Demo users created');
  console.log('Manager:', manager);
  console.log('Supervisor:', supervisor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Run Seed

```bash
npx prisma db seed
```

Or manually using migration:

```bash
npx prisma migrate dev --name add_demo_users
```

---

## 🔐 Password Security (TODO)

### Current Implementation
- **Status**: Demo mode
- **Password**: Stored as plain text (UNSAFE)
- **Security**: Not suitable for production

### TODO: Implement bcrypt

1. **Install bcrypt**:
   ```bash
   npm install bcryptjs
   npm install --save-dev @types/bcryptjs
   ```

2. **Update login handler** in `src/main/index.ts`:
   ```typescript
   import bcrypt from 'bcryptjs';

   // In login handler:
   const isValid = await bcrypt.compare(data.password, user.passwordHash);
   if (!isValid) {
     return { success: false, error: 'Invalid email or password' };
   }
   ```

3. **Hash password on create**:
   ```typescript
   import bcrypt from 'bcryptjs';

   // When creating user:
   const hashedPassword = await bcrypt.hash(data.password, 10);
   const user = await prisma.user.create({
     data: {
       ...data,
       passwordHash: hashedPassword,
     },
   });
   ```

4. **Update seed script**:
   ```typescript
   const hashedPassword = await bcrypt.hash('password123', 10);
   const manager = await prisma.user.create({
     data: {
       email: 'manager@test.com',
       name: 'أحمد المدير',
       role: 'MANAGER',
       isActive: true,
       passwordHash: hashedPassword,
     },
   });
   ```

---

## 📝 User Model Reference

From `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(SUPERVISOR)
  isActive  Boolean  @default(true)
  
  // TODO: Password field (to be added)
  // passwordHash String // Use bcrypt hash, never plain text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([role])
}

enum Role {
  MANAGER
  SUPERVISOR
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Login as Manager
1. Open app
2. Enter: manager@test.com / password123
3. Expected: Dashboard with admin features visible

### Scenario 2: Login as Supervisor
1. Open app
2. Enter: supervisor@test.com / password123
3. Expected: Dashboard with limited features (no admin)

### Scenario 3: Wrong Password
1. Enter: manager@test.com / wrongpassword
2. Expected: "Invalid email or password" error

### Scenario 4: Non-existent User
1. Enter: unknown@test.com / password123
2. Expected: "Invalid email or password" error

### Scenario 5: Inactive User (TODO)
1. Set a user's isActive to false
2. Try to login
3. Expected: "User account is inactive" error

---

## 🔄 Session Management

### Browser DevTools - localStorage

Check what's persisted:

```javascript
// Open browser DevTools Console (F12)
JSON.parse(localStorage.getItem('authUser'));

// Example output:
{
  "id": "cuid123...",
  "email": "manager@test.com",
  "name": "أحمد المدير",
  "role": "MANAGER",
  "isActive": true,
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T10:00:00.000Z"
}
```

### Clear Session

```javascript
localStorage.removeItem('authUser');
// Then refresh page or logout
```

---

## 📊 Database Setup Checklist

- [ ] Run `npx prisma migrate dev --name init` (creates database)
- [ ] Create demo users via seed script
- [ ] Test login with manager account
- [ ] Test login with supervisor account
- [ ] Test session persistence (close/reopen app)
- [ ] Test logout and login again
- [ ] Test wrong password error

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] **Password Hashing**: Implement bcrypt (not plain text)
- [ ] **Password Reset**: Add password reset flow
- [ ] **Session Tokens**: Use JWT instead of localStorage
- [ ] **HTTPS**: Enforce secure communication
- [ ] **Rate Limiting**: Prevent brute force login attempts
- [ ] **Audit Logging**: Log all login attempts
- [ ] **2FA**: Add two-factor authentication (optional)
- [ ] **Session Expiry**: Auto-logout after 30 minutes
- [ ] **CSRF Protection**: Validate requests
- [ ] **Input Validation**: Sanitize all inputs

---

## 📚 Related Documentation

- [Phase 3: Authentication System](./PHASE3_AUTH_SYSTEM.md) - Detailed auth implementation guide
- [Phase 3: Quick Reference](./PHASE3_QUICK_REFERENCE.md) - Quick start guide
- [Phase 2: IPC Bridge](./PHASE2_IPC_BRIDGE.md) - IPC communication details
- [Phase 1: Completion Report](./PHASE1_COMPLETION_REPORT.md) - Foundation setup

---

**Status**: 🟢 Ready for Testing

Use the demo credentials above to test the authentication system!
