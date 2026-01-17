import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { StudentsPage } from '../pages/Students/StudentsPage';
import { RoomsPage } from '../pages/Rooms/RoomsPage';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ============================================
// PROTECTED ROUTE WRAPPER
// ============================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}

// ============================================
// APP ROUTER COMPONENT
// ============================================

function AppRouter() {
  const { user } = useAuth();

  // If user is logged in and tries to access login page, redirect to dashboard
  if (user) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Students Management Route */}
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Rooms Management Route */}
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Layout>
                  <RoomsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root and unknown routes to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // User not logged in, show login page
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Redirect any other routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================
// APP COMPONENT (with Auth Provider)
// ============================================

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
