/**
 * Rooms Page - Phase 5
 * Displays all rooms in a data table with CRUD operations
 * Features: Filtering by status, Edit, Delete, Add New Room
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Edit2, Trash2, Plus, AlertCircle, Printer } from 'lucide-react';
import ReactToPrint from 'react-to-print';
import { useIPC, useIPCEffect } from '../../app/hooks/useIPC';
import type { Room, IpcResponse } from '../../preload/index.d';
import { RoomForm } from '../../app/components/rooms/RoomForm';
import { PrintableHeader } from '../../components/common/PrintableHeader';
import '../../styles/print.css';

/**
 * Confirmation Dialog Component
 */
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
      <h2 className="text-xl font-bold text-[#003366] mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : confirmText}
        </button>
      </div>
    </div>
  </div>
);

/**
 * Rooms Page Component
 */
export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    roomId: string;
    roomNumber: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const printTableRef = useRef<HTMLDivElement>(null);

  // Fetch rooms on mount and when filter changes
  useIPCEffect(
    () => {
      const filters = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      return window.electron.getRooms(filters);
    },
    (result: IpcResponse<{ data: Room[]; total: number }>) => {
      if (result.success && result.data) {
        setRooms(result.data.data || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load rooms');
        setRooms([]);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    }
  );

  // Handle add/edit form submission
  const handleFormSubmit = useCallback(
    async (formData: Partial<Room>) => {
      try {
        if (editingRoom) {
          // Update existing room
          const result = await window.electron.updateRoom({
            ...formData,
            id: editingRoom.id,
          });

          if (result.success) {
            setRooms((prev) =>
              prev.map((r) =>
                r.id === editingRoom.id ? { ...r, ...result.data } : r
              )
            );
            setShowForm(false);
            setEditingRoom(null);
          } else {
            setError(result.error || 'Failed to update room');
          }
        } else {
          // Create new room
          const result = await window.electron.createRoom(formData);

          if (result.success) {
            setRooms((prev) => [...prev, result.data]);
            setShowForm(false);
          } else {
            setError(result.error || 'Failed to create room');
          }
        }
      } catch (err) {
        setError('An error occurred while saving the room');
      }
    },
    [editingRoom]
  );

  // Handle edit button click
  const handleEdit = useCallback((room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  }, []);

  // Handle delete button click
  const handleDelete = useCallback((roomId: string, roomNumber: string) => {
    setDeleteConfirm({ roomId, roomNumber });
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const result = await window.electron.deleteRoom(deleteConfirm.roomId);

      if (result.success) {
        // Remove from local state
        setRooms((prev) => prev.filter((r) => r.id !== deleteConfirm.roomId));
        setDeleteConfirm(null);
      } else {
        setError(result.error || 'Failed to delete room');
      }
    } catch (err) {
      setError('An error occurred while deleting the room');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirm]);

  // Get status badge styling
  const getStatusBadge = (room: Room) => {
    const occupancyPercent = (room.currentCount / room.capacity) * 100;
    
    if (occupancyPercent >= 100) {
      return 'bg-red-100 text-red-700';
    } else if (occupancyPercent >= 50) {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  };

  const getStatusText = (room: Room) => {
    if (room.isOccupied) {
      return 'Full';
    } else if (room.currentCount > 0) {
      return 'Partial';
    } else {
      return 'Available';
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">Rooms</h1>
          <p className="text-gray-600">Manage all housing rooms</p>
        </div>
        <div className="flex items-center gap-3">
          <ReactToPrint
            trigger={() => (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Printer size={20} />
                Print Report
              </button>
            )}
            content={() => printTableRef.current}
            documentTitle="Rooms Status Report"
            pageStyle="@page { margin: 20mm; } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }"
          />
          <button
            onClick={() => {
              setEditingRoom(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            <Plus size={20} />
            Add Room
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
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex gap-3">
        {(['ALL', 'AVAILABLE', 'OCCUPIED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === status
                ? 'bg-[#003366] text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'All Rooms' : status === 'AVAILABLE' ? 'Available' : 'Occupied'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin" />
            <p className="text-gray-500">Loading rooms...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {statusFilter === 'ALL'
              ? 'No rooms yet. Click "Add Room" to create one.'
              : `No ${statusFilter.toLowerCase()} rooms available.`}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && rooms.length > 0 && (
        <div ref={printTableRef} className="print-container">
          <PrintableHeader title="Rooms Status Report" />
          <div className="overflow-x-auto border border-gray-200 rounded-lg print-table">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Room #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Floor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Current / Max
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 print-hide-column">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {room.floor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs print-badge">
                        {room.roomType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {room.capacity} person{room.capacity !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      <span className="text-[#003366]">{room.currentCount}</span>
                      <span className="text-gray-500"> / {room.capacity}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium print-badge ${getStatusBadge(room)}`}>
                        {getStatusText(room)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2 print-hide-column">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors print-hide"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id, room.roomNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors print-hide"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && rooms.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{rooms.length}</span> room{rooms.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Room Form Modal */}
      {showForm && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRoom(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Room"
          message={`Are you sure you want to delete room ${deleteConfirm.roomNumber}? This can only be done if the room is empty.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default RoomsPage;
