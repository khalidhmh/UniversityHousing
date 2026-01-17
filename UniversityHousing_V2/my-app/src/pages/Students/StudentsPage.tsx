/**
 * Students Page - Phase 4
 * Displays all students in a data table with CRUD operations
 * Features: Search, Edit, Delete, Add New Student
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Edit2, Trash2, Plus, Search, AlertCircle, Printer } from 'lucide-react';
import ReactToPrint from 'react-to-print';
import { useIPC, useIPCEffect } from '../../app/hooks/useIPC';
import type { Student, IpcResponse } from '../../preload/index.d';
import { StudentForm } from '../../app/components/students/StudentForm';
import { PrintableHeader } from '../../components/common/PrintableHeader';
import '../../styles/print.css';

interface StudentWithIndex extends Student {
  index?: number;
}

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
 * Students Page Component
 */
export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentWithIndex[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const printTableRef = useRef<HTMLDivElement>(null);

  // Fetch students on mount
  useIPCEffect(
    () => window.electron.getStudents({}),
    (result: IpcResponse<{ data: Student[]; total: number }>) => {
      if (result.success && result.data) {
        setStudents(
          (result.data.data || []).map((s, idx) => ({
            ...s,
            index: idx,
          }))
        );
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

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    const term = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.nameAr.toLowerCase().includes(term) ||
        student.nameEn.toLowerCase().includes(term) ||
        student.registrationNumber.toLowerCase().includes(term) ||
        student.nationalId?.toLowerCase().includes(term) ||
        student.phone?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Handle add/edit form submission
  const handleFormSubmit = useCallback(
    async (formData: Partial<Student>) => {
      try {
        if (editingStudent) {
          // Update existing student
          const result = await window.electron.updateStudent({
            ...formData,
            id: editingStudent.id,
          });

          if (result.success) {
            setStudents((prev) =>
              prev.map((s) =>
                s.id === editingStudent.id
                  ? { ...s, ...result.data, index: s.index }
                  : s
              )
            );
            setShowForm(false);
            setEditingStudent(null);
          } else {
            setError(result.error || 'Failed to update student');
          }
        } else {
          // Create new student
          const result = await window.electron.addStudent(formData);

          if (result.success) {
            setStudents((prev) => [
              ...prev,
              { ...result.data, index: prev.length },
            ]);
            setShowForm(false);
          } else {
            setError(result.error || 'Failed to create student');
          }
        }
      } catch (err) {
        setError('An error occurred while saving the student');
      }
    },
    [editingStudent]
  );

  // Handle edit button click
  const handleEdit = useCallback((student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  }, []);

  // Handle delete button click
  const handleDelete = useCallback((studentId: string, studentName: string) => {
    setDeleteConfirm({ studentId, studentName });
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      // First, create a deletion request
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found');
        return;
      }

      const result = await window.electron.requestDeleteStudent({
        studentId: deleteConfirm.studentId,
        requesterId: userId,
      });

      if (result.success) {
        // Remove from local state
        setStudents((prev) =>
          prev.filter((s) => s.id !== deleteConfirm.studentId)
        );
        setDeleteConfirm(null);
      } else {
        setError(result.error || 'Failed to delete student');
      }
    } catch (err) {
      setError('An error occurred while deleting the student');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirm]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">Students</h1>
          <p className="text-gray-600">Manage all student records</p>
        </div>
        <div className="flex items-center gap-3">
          <ReactToPrint
            trigger={() => (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Printer size={20} />
                Print List
              </button>
            )}
            content={() => printTableRef.current}
            documentTitle="Students List"
            pageStyle="@page { margin: 20mm; } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }"
          />
          <button
            onClick={() => {
              setEditingStudent(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            <Plus size={20} />
            Add Student
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

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID, phone, or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin" />
            <p className="text-gray-500">Loading students...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No students found matching your search'
              : 'No students yet. Click "Add Student" to get started.'}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && filteredStudents.length > 0 && (
        <div ref={printTableRef} className="print-container">
          <PrintableHeader title="Students List" />
          <div className="overflow-x-auto border border-gray-200 rounded-lg print-table">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name (AR)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name (EN)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    National ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    University
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Room #
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
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {student.nameAr}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {student.nameEn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.nationalId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs print-badge">
                        {student.university}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.roomNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium print-badge ${
                          student.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2 print-hide-column">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors print-hide"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(student.id, student.nameEn)
                        }
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
      {!isLoading && filteredStudents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredStudents.length}</span>{' '}
          of{' '}
          <span className="font-semibold">{students.length}</span> students
        </div>
      )}

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Student"
          message={`Are you sure you want to delete ${deleteConfirm.studentName}? This action cannot be undone.`}
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

export default StudentsPage;
