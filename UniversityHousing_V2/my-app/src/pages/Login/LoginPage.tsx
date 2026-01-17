/**
 * Login Page
 *
 * Professional login screen with University Housing Management System branding
 * Features:
 * - Email and password inputs
 * - Form validation
 * - Error handling and display
 * - Loading state with spinner
 * - Responsive design for all screen sizes
 *
 * Color Palette:
 * - Primary: #003366 (Dark Navy Blue)
 * - Accent: #D4AF37 (Gold)
 * - Background: White
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Loader } from 'lucide-react';

// Import auth context from context directory
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading, error, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // ============================================
  // REDIRECT IF ALREADY LOGGED IN
  // ============================================

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ============================================
  // FORM VALIDATION
  // ============================================

  const validateForm = (): boolean => {
    setFormError('');

    if (!email.trim()) {
      setFormError('البريد الإلكتروني مطلوب');
      return false;
    }

    if (!email.includes('@')) {
      setFormError('البريد الإلكتروني غير صحيح');
      return false;
    }

    if (!password) {
      setFormError('كلمة المرور مطلوبة');
      return false;
    }

    if (password.length < 6) {
      setFormError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    return true;
  };

  // ============================================
  // HANDLE LOGIN SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await login(email, password);

    if (result) {
      // Success - redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setFormError('');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* Logo Icon */}
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#003366' }}
          >
            <LogIn size={32} className="text-white" />
          </div>

          {/* Title */}
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: '#003366' }}
          >
            نظام إدارة السكن
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm">
            نظام إدارة السكن الجامعي - جامعة الملك عبدالعزيز
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message - Auth Error */}
            {error && (
              <div
                className="rounded-md bg-red-50 border border-red-200 p-4 flex gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Error Message - Form Validation Error */}
            {formError && (
              <div
                className="rounded-md bg-red-50 border border-red-200 p-4 flex gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ color: '#003366' }}
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="example@university.edu.sa"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                style={{
                  outlineColor: '#003366',
                  outlineStyle: 'solid',
                  outlineWidth: '2px',
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ color: '#003366' }}
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                style={{
                  outlineColor: '#003366',
                  outlineStyle: 'solid',
                  outlineWidth: '2px',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg font-semibold text-white transition duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-lg"
              style={{
                backgroundColor: loading ? '#003366' : '#003366',
                opacity: loading ? 0.9 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#002244';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#003366';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>دخول</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">بيانات الاختبار (Demo):</p>
            <p>البريد: manager@test.com</p>
            <p>كلمة المرور: password123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          <p>© 2026 جامعة الملك عبدالعزيز - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
