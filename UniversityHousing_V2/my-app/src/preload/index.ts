/**
 * Preload Script for Electron Security
 *
 * This script runs in a privileged context before the main process loads.
 * It exposes a secure API to the renderer process via contextBridge.
 *
 * SECURITY PRINCIPLES:
 * - Do NOT expose entire ipcRenderer (allows arbitrary IPC calls)
 * - Only expose specific, whitelisted methods
 * - All methods return Promise for async handling
 * - No direct file system access exposed
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Define the secure Electron API exposed to React
 * Each method corresponds to an ipcMain.handle() in the main process
 */
const electronAPI = {
  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Login with email and password
   * @param data - { email, password }
   * @returns Promise with { success, data: User, error?, code? }
   */
  login: (data: { email: string; password: string }) =>
    ipcRenderer.invoke('login', data),

  // ============================================
  // USER MANAGEMENT METHODS
  // ============================================

  /**
   * Create a new user (MANAGER role required)
   * @param data - { email, name, role, requesterId }
   * @returns Promise with { success, data|error, code? }
   */
  createUser: (data: {
    email: string;
    name: string;
    role: 'MANAGER' | 'SUPERVISOR';
    requesterId: string;
  }) => ipcRenderer.invoke('create-user', data),

  /**
   * Reset user password (MANAGER role required)
   * @param data - { userId, requesterId }
   * @returns Promise with { success, tempPassword, email }
   */
  resetUserPassword: (data: { userId: string; requesterId: string }) =>
    ipcRenderer.invoke('reset-user-password', data),

  /**
   * Delete a user (MANAGER role required, cannot delete last MANAGER)
   * @param data - { userId, requesterId }
   * @returns Promise with { success, error? }
   */
  deleteUser: (data: { userId: string; requesterId: string }) =>
    ipcRenderer.invoke('delete-user', data),

  // ============================================
  // STUDENT MANAGEMENT METHODS
  // ============================================

  /**
   * Create a new student record
   * @param studentData - Full student object with fields
   * @returns Promise with { success, data: Student }
   */
  addStudent: (studentData: any) => ipcRenderer.invoke('add-student', studentData),

  /**
   * Fetch a single student by ID
   * @param id - Student ID
   * @returns Promise with { success, data: Student, error? }
   */
  getStudent: (id: string) => ipcRenderer.invoke('get-student', { id }),

  /**
   * Update an existing student record
   * @param studentData - Student object with id + updates
   * @returns Promise with { success, data: Student }
   */
  updateStudent: (studentData: any) =>
    ipcRenderer.invoke('update-student', studentData),

  /**
   * Create a deletion request (requires manager approval)
   * @param data - { studentId, requesterId }
   * @returns Promise with { success, data: Request }
   */
  requestDeleteStudent: (data: { studentId: string; requesterId: string }) =>
    ipcRenderer.invoke('request-delete-student', data),

  /**
   * Fetch multiple students with filtering
   * @param filters - { limit?, skip?, status? }
   * @returns Promise with { success, data: Student[], total }
   */
  getStudents: (filters?: { limit?: number; skip?: number; status?: string }) =>
    ipcRenderer.invoke('get-students', filters || {}),

  // ============================================
  // IMAGE HANDLING METHODS
  // ============================================

  /**
   * Save student photo to local storage
   * @param data - { tempFilePath, registrationNumber }
   * @returns Promise with { success, path: relative_path, error? }
   */
  saveStudentImage: (data: { tempFilePath: string; registrationNumber: string }) =>
    ipcRenderer.invoke('save-student-image', data),

  /**
   * Get photo URL from relative path
   * @param relativePath - Path like "student_photos/2024001.jpg"
   * @returns Promise with { success, url: app://..., error? }
   */
  getPhoto: (relativePath: string) =>
    ipcRenderer.invoke('get-photo', { relativePath }),

  // ============================================
  // DASHBOARD METHODS
  // ============================================

  /**
   * Fetch dashboard statistics
   * @returns Promise with { success, data: { totalStudents, totalRooms, occupiedRooms, availableRooms } }
   */
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),

  // ============================================
  // ROOM MANAGEMENT METHODS
  // ============================================

  /**
   * Fetch all rooms with optional filtering
   * @param filters - { status?: 'AVAILABLE' | 'OCCUPIED' }
   * @returns Promise with { success, data: { data: Room[], total: number } }
   */
  getRooms: (filters?: { status?: string }) =>
    ipcRenderer.invoke('get-rooms', filters || {}),

  /**
   * Create a new room
   * @param roomData - { roomNumber, floor, capacity, roomType }
   * @returns Promise with { success, data: Room }
   */
  createRoom: (roomData: any) =>
    ipcRenderer.invoke('create-room', roomData),

  /**
   * Update an existing room
   * @param roomData - { id, ...updates }
   * @returns Promise with { success, data: Room }
   */
  updateRoom: (roomData: any) =>
    ipcRenderer.invoke('update-room', roomData),

  /**
   * Delete a room (must be empty)
   * @param roomId - Room ID to delete
   * @returns Promise with { success }
   */
  deleteRoom: (roomId: string) =>
    ipcRenderer.invoke('delete-room', { roomId }),

  /**
   * Get rooms with available capacity for student assignment
   * @param roomType - Optional room type filter (STANDARD | PREMIUM)
   * @returns Promise with { success, data: Room[] }
   */
  getAvailableRooms: (roomType?: string) =>
    ipcRenderer.invoke('get-available-rooms', roomType),

  /**
   * Assign a student to a room with capacity checking
   * @param data - { studentId, roomId }
   * @returns Promise with { success, data: { student, room } }
   */
  assignStudentToRoom: (data: { studentId: string; roomId: string }) =>
    ipcRenderer.invoke('assign-student-to-room', data),

  /**
   * Unassign a student from their current room
   * @param studentId - Student ID
   * @returns Promise with { success, data: { student, room } }
   */
  unassignStudentFromRoom: (studentId: string) =>
    ipcRenderer.invoke('unassign-student-from-room', { studentId }),

  // ============================================
  // REQUEST MANAGEMENT METHODS
  // ============================================

  /**
   * Fetch all requests with optional filtering
   * @param filters - { status?, type?, limit?, skip? }
   * @returns Promise with { success, data: Request[], total }
   */
  getRequests: (filters?: { 
    status?: string; 
    type?: string; 
    limit?: number; 
    skip?: number; 
  }) => ipcRenderer.invoke('get-requests', filters || {}),

  /**
   * Create a new request
   * @param data - { type, studentId?, description, requesterId }
   * @returns Promise with { success, data: Request }
   */
  createRequest: (data: {
    type: 'DELETE_STUDENT' | 'ROOM_CHANGE' | 'MAINTENANCE' | 'CLEARANCE' | 'OTHER';
    studentId?: string;
    description: string;
    requesterId: string;
  }) => ipcRenderer.invoke('create-request', data),

  /**
   * Update request status (approve/reject)
   * @param data - { requestId, status, resolverId, rejectionReason? }
   * @returns Promise with { success, data: Request }
   */
  updateRequestStatus: (data: {
    requestId: string;
    status: 'APPROVED' | 'REJECTED';
    resolverId: string;
    rejectionReason?: string;
  }) => ipcRenderer.invoke('update-request-status', data),

  // ============================================
  // SYSTEM ADMINISTRATION METHODS
  // ============================================

  /**
   * Fetch system logs with pagination and filtering
   * @param filters - { action?, userId?, limit?, skip? }
   * @returns Promise with { success, data: Log[], total }
   */
  getLogs: (filters?: { 
    action?: string; 
    userId?: string; 
    limit?: number; 
    skip?: number; 
  }) => ipcRenderer.invoke('get-logs', filters || {}),

  /**
   * Fetch all system users (MANAGER only)
   * @param data - { requesterId }
   * @returns Promise with { success, data: User[] }
   */
  getUsers: (data: { requesterId: string }) =>
    ipcRenderer.invoke('get-users', data),

  /**
   * Update an existing user (MANAGER only)
   * @param data - { userId, name, email, role, isActive, requesterId }
   * @returns Promise with { success, data: User }
   */
  updateUser: (data: {
    userId: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
    isActive: boolean;
    requesterId: string;
  }) => ipcRenderer.invoke('update-user', data),

  /**
   * Create backup of the SQLite database (MANAGER only)
   * @param data - { requesterId }
   * @returns Promise with { success, data: { sourcePath, suggestedFileName } }
   */
  backupDatabase: (data: { requesterId: string }) =>
    ipcRenderer.invoke('backup-database', data),

  // ============================================
  // NOTIFICATION METHODS
  // ============================================

  /**
   * Fetch user's notifications
   * @param userId - User ID to fetch notifications for
   * @returns Promise with { success, data: Notification[] }
   */
  getNotifications: (userId: string) =>
    ipcRenderer.invoke('get-notifications', { userId }),

  /**
   * Mark notification as read
   * @param notificationId - Notification ID to mark as read
   * @returns Promise with { success }
   */
  markNotificationRead: (notificationId: string) =>
    ipcRenderer.invoke('mark-notification-read', { notificationId }),

  // ============================================
  // EVENT LISTENERS (One-way communication from main to renderer)
  // ============================================

  /**
   * Listen for events from main process
   * Usage: window.electron.on('event-name', (data) => { ... })
   */
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },

  /**
   * Remove event listener
   * Usage: window.electron.off('event-name', callback)
   */
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  },

  /**
   * Listen for event once only
   * Usage: window.electron.once('event-name', (data) => { ... })
   */
  once: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.once(channel, callback);
  },
};

// Expose the secure API to the renderer process via contextBridge
// This creates window.electron with all the methods above
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
  } catch (error) {
    console.error('Failed to expose electron API via contextBridge:', error);
  }
} else {
  // Fallback for when context isolation is disabled (not recommended)
  // @ts-ignore
  window.electron = electronAPI;
}

export type ElectronAPI = typeof electronAPI;
