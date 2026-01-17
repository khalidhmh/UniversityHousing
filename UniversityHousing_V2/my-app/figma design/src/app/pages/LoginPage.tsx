import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Lock, User } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for demo
    if (username && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/flagged/photo-1580408453889-ed5e1b51924a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920)',
      }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[#003366]/80"></div>
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            نظام إدارة السكن الجامعي
          </h1>
          <p className="text-gray-600">مرحباً بك، يرجى تسجيل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none transition-colors"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none transition-colors"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#003366] text-white py-4 rounded-xl hover:bg-[#004488] transition-colors shadow-lg hover:shadow-xl font-medium text-lg"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 نظام إدارة السكن الجامعي</p>
          <p>جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
