import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Search, UserPlus, DoorOpen, ClipboardList, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'لوحة التحكم' },
    { path: '/browse-students', icon: Users, label: 'تصفح الطلاب' },
    { path: '/search-student', icon: Search, label: 'بحث عن طالب' },
    { path: '/add-student', icon: UserPlus, label: 'إضافة طالب' },
    { path: '/room-search', icon: DoorOpen, label: 'بحث عن غرفة' },
    { path: '/logs', icon: ClipboardList, label: 'السجلات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="bg-[#003366] text-white shadow-lg sticky top-0 z-50">
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
              <p className="font-medium">مدير النظام</p>
              <p className="text-sm text-gray-200">admin@housing.edu.sa</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#004488] rounded-lg transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-80px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#003366] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
