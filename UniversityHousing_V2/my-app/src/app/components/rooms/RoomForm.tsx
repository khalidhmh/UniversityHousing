/**
 * Room Form Component - Phase 5
 * Reusable form for creating and updating room records
 * Handles validation and error display
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Room } from '../../preload/index.d';

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (formData: Partial<Room>) => Promise<void>;
  onCancel: () => void;
}

interface FormData extends Partial<Room> {
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: 'STANDARD' | 'PREMIUM';
}

interface FormErrors {
  [key: string]: string;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    roomNumber: '',
    floor: 1,
    capacity: 2,
    roomType: 'STANDARD',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form with existing room data
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        floor: room.floor || 1,
        capacity: room.capacity || 2,
        roomType: room.roomType || 'STANDARD',
      });
    }
  }, [room]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.roomNumber?.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    if (!formData.floor || formData.floor < 0) {
      newErrors.floor = 'Floor must be a valid number (0 or higher)';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'floor' || name === 'capacity'
            ? parseInt(value, 10) || 0
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

  const isEditMode = !!room;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-[#003366]">
            {isEditMode ? 'Edit Room' : 'Add New Room'}
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
            {/* Room Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                disabled={isSubmitting || isEditMode}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.roomNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
                placeholder="101"
              />
              {errors.roomNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.roomNumber}</p>
              )}
            </div>

            {/* Floor Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor Number *
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.floor
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
              />
              {errors.floor && (
                <p className="text-red-600 text-sm mt-1">{errors.floor}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  errors.capacity
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#003366]'
                }`}
              />
              {errors.capacity && (
                <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>
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
                  ? 'Update Room'
                  : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
