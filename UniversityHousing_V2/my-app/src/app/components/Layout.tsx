import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  // TODO: Get user from auth context
  // For now, using a placeholder
  const user = {
    id: '1',
    name: 'مدير النظام',
    email: 'admin@housing.edu.sa',
    role: 'MANAGER' as const,
  };

  const handleLogout = () => {
    // TODO: Call logout IPC handler
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="bg-[#003366] text-white shadow-lg sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نظام إدارة سكن الطلاب</h1>
              <p className="text-sm text-gray-200">نظام متكامل لإدارة السكن الجامعي</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-200">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar with role-based menu items */}
        <Sidebar user={user} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

