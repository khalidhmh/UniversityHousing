/**
 * Student Form Component - Phase 4
 * Reusable form for creating and updating student records
 * Handles validation and error display
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import type { Student, Room } from '../../preload/index.d';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (formData: Partial<Student>) => Promise<void>;
  onCancel: () => void;
}

interface FormData extends Partial<Student> {
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  academicYear: number;
  university: 'GOVERNMENT' | 'PRIVATE';
  roomNumber?: string;
  roomType: 'STANDARD' | 'PREMIUM';
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
}

interface FormErrors {
  [key: string]: string;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    nameAr: '',
    nameEn: '',
    email: '',
    phone: '',
    academicYear: new Date().getFullYear(),
    university: 'GOVERNMENT',
    roomNumber: undefined,
    roomType: 'STANDARD',
    status: 'ACTIVE',
    registrationNumber: '',
    nationalId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Room dropdown state
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Populate form with existing student data
  useEffect(() => {
    if (student) {
      setFormData({
        nameAr: student.nameAr || '',
        nameEn: student.nameEn || '',
        email: student.email || '',
        phone: student.phone || '',
        academicYear: student.academicYear || new Date().getFullYear(),
        university: student.university || 'GOVERNMENT',
        roomNumber: student.roomNumber || undefined,
        roomType: student.roomType || 'STANDARD',
        status: student.status || 'ACTIVE',
        registrationNumber: student.registrationNumber || '',
        nationalId: student.nationalId || '',
      });
    }
  }, [student]);

  // Fetch available rooms on mount or when roomType changes
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const result = await window.electron.getAvailableRooms(formData.roomType);
        if (result.success && result.data) {
          setAvailableRooms(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch available rooms:', err);
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    if (!student) {
      fetchRooms();
    }
  }, [formData.roomType, student]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nameAr?.trim()) {
      newErrors.nameAr = 'Arabic name is required';
    }

    if (!formData.nameEn?.trim()) {
      newErrors.nameEn = 'English name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required';
    }

    if (!formData.university) {
      newErrors.university = 'University type is required';
    }

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!student && !formData.registrationNumber?.trim()) {
      newErrors.registrationNumber = 'Registration number is required for new students';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmit(formData);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'An error occurred'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit]
  );

  // Handle input change
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'academicYear'
            ? parseInt(value, 10) || new Date().getFullYear()
            : value,
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const isEditMode = !!student;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-[#003366]">
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Submit Error */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arabic Name *
              </label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.nameAr
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="اسم الطالب"
              />
              {errors.nameAr && (
                <p className="text-red-600 text-sm mt-1">{errors.nameAr}</p>
              )}
            </div>

            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name *
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.nameEn
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="Student Name"
              />
              {errors.nameEn && (
                <p className="text-red-600 text-sm mt-1">{errors.nameEn}</p>
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number {!isEditMode && '*'}
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                disabled={isSubmitting || isEditMode}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.registrationNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="20240001"
              />
              {errors.registrationNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.registrationNumber}
                </p>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] disabled:bg-gray-100"
                placeholder="1234567890"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="student@university.edu"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="+966"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="number"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.academicYear
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
              />
              {errors.academicYear && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.academicYear}
                </p>
              )}
            </div>

            {/* University Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Type *
              </label>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.university
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
              >
                <option value="GOVERNMENT">Government</option>
                <option value="PRIVATE">Private</option>
              </select>
              {errors.university && (
                <p className="text-red-600 text-sm mt-1">{errors.university}</p>
              )}
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.roomType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
              {errors.roomType && (
                <p className="text-red-600 text-sm mt-1">{errors.roomType}</p>
              )}
            </div>

            {/* Room Assignment - Only for new students */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Room (Optional)
                </label>
                <div className="relative">
                  {loadingRooms && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                    </div>
                  )}
                  <select
                    name="roomNumber"
                    value={formData.roomNumber || ''}
                    onChange={handleChange}
                    disabled={isSubmitting || loadingRooms}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] disabled:bg-gray-100"
                  >
                    <option value="">Select a room...</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.roomNumber}>
                        Room {room.roomNumber} ({room.currentCount}/{room.capacity})
                      </option>
                    ))}
                  </select>
                  {availableRooms.length === 0 && !loadingRooms && (
                    <p className="text-gray-500 text-sm mt-1">
                      No available rooms for this type
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] disabled:bg-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#002855] disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Update Student'
                  : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
