/**
 * Dashboard Page - Phase 4
 * Displays key statistics and metrics for the housing system
 * Shows: Total Students, Total Rooms, Occupied Rooms, Available Rooms
 */

import React, { useState } from 'react';
import { Users, Home, CheckCircle, Bed } from 'lucide-react';
import { useIPCEffect } from '../../app/hooks/useIPC';
import type { DashboardStats } from '../../preload/index.d';

/**
 * Stat Card Component
 * Displays a single statistic with icon and value
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'navy' | 'gold' | 'green' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    navy: 'border-[#003366] bg-[#003366]/10',
    gold: 'border-[#D4AF37] bg-[#D4AF37]/10',
    green: 'border-green-600 bg-green-50',
    blue: 'border-blue-600 bg-blue-50',
  };

  const iconColorClasses: Record<string, string> = {
    navy: 'text-[#003366]',
    gold: 'text-[#D4AF37]',
    green: 'text-green-600',
    blue: 'text-blue-600',
  };

  return (
    <div
      className={`
        flex flex-col gap-3 p-6 rounded-lg border-2
        ${colorClasses[color]}
        transition-all hover:shadow-lg
      `}
    >
      <div className="flex items-center justify-between">
        <span className={`text-gray-600 text-sm font-medium`}>{label}</span>
        <div className={`${iconColorClasses[color]} p-2 bg-white rounded-lg`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold ${iconColorClasses[color]}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

/**
 * Dashboard Page Component
 * Main dashboard view showing system statistics and overview
 */
export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics on component mount
  useIPCEffect(
    () => window.electron.getDashboardStats(),
    (result) => {
      if (result.success && result.data) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load dashboard statistics');
        setStats(null);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    }
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366] mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome! Here's an overview of your housing management system.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !stats && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin" />
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students */}
          <StatCard
            icon={<Users />}
            label="Total Students"
            value={stats.totalStudents}
            color="navy"
          />

          {/* Total Rooms */}
          <StatCard
            icon={<Home />}
            label="Total Rooms"
            value={stats.totalRooms}
            color="gold"
          />

          {/* Occupied Rooms */}
          <StatCard
            icon={<CheckCircle />}
            label="Occupied Rooms"
            value={stats.occupiedRooms}
            color="green"
          />

          {/* Available Rooms */}
          <StatCard
            icon={<Bed />}
            label="Available Rooms"
            value={stats.availableRooms}
            color="blue"
          />
        </div>
      )}

      {/* Quick Stats Footer */}
      {stats && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-[#003366] mb-4">
            Quick Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Occupancy Rate</p>
              <p className="text-xl font-bold text-[#003366]">
                {stats.totalRooms > 0
                  ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-gray-600">Avg Students per Room</p>
              <p className="text-xl font-bold text-[#003366]">
                {stats.occupiedRooms > 0
                  ? (stats.totalStudents / stats.occupiedRooms).toFixed(1)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Available Capacity</p>
              <p className="text-xl font-bold text-[#D4AF37]">
                {stats.availableRooms}/{stats.totalRooms}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
