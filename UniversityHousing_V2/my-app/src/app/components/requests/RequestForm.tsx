/**
 * Request Form Component - Phase 6
 * Modal form for creating new requests (Maintenance, Room Change, Clearance, etc.)
 * Features: Student selection, request type dropdown, description field
 */

import React, { useState, useEffect } from 'react';
import { X, User, FileText, AlertCircle } from 'lucide-react';
import { useIPCEffect } from '../../hooks/useIPC';

// Type definitions
interface Student {
  id: string;
  nameAr: string;
  nameEn: string;
  registrationNumber: string;
  roomNumber?: string;
}

interface RequestFormProps {
  onSubmit: (data: { type: string; studentId?: string; description: string }) => void;
  onCancel: () => void;
}

/**
 * Request Form Component */
export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'MAINTENANCE',
    studentId: '',
    description: '',
  });

  // Fetch students for dropdown
  const { data: studentsData, loading: studentsLoading } = useIPCEffect(
    () => window.electron.getStudents({ status: 'ACTIVE' }),
    (result: any) => {
      if (result.success && result.data) {
        setStudents(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load students');
        setStudents([]);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    }
  );

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.type) {
      setError('Please select a request type');
      return;
    }

    if (formData.type !== 'OTHER' && !formData.studentId) {
      setError('Please select a student for this request');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description');
      return;
    }

    // Submit form
    onSubmit({
      type: formData.type,
      studentId: formData.studentId || undefined,
      description: formData.description.trim(),
    });
  };

  // Get request type label
  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'صيانة (Maintenance)';
      case 'CLEARANCE':
        return 'إخلاء طرف (Clearance)';
      case 'ROOM_CHANGE':
        return 'تغيير غرفة (Room Change)';
      case 'DELETE_STUDENT':
        return 'حذف طالب (Delete Student)';
      default:
        return 'أخرى (Other)';
    }
  };

  // Get request type description
  const getRequestTypeDescription = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'For room maintenance issues and repairs';
      case 'CLEARANCE':
        return 'To clear student from housing and free up room';
      case 'ROOM_CHANGE':
        return 'To request a room transfer or change';
      case 'DELETE_STUDENT':
        return 'To request student record deletion';
      default:
        return 'For other types of requests';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003366]">
              <FileText className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#003366]">Create New Request</h2>
              <p className="text-sm text-gray-600">Submit a student request for approval</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-700 font-medium">Validation Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Request Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-colors"
              required
            >
              <option value="MAINTENANCE">صيانة (Maintenance)</option>
              <option value="CLEARANCE">إخلاء طرف (Clearance)</option>
              <option value="ROOM_CHANGE">تغيير غرفة (Room Change)</option>
              <option value="DELETE_STUDENT">حذف طالب (Delete Student)</option>
              <option value="OTHER">أخرى (Other)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {getRequestTypeDescription(formData.type)}
            </p>
          </div>

          {/* Student Selection */}
          {formData.type !== 'OTHER' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              {studentsLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#003366] rounded-full animate-spin" />
                  <span>Loading students...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-gray-500">No active students found</div>
              ) : (
                <select
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-colors"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nameAr} - {student.registrationNumber}
                      {student.roomNumber && ` (Room: ${student.roomNumber})`}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the student this request is for
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide detailed information about this request..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-colors resize-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe the request details and any relevant information
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors flex items-center gap-2"
            >
              <FileText size={18} />
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
