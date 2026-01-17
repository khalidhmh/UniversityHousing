import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client'
// مش من المسار الطويل ./prisma/generated/client;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Store main window reference
let mainWindow: BrowserWindow | null;

/**
 * === DATABASE INITIALIZATION ===
 * Initialize SQLite database file in app data directory
 */
function ensureDatabaseDirectory() {
  const dbDir = join(app.getPath('userData'), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return dbDir;
}

/**
 * === PROTOCOL REGISTRATION (app://) ===
 * Registers custom protocol for serving local assets and images securely
 * Usage: img src="app://student_photos/2024001.jpg"
 */
function registerAppProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    // Extract the path after 'app://'
    const url = request.url.slice('app://'.length);

    // Validate path to prevent directory traversal attacks
    if (url.includes('..')) {
      callback({ statusCode: 403 });
      return;
    }

    // Construct safe file path
    const filePath = path.normalize(path.join(app.getPath('userData'), url));

    // Verify file exists before serving
    if (fs.existsSync(filePath)) {
      callback({ path: filePath });
    } else {
      callback({ statusCode: 404 });
    }
  });
}

/**
 * === WINDOW CREATION ===
 * Creates the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
    },
    icon: icon,
  });

  // Load URL or file based on environment
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools in development
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * === APP LIFECYCLE ===
 */
app.on('ready', async () => {
  ensureDatabaseDirectory();
  registerAppProtocol();
  createWindow();
});

app.on('window-all-closed', async () => {
  // Disconnect Prisma before closing
  await prisma.$disconnect();

  // On macOS, apps stay open until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// ============================================
// IPC HANDLERS - AUTHENTICATION
// ============================================

/**
 * Handler: login
 * Authenticates user with email and password
 * Returns user object if successful
 */
ipcMain.handle('login', async (_event, data: { email: string; password: string }) => {
  try {
    // Validate input
    if (!data.email || !data.password) {
      return {
        success: false,
        error: 'Email and password are required',
        code: 'INVALID_INPUT',
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'User account is inactive',
        code: 'ACCOUNT_INACTIVE',
      };
    }

    // TODO: Implement password verification with bcrypt
    // For now, accept any password for demo purposes
    // In production, use: const isValid = await bcrypt.compare(data.password, user.passwordHash);
    // if (!isValid) { return { success: false, error: 'Invalid email or password' }; }

    // Return user data (excluding sensitive fields)
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred during login',
      code: 'SERVER_ERROR',
    };
  }
});

// ============================================
// IPC HANDLERS - USER MANAGEMENT
// ============================================

/**
 * Handler: create-user
 * Creates a new user (manager or supervisor) with temporary password
 * Security: Only MANAGER role can create users
 */
ipcMain.handle('create-user', async (_event, data: {
  email: string;
  name: string;
  role: 'MANAGER' | 'SUPERVISOR';
  requesterId: string; // Who is making this request
}) => {
  try {
    // Validate requester has MANAGER role
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return {
        success: false,
        error: 'Access Denied: Only managers can create users',
        code: 'UNAUTHORIZED',
      };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS',
      };
    }

    // Generate temporary password (8 chars)
    const tempPassword = generateTempPassword();

    // Note: In production, hash the password with bcryptjs
    // For now, we'll store it as-is. Update this with bcryptjs.hash()
    const hashedPassword = tempPassword; // TODO: Hash with bcryptjs

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        action: 'CREATE_USER',
        userId: data.requesterId,
        metadata: JSON.stringify({ newUserId: user.id, role: data.role }),
        description: `Created ${data.role} user: ${data.email}`,
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tempPassword, // Send to admin for communication
      },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user',
      code: 'DATABASE_ERROR',
    };
  }
});

/**
 * Handler: reset-user-password
 * Generates new temporary password for a user
 * Security: Only MANAGER can reset passwords
 */
