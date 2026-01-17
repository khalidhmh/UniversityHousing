/**
 * Settings Page Component - Phase 7
 * System settings and maintenance page
 * Features: Database backup, system maintenance options
 */

import React, { useState } from 'react';
import { Settings, Download, AlertCircle, CheckCircle, Clock, Shield, Database } from 'lucide-react';

// Type definitions
interface SettingsPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
  };
}

/**
 * Settings Page Component */
export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [backupMessage, setBackupMessage] = useState('');

  // Handle database backup
  const handleBackup = async () => {
    if (!user || user.role !== 'MANAGER') {
      setBackupStatus('error');
      setBackupMessage('Only managers can create database backups');
      return;
    }

    setIsBackingUp(true);
    setBackupStatus('idle');
    setBackupMessage('');

    try {
      // Call backup API
      const result = await window.electron.backupDatabase({ requesterId: user.id });

      if (result.success && result.data) {
        // Use Electron's dialog to save the file
        const { dialog } = require('@electron/remote');
        const { writeFile } = require('fs').promises;
        const path = require('path');

        const saveResult = await dialog.showSaveDialog({
          title: 'Save Database Backup',
          defaultPath: result.data.suggestedFileName,
          filters: [
            { name: 'Database Files', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });

        if (saveResult.canceled || !saveResult.filePath) {
          setBackupStatus('idle');
          setBackupMessage('Backup cancelled');
          return;
        }

        // Copy the database file to the selected location
        const fs = require('fs');
        fs.copyFileSync(result.data.sourcePath, saveResult.filePath);

        setBackupStatus('success');
        setBackupMessage(`Backup saved successfully to ${saveResult.filePath}`);
      } else {
        setBackupStatus('error');
        setBackupMessage(result.error || 'Failed to prepare backup');
      }
    } catch (error) {
      console.error('Backup error:', error);
      setBackupStatus('error');
      setBackupMessage('An error occurred during backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Get system info
  const getSystemInfo = () => {
    const info = [
      { label: 'User Role', value: user?.role || 'Unknown' },
      { label: 'User Email', value: user?.email || 'Unknown' },
      { label: 'Application', value: 'University Housing Management' },
      { label: 'Database', value: 'SQLite' },
      { label: 'Last Backup', value: 'Never' },
    ];
    return info;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#003366]">
            <Settings className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">Settings</h1>
            <p className="text-gray-600">System settings and maintenance</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <Shield size={20} />
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getSystemInfo().map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
              <span className="text-sm text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <Database size={20} />
          System Maintenance
        </h2>
        
        <div className="space-y-4">
          {/* Backup Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Database Backup</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create a backup of the entire database. This includes all students, rooms, requests, and system logs.
                  Backups should be stored regularly for data safety.
                </p>
                
                {/* Backup Status */}
                {backupMessage && (
                  <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                    backupStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {backupStatus === 'success' ? (
                      <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{backupMessage}</span>
                  </div>
                )}

                {/* Backup Button */}
                <div className="mt-4">
                  <button
                    onClick={handleBackup}
                    disabled={isBackingUp || (user?.role !== 'MANAGER')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isBackingUp || (user?.role !== 'MANAGER')
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#003366] text-white hover:bg-[#002855]'
                    }`}
                  >
                    {isBackingUp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Create Backup
                      </>
                    )}
                  </button>
                  {user?.role !== 'MANAGER' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Only managers can create database backups
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Other Maintenance Options */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">System Logs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View and monitor system activity logs. Track user actions, system events, and audit trails.
                </p>
                <div className="mt-4">
                  <a
                    href="/logs"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock size={16} />
                    View Logs
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">System Health</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor system performance and database status.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database Connection</span>
                    <span className="text-sm font-medium text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Storage Usage</span>
                    <span className="text-sm font-medium text-gray-900">Normal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Sync</span>
                    <span className="text-sm font-medium text-gray-900">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-[#003366] mb-4">Help & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Access user guides and system documentation.
            </p>
            <button className="text-sm text-[#003366] hover:text-[#002855] font-medium">
              View Documentation →
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get help from the system administrator.
            </p>
            <button className="text-sm text-[#003366] hover:text-[#002855] font-medium">
              Contact Admin →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
