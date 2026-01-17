import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddStudentPage } from './pages/AddStudentPage';
import { SearchStudentPage } from './pages/SearchStudentPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { BrowseStudentsPage } from './pages/BrowseStudentsPage';
import { RoomSearchPage } from './pages/RoomSearchPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/add-student"
          element={
            <Layout>
              <AddStudentPage />
            </Layout>
          }
        />
        <Route
          path="/search-student"
          element={
            <Layout>
              <SearchStudentPage />
            </Layout>
          }
        />
        <Route
          path="/student/:id"
          element={
            <Layout>
              <StudentProfilePage />
            </Layout>
          }
        />
        <Route
          path="/browse-students"
          element={
            <Layout>
              <BrowseStudentsPage />
            </Layout>
          }
        />
        <Route
          path="/room-search"
          element={
            <Layout>
              <RoomSearchPage />
            </Layout>
          }
        />
        <Route
          path="/logs"
          element={
            <Layout>
              <LogsPage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsPage />
            </Layout>
          }
        />

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