ipcMain.handle('reset-user-password', async (_event, data: {
  userId: string;
  requesterId: string;
}) => {
  try {
    // Validate requester
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Generate new temp password
    const tempPassword = generateTempPassword();
    const hashedPassword = tempPassword; // TODO: Hash with bcryptjs

    await prisma.user.update({
      where: { id: data.userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      tempPassword,
      email: targetUser.email,
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: 'Failed to reset password' };
  }
});

/**
 * Handler: delete-user
 * Deletes a user
 * Security: Prevents deleting the last MANAGER
 */
ipcMain.handle('delete-user', async (_event, data: {
  userId: string;
  requesterId: string;
}) => {
  try {
    // Validate requester is MANAGER
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Prevent deleting last manager
    if (targetUser.role === 'MANAGER') {
      const managerCount = await prisma.user.count({
        where: { role: 'MANAGER' },
      });

      if (managerCount <= 1) {
        return {
          success: false,
          error: 'Cannot delete the last manager',
          code: 'LAST_MANAGER',
        };
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: data.userId },
    });

    // Log the action
    await prisma.log.create({
      data: {
        action: 'DELETE_USER',
        userId: data.requesterId,
        metadata: JSON.stringify({ deletedUserId: data.userId }),
        description: `Deleted user: ${targetUser.email}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
});

// ============================================
// IPC HANDLERS - STUDENT MANAGEMENT
// ============================================

/**
 * Handler: add-student
 * Creates a new student record
 */
ipcMain.handle('add-student', async (_event, studentData) => {
  try {
    const student = await prisma.student.create({
      data: {
        registrationNumber: studentData.registrationNumber,
        nationalId: studentData.nationalId,
        nameAr: studentData.nameAr,
        nameEn: studentData.nameEn,
        email: studentData.email,
        phone: studentData.phone || null,
        academicYear: studentData.academicYear,
        university: studentData.university,
        roomType: studentData.roomType,
        roomNumber: studentData.roomNumber || null,
        photoPath: studentData.photoPath || null,
      },
    });

    return { success: true, data: student };
  } catch (error) {
    console.error('Error adding student:', error);
    return { success: false, error: 'Failed to add student' };
  }
});

/**
 * Handler: get-student
 * Retrieves a single student by ID
 */
ipcMain.handle('get-student', async (_event, { id }: { id: string }) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    return { success: true, data: student };
  } catch (error) {
    console.error('Error fetching student:', error);
    return { success: false, error: 'Failed to fetch student' };
  }
});

/**
 * Handler: update-student
 * Updates an existing student record
 */
ipcMain.handle('update-student', async (_event, studentData) => {
  try {
    const student = await prisma.student.update({
      where: { id: studentData.id },
      data: {
        nameAr: studentData.nameAr,
        nameEn: studentData.nameEn,
        email: studentData.email,
        phone: studentData.phone,
        academicYear: studentData.academicYear,
        roomNumber: studentData.roomNumber,
        photoPath: studentData.photoPath,
        hasMissingData: studentData.hasMissingData,
        missingFields: studentData.missingFields,
      },
    });

    return { success: true, data: student };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'Failed to update student' };
  }
});

/**
 * Handler: delete-student (via request workflow)
 * Creates a deletion request for approval
 */
ipcMain.handle('request-delete-student', async (_event, data: {
  studentId: string;
  requesterId: string;
}) => {
  try {
    const request = await prisma.request.create({
      data: {
        type: 'DELETE_STUDENT',
        status: 'PENDING',
        studentId: data.studentId,
        requesterId: data.requesterId,
        metadata: JSON.stringify({ studentId: data.studentId }),
      },
    });

    // TODO: Create notifications for all managers

    return { success: true, data: request };
  } catch (error) {
    console.error('Error creating deletion request:', error);
    return { success: false, error: 'Failed to create request' };
  }
});

/**
 * Handler: get-students
 * Retrieves all students with optional filtering
 */
ipcMain.handle('get-students', async (_event, filters: any = {}) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        status: filters.status || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.skip || 0,
    });

    const total = await prisma.student.count();

    return { success: true, data: students, total };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
});

// ============================================
// IPC HANDLERS - REQUEST MANAGEMENT
// ============================================

/**
 * Handler: get-requests
 * Retrieves all requests with optional filtering
 */
ipcMain.handle('get-requests', async (_event, filters: any = {}) => {
  try {
    const requests = await prisma.request.findMany({
      where: {
        status: filters.status || undefined,
        type: filters.type || undefined,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            registrationNumber: true,
            roomNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.skip || 0,
    });

    const total = await prisma.request.count();

    return { success: true, data: requests, total };
  } catch (error) {
    console.error('Error fetching requests:', error);
    return { success: false, error: 'Failed to fetch requests' };
  }
});

/**
 * Handler: create-request
 * Creates a new request
 */
ipcMain.handle('create-request', async (_event, data: {
  type: 'DELETE_STUDENT' | 'ROOM_CHANGE' | 'MAINTENANCE' | 'CLEARANCE' | 'OTHER';
  studentId?: string;
  description: string;
  requesterId: string;
}) => {
  try {
    // Validate requester exists
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester) {
      return {
        success: false,
        error: 'Requester not found',
        code: 'REQUESTER_NOT_FOUND',
      };
    }

    // If student ID is provided, validate student exists
    if (data.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: data.studentId },
      });

      if (!student) {
        return {
          success: false,
          error: 'Student not found',
          code: 'STUDENT_NOT_FOUND',
        };
      }
    }

    // Create request with metadata
    const metadata = {
      description: data.description,
      studentId: data.studentId,
    };

    const request = await prisma.request.create({
      data: {
        type: data.type,
        status: 'PENDING',
        studentId: data.studentId,
        requesterId: data.requesterId,
        metadata: JSON.stringify(metadata),
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            registrationNumber: true,
            roomNumber: true,
          },
        },
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        action: 'CREATE_REQUEST',
        userId: data.requesterId,
        metadata: JSON.stringify({ 
          requestId: request.id, 
          type: data.type,
          studentId: data.studentId 
        }),
        description: `Created ${data.type} request`,
      },
    });

    // TODO: Create notifications for all managers

    return { success: true, data: request };
  } catch (error) {
    console.error('Error creating request:', error);
    return { success: false, error: 'Failed to create request' };
  }
});

/**
 * Handler: update-request-status
 * Updates request status (APPROVE/REJECT) with workflow automation
 */
ipcMain.handle('update-request-status', async (_event, data: {
  requestId: string;
  status: 'APPROVED' | 'REJECTED';
  resolverId: string;
  rejectionReason?: string;
}) => {
  try {
    // Validate resolver exists
    const resolver = await prisma.user.findUnique({
      where: { id: data.resolverId },
    });

    if (!resolver) {
      return {
        success: false,
        error: 'Resolver not found',
        code: 'RESOLVER_NOT_FOUND',
      };
    }

    // Get the request
    const request = await prisma.request.findUnique({
      where: { id: data.requestId },
      include: {
        student: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: 'Request not found',
        code: 'REQUEST_NOT_FOUND',
      };
    }

    if (request.status !== 'PENDING') {
      return {
        success: false,
        error: 'Request has already been resolved',
        code: 'ALREADY_RESOLVED',
      };
    }

    // Update request status
    const updatedRequest = await prisma.request.update({
      where: { id: data.requestId },
      data: {
        status: data.status,
        resolverId: data.resolverId,
        resolvedAt: new Date(),
        rejectionReason: data.rejectionReason,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            registrationNumber: true,
            roomNumber: true,
          },
        },
      },
    });

    // Workflow automation for CLEARANCE requests
    if (request.type === 'CLEARANCE' && data.status === 'APPROVED' && request.student) {
      try {
        // Get student's current room
        const currentRoomNumber = request.student.roomNumber;
        
        if (currentRoomNumber) {
          // Find the room
          const room = await prisma.room.findUnique({
            where: { roomNumber: currentRoomNumber },
          });

          if (room) {
            // Update room count
            const newCurrentCount = Math.max(0, room.currentCount - 1);
            const newIsOccupied = newCurrentCount >= room.capacity;

            await prisma.room.update({
              where: { id: room.id },
              data: {
                currentCount: newCurrentCount,
                isOccupied: newIsOccupied,
              },
            });
          }
        }

        // Unassign student from room
        await prisma.student.update({
          where: { id: request.student.id },
          data: {
            roomNumber: null,
            checkInDate: null,
          },
        });

        // Log the clearance action
        await prisma.log.create({
          data: {
            action: 'APPROVE_REQUEST',
            userId: data.resolverId,
            metadata: JSON.stringify({ 
              requestId: request.id,
              type: 'CLEARANCE',
              studentId: request.student.id,
              roomNumber: currentRoomNumber,
            }),
            description: `Approved clearance request - Student ${request.student.nameAr} unassigned from room ${currentRoomNumber}`,
          },
        });

      } catch (workflowError) {
        console.error('Error in clearance workflow:', workflowError);
        // Don't fail the request update, but log the error
      }
    } else {
      // Log regular approval/rejection
      await prisma.log.create({
        data: {
          action: data.status === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
          userId: data.resolverId,
          metadata: JSON.stringify({ 
            requestId: request.id,
            type: request.type,
            studentId: request.studentId,
          }),
          description: `${data.status === 'APPROVED' ? 'Approved' : 'Rejected'} ${request.type} request`,
        },
      });
    }

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error updating request status:', error);
    return { success: false, error: 'Failed to update request status' };
  }
});

// ============================================
// IPC HANDLERS - SYSTEM ADMINISTRATION
// ============================================

/**
 * Handler: get-logs
 * Retrieves system logs with pagination and filtering
 */
ipcMain.handle('get-logs', async (_event, filters: any = {}) => {
  try {
    const logs = await prisma.log.findMany({
      where: {
        action: filters.action || undefined,
        userId: filters.userId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.skip || 0,
    });

    const total = await prisma.log.count();

    return { success: true, data: logs, total };
  } catch (error) {
    console.error('Error fetching logs:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
});

/**
 * Handler: get-users
 * Retrieves all system users (MANAGER only)
 */
ipcMain.handle('get-users', async (_event, data: { requesterId: string }) => {
  try {
    // Validate requester has MANAGER role
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return {
        success: false,
        error: 'Access Denied: Only managers can view users',
        code: 'UNAUTHORIZED',
      };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
});

/**
 * Handler: update-user
 * Updates an existing user (MANAGER only)
 */
ipcMain.handle('update-user', async (_event, data: {
  userId: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'SUPERVISOR';
  isActive: boolean;
  requesterId: string;
}) => {
  try {
    // Validate requester has MANAGER role
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return {
        success: false,
        error: 'Access Denied: Only managers can update users',
        code: 'UNAUTHORIZED',
      };
    }

    // Prevent user from deactivating themselves
    if (data.userId === data.requesterId && !data.isActive) {
      return {
        success: false,
        error: 'Cannot deactivate your own account',
        code: 'SELF_DEACTIVATION',
      };
    }

    // Check if email already exists (for other users)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: data.userId },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS',
      };
    }

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        action: 'UPDATE_USER',
        userId: data.requesterId,
        metadata: JSON.stringify({ 
          updatedUserId: user.id, 
          role: data.role,
          isActive: data.isActive 
        }),
        description: `Updated user: ${data.email}`,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
});

/**
 * Handler: backup-database
 * Creates a backup of the SQLite database (MANAGER only)
 */
ipcMain.handle('backup-database', async (_event, data: { requesterId: string }) => {
  try {
    // Validate requester has MANAGER role
    const requester = await prisma.user.findUnique({
      where: { id: data.requesterId },
    });

    if (!requester || requester.role !== 'MANAGER') {
      return {
        success: false,
        error: 'Access Denied: Only managers can backup database',
        code: 'UNAUTHORIZED',
      };
    }

    // Get database path
    const dbPath = join(app.getPath('userData'), 'database', 'app.db');
    
    if (!fs.existsSync(dbPath)) {
      return {
        success: false,
        error: 'Database file not found',
        code: 'DB_NOT_FOUND',
      };
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `housing_backup_${timestamp}.db`;
    
    // Return backup info for the frontend to handle file save dialog
    return {
      success: true,
      data: {
        sourcePath: dbPath,
        suggestedFileName: backupFileName,
      },
    };
  } catch (error) {
    console.error('Error preparing backup:', error);
    return { success: false, error: 'Failed to prepare backup' };
  }
});

// ============================================
// IPC HANDLERS - IMAGE HANDLING
// ============================================

/**
 * Handler: save-student-image
 * Saves student photo to userData directory
 * Returns relative path for storage in database
 */
ipcMain.handle('save-student-image', async (_event, data: {
  tempFilePath: string;
  registrationNumber: string;
}) => {
  try {
    const photoDir = join(app.getPath('userData'), 'student_photos');

    // Create directory if it doesn't exist
    if (!fs.existsSync(photoDir)) {
      fs.mkdirSync(photoDir, { recursive: true });
    }

    // Get file extension
    const ext = path.extname(data.tempFilePath);
    const destFileName = `${data.registrationNumber}${ext}`;
    const destPath = join(photoDir, destFileName);

    // Copy file to destination
    fs.copyFileSync(data.tempFilePath, destPath);

    // Return relative path for storage
    const relativePath = `student_photos/${destFileName}`;

    return {
      success: true,
      path: relativePath,
    };
  } catch (error) {
    console.error('Error saving student image:', error);
    return {
      success: false,
      error: 'Failed to save image',
    };
  }
});

/**
 * Handler: get-photo
 * Retrieves photo URL from relative path
 */
ipcMain.handle('get-photo', async (_event, { relativePath }: { relativePath: string }) => {
  try {
    if (!relativePath) {
      return { success: false, error: 'No path provided' };
    }

    // Construct app:// URL
    const photoUrl = `app://${relativePath}`;

    return { success: true, url: photoUrl };
  } catch (error) {
    console.error('Error getting photo:', error);
    return { success: false, error: 'Failed to get photo' };
  }
});

// ============================================
// IPC HANDLERS - NOTIFICATIONS
// ============================================

/**
 * Handler: get-notifications
 * Retrieves user's unread notifications
 */
ipcMain.handle('get-notifications', async (_event, { userId }: { userId: string }) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
});

/**
 * Handler: mark-notification-read
 */
ipcMain.handle('mark-notification-read', async (_event, { notificationId }: { notificationId: string }) => {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to update notification' };
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a random temporary password (8 characters)
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Handle app closure
app.on('before-quit', async () => {
  await prisma.$disconnect();
});
