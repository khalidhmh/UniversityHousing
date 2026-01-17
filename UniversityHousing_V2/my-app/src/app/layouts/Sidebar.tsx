/**
 * Sidebar Component
 * 
 * University Housing Management System - Main Navigation
 * Features:
 * - Responsive design with collapsible state
 * - Role-based menu visibility (MANAGER vs SUPERVISOR)
 * - Professional styling from Figma design
 * - Arabic RTL support
 * - Icon-based navigation
 * 
 * Color Palette (from Figma design):
 * - Primary: #003366 (Dark Navy Blue)
 * - Accent: #D4AF37 (Gold)
 * - Background: White
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Search,
  UserPlus,
  DoorOpen,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Clock,
  UserCog,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
  };
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Menu items - filterable by role
  const allMenuItems = [
    { id: 'dashboard', path: '/dashboard', icon: Home, label: 'لوحة التحكم', roles: ['MANAGER', 'SUPERVISOR'] },
    { id: 'students', path: '/students', icon: Users, label: 'إدارة الطلاب', roles: ['MANAGER', 'SUPERVISOR'] },
    { id: 'rooms', path: '/rooms', icon: DoorOpen, label: 'إدارة الغرف', roles: ['MANAGER', 'SUPERVISOR'] },
    { id: 'requests', path: '/requests', icon: FileText, label: 'الطلبات', roles: ['MANAGER', 'SUPERVISOR'] },
    { id: 'logs', path: '/logs', icon: Clock, label: 'سجل النشاطات', roles: ['MANAGER', 'SUPERVISOR'] },
    { id: 'users', path: '/users', icon: UserCog, label: 'المستخدمين', roles: ['MANAGER'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-white transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        'border-l border-gray-200 shadow-lg',
        'rtl:border-r rtl:border-l-0',
      )}
      dir="rtl"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003366]">
              <Shield className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-[#003366]">الإدارة</h2>
              <p className="truncate text-xs text-gray-500">نظام السكن</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'rounded-lg p-2 transition-colors hover:bg-gray-100',
            isCollapsed && 'mx-auto',
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info Section */}
      {user && !isCollapsed && (
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]">
              <span className="text-xs font-bold text-[#003366]">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-2 rounded-md bg-gray-50 px-2 py-1">
            <p className="text-xs font-medium text-gray-600">
              {user.role === 'MANAGER' ? '👨‍💼 مدير النظام' : '👤 مشرف'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                active
                  ? 'bg-[#003366] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100',
                isCollapsed && 'justify-center',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  active && 'text-[#D4AF37]',
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute right-0 top-0 h-full w-1 rounded-l-lg bg-[#D4AF37]" />
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="pointer-events-none absolute right-full mr-2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 rtl:right-auto rtl:left-full rtl:ml-2 rtl:mr-0">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Settings & Logout */}
      <div className="space-y-1 px-3 py-3">
        {!isCollapsed && (
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              'text-red-600 hover:bg-red-50 transition-colors',
              isCollapsed && 'justify-center',
            )}
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={onLogout}
            title="Logout"
            className="mx-auto block rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Footer Info (collapsed only) */}
      {isCollapsed && (
        <div className="border-t border-gray-200 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">v1.0</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
