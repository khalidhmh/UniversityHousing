/**
 * Type definitions for the Electron IPC API exposed via contextBridge
 * This file extends the Window interface so TypeScript recognizes window.electron
 */

import type { IpcRendererEvent } from 'electron';

// ============================================
// IPC RESPONSE TYPES
// ============================================

interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'SUPERVISOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  registrationNumber: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone?: string;
  academicYear: number;
  university: 'GOVERNMENT' | 'PRIVATE';
  roomType: 'STANDARD' | 'PREMIUM';
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  photoPath?: string;
  hasMissingData: boolean;
  missingFields?: string;
  roomNumber?: string;
  checkInDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Request {
  id: string;
  type: 'DELETE_STUDENT' | 'ROOM_CHANGE' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  studentId?: string;
  metadata: string; // JSON
  requesterId: string;
  resolverId?: string;
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: 'STANDARD' | 'PREMIUM';
  isOccupied: boolean;
  currentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

// ============================================
// ELECTRON API INTERFACE
// ============================================

interface ElectronAPI {
  // Authentication
  login(data: { email: string; password: string }): Promise<IpcResponse<User>>;

  // User Management
  createUser(data: {
    email: string;
    name: string;
    role: 'MANAGER' | 'SUPERVISOR';
    requesterId: string;
  }): Promise<IpcResponse<User>>;

  resetUserPassword(data: {
    userId: string;
    requesterId: string;
  }): Promise<IpcResponse<{ tempPassword: string; email: string }>>;

  deleteUser(data: {
    userId: string;
    requesterId: string;
  }): Promise<IpcResponse>;

  // Student Management
  addStudent(studentData: Partial<Student>): Promise<IpcResponse<Student>>;

  getStudent(id: string): Promise<IpcResponse<Student>>;

  updateStudent(studentData: Partial<Student> & { id: string }): Promise<IpcResponse<Student>>;

  requestDeleteStudent(data: {
    studentId: string;
    requesterId: string;
  }): Promise<IpcResponse<Request>>;

  getStudents(filters?: {
    limit?: number;
    skip?: number;
    status?: string;
  }): Promise<IpcResponse<{ data: Student[]; total: number }>>;

  // Image Handling
  saveStudentImage(data: {
    tempFilePath: string;
    registrationNumber: string;
  }): Promise<IpcResponse<{ path: string }>>;

  getPhoto(relativePath: string): Promise<IpcResponse<{ url: string }>>;

  // Dashboard
  getDashboardStats(): Promise<IpcResponse<DashboardStats>>;

  // Room Management
  getRooms(filters?: { status?: string }): Promise<IpcResponse<{ data: Room[]; total: number }>>;

  createRoom(roomData: Partial<Room>): Promise<IpcResponse<Room>>;

  updateRoom(roomData: Partial<Room> & { id: string }): Promise<IpcResponse<Room>>;

  deleteRoom(roomId: string): Promise<IpcResponse>;

  getAvailableRooms(roomType?: string): Promise<IpcResponse<Room[]>>;

  assignStudentToRoom(data: { studentId: string; roomId: string }): Promise<IpcResponse<{ student: Student; room: Room; message: string }>>;

  unassignStudentFromRoom(studentId: string): Promise<IpcResponse<{ student: Student; room: Room; message: string }>>;

  // Notifications
  getNotifications(userId: string): Promise<IpcResponse<{ data: Notification[] }>>;

  markNotificationRead(notificationId: string): Promise<IpcResponse>;

  // Event Listeners
  on(
    channel: string,
    callback: (event: IpcRendererEvent, ...args: any[]) => void
  ): void;

  off(
    channel: string,
    callback: (event: IpcRendererEvent, ...args: any[]) => void
  ): void;

  once(
    channel: string,
    callback: (event: IpcRendererEvent, ...args: any[]) => void
  ): void;
}

// ============================================
// EXTEND GLOBAL WINDOW INTERFACE
// ============================================

declare global {
  interface Window {
    /**
     * Electron IPC API - Secure bridge to Electron main process
     * Exposed via contextBridge in preload script
     *
     * Usage:
     * ```typescript
     * const result = await window.electron.getStudents();
     * const response = await window.electron.addStudent({ nameAr: '...' });
     * ```
     */
    electron: ElectronAPI;
  }
}

export type { ElectronAPI, User, Student, Request, Notification, Room, DashboardStats, IpcResponse };
