/**
 * Logs Page Component - Phase 7
 * Displays system logs with filtering and pagination
 * Features: Action type badges, user information, date formatting, search/filter
 */

import React, { useState, useMemo } from 'react';
import { Search, Clock, User, FileText, Users, Settings, AlertCircle, CheckCircle, XCircle, Trash2, Shield } from 'lucide-react';
import { useIPCEffect } from '../../app/hooks/useIPC';

// Type definitions
interface LogEntry {
  id: string;
  action: string;
  description: string;
  metadata?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
  };
}

interface LogsPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
  };
}

/**
 * Logs Page Component */
export const LogsPage: React.FC<LogsPageProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);

  // Fetch logs data
  const { data: logsData, loading: logsLoading } = useIPCEffect(
    () => {
      const filters: any = { limit: 100 };
      if (actionFilter !== 'ALL') {
        filters.action = actionFilter;
      }
      return window.electron.getLogs(filters);
    },
    (result: any) => {
      if (result.success && result.data) {
        setLogs(result.data);
        setTotal(result.total || result.data.length);
        setError(null);
      } else {
        setError(result.error || 'Failed to load logs');
        setLogs([]);
        setTotal(0);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    },
    [actionFilter]
  );

  // Get action type icon and color
  const getActionTypeDisplay = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return { icon: Shield, color: 'bg-blue-100 text-blue-800', label: 'Login' };
      case 'CREATE_STUDENT':
        return { icon: User, color: 'bg-green-100 text-green-800', label: 'Create Student' };
      case 'UPDATE_STUDENT':
        return { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Update Student' };
      case 'DELETE_STUDENT':
        return { icon: Trash2, color: 'bg-red-100 text-red-800', label: 'Delete Student' };
      case 'CREATE_ROOM':
        return { icon: Settings, color: 'bg-purple-100 text-purple-800', label: 'Create Room' };
      case 'UPDATE_ROOM':
        return { icon: Settings, color: 'bg-indigo-100 text-indigo-800', label: 'Update Room' };
      case 'CREATE_REQUEST':
        return { icon: FileText, color: 'bg-cyan-100 text-cyan-800', label: 'Create Request' };
      case 'UPDATE_REQUEST_STATUS':
        return { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800', label: 'Update Request' };
      case 'CREATE_USER':
        return { icon: Users, color: 'bg-teal-100 text-teal-800', label: 'Create User' };
      case 'UPDATE_USER':
        return { icon: Users, color: 'bg-orange-100 text-orange-800', label: 'Update User' };
      default:
        return { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: action };
    }
  };

  // Get unique action types for filter dropdown
  const actionTypes = useMemo(() => {
    const actions = new Set(logs.map(log => log.action));
    return Array.from(actions).sort();
  }, [logs]);

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.description.toLowerCase().includes(lowerSearchTerm) ||
      log.user.name.toLowerCase().includes(lowerSearchTerm) ||
      log.user.email.toLowerCase().includes(lowerSearchTerm) ||
      log.action.toLowerCase().includes(lowerSearchTerm)
    );
  }, [logs, searchTerm]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">System Logs</h1>
            <p className="text-gray-600">View and filter system activity logs</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{total} total logs</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="w-full sm:w-48">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
            >
              <option value="ALL">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {getActionTypeDisplay(action).label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading || logsLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#003366] rounded-full animate-spin" />
              <span>Loading logs...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No logs found</p>
            <p className="text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const actionDisplay = getActionTypeDisplay(log.action);
                  const ActionIcon = actionDisplay.icon;
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      {/* User */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#003366] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {log.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${actionDisplay.color}`}>
                          <ActionIcon size={12} />
                          {actionDisplay.label}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {log.description}
                        </div>
                        {log.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            <details className="cursor-pointer">
                              <summary>View details</summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {filteredLogs.length} of {total} logs
        </div>
      )}
    </div>
  );
};

export default LogsPage;
