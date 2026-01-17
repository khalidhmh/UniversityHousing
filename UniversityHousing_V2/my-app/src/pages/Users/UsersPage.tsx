/**
 * Users Page Component - Phase 7
 * User management interface for Managers only
 * Features: User listing, role management, create/edit/delete users
 */

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Edit2, Trash2, Shield, AlertCircle, X, Check } from 'lucide-react';
import { useIPCEffect } from '../../app/hooks/useIPC';

// Type definitions
interface User {
  id: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'SUPERVISOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
  };
}

/**
 * Users Page Component */
export const UsersPage: React.FC<UsersPageProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  // Fetch users data
  const { data: usersData, loading: usersLoading } = useIPCEffect(
    () => window.electron.getUsers({ requesterId: user?.id || '' }),
    (result: any) => {
      if (result.success && result.data) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load users');
        setUsers([]);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    },
    [user?.id]
  );

  // Handle user creation/update
  const handleUserSubmit = async (userData: {
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
    password?: string;
  }) => {
    try {
      if (editingUser) {
        // Update existing user
        const result = await window.electron.updateUser({
          userId: editingUser.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: true,
          requesterId: user?.id || '',
        });

        if (result.success) {
          setUsers(prev => prev.map(u => 
            u.id === editingUser.id ? result.data : u
          ));
          setShowUserForm(false);
          setEditingUser(null);
        } else {
          setError(result.error || 'Failed to update user');
        }
      } else {
        // Create new user (would need create-user handler)
        setError('Create user functionality not yet implemented');
      }
    } catch (err) {
      setError('An error occurred while saving user');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (targetUser: User) => {
    try {
      // Prevent self-deletion
      if (targetUser.id === user?.id) {
        setError('Cannot delete your own account');
        return;
      }

      // Prevent deletion of last manager
      const managerCount = users.filter(u => u.role === 'MANAGER' && u.isActive).length;
      if (targetUser.role === 'MANAGER' && managerCount <= 1) {
        setError('Cannot delete the last manager account');
        return;
      }

      // Would need delete-user handler
      setError('Delete user functionality not yet implemented');
    } catch (err) {
      setError('An error occurred while deleting user');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  // Get role badge styling
  const getRoleBadge = (role: 'MANAGER' | 'SUPERVISOR') => {
    return role === 'MANAGER' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  // Check if user can be deleted
  const canDeleteUser = (targetUser: User) => {
    return targetUser.id !== user?.id && 
           !(targetUser.role === 'MANAGER' && 
             users.filter(u => u.role === 'MANAGER' && u.isActive).length <= 1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowUserForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            <UserPlus size={18} />
            Add New User
          </button>
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
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading || usersLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#003366] rounded-full animate-spin" />
              <span>Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
            <p className="text-sm">Create your first user to get started</p>
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#003366] text-white rounded-full flex items-center justify-center font-medium">
                          {userItem.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {userItem.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(userItem.role)}`}>
                        <Shield size={12} />
                        {userItem.role}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        userItem.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          userItem.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userItem.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(userItem);
                            setShowUserForm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(userItem)}
                          disabled={!canDeleteUser(userItem)}
                          className={`p-1 rounded transition-colors ${
                            canDeleteUser(userItem)
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-200 cursor-not-allowed'
                          }`}
                          title={
                            !canDeleteUser(userItem)
                              ? userItem.id === user?.id
                                ? 'Cannot delete your own account'
                                : 'Cannot delete the last manager'
                              : 'Delete user'
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#003366]">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <UserForm
              user={editingUser}
              onSubmit={handleUserSubmit}
              onCancel={() => {
                setShowUserForm(false);
                setEditingUser(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                  {deleteConfirm.email && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {deleteConfirm.email}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// User Form Component
interface UserFormProps {
  user?: User | null;
  onSubmit: (data: {
    name: string;
    email: string;
    role: 'MANAGER' | 'SUPERVISOR';
    password?: string;
  }) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: (user?.role || 'SUPERVISOR') as 'MANAGER' | 'SUPERVISOR',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    onSubmit(formData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter user name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Role */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'MANAGER' | 'SUPERVISOR' }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
        >
          <option value="SUPERVISOR">Supervisor</option>
          <option value="MANAGER">Manager</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Managers can manage users and access all system features
        </p>
      </div>

      {/* Password (only for new users) */}
      {!user && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
        </button>
      </div>
    </form>
  );
};

export default UsersPage;
