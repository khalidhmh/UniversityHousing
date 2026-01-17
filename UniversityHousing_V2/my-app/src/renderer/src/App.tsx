import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../../app/components/Layout';
import { LoginPage } from '../../app/pages/LoginPage';
import { DashboardPage } from '../../app/pages/DashboardPage';
import { BrowseStudentsPage } from '../../app/pages/BrowseStudentsPage';
import { RoomSearchPage } from '../../app/pages/RoomSearchPage';
import { SettingsPage } from '../../app/pages/SettingsPage';
import { AuthProvider, useAuth } from '../../context/AuthContext';

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ============================================
// MAIN APP COMPONENT
// ============================================

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/students" element={<BrowseStudentsPage />} />
                    <Route path="/rooms" element={<RoomSearchPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
