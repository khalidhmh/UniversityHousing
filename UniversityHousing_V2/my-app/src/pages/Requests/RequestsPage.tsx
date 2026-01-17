/**
 * Requests Page - Phase 6
 * Displays all requests in a data table with approval/rejection actions
 * Features: Filtering by status/type, Approve/Reject actions, Add New Request
 */

import React, { useState, useCallback, useRef } from 'react';
import { Check, X, Plus, AlertCircle, Clock, CheckCircle, XCircle, Printer } from 'lucide-react';
import ReactToPrint from 'react-to-print';
import { useIPC, useIPCEffect } from '../../app/hooks/useIPC';
import type { IpcResponse } from '../../preload/index.d';
import { RequestForm } from '../../app/components/requests/RequestForm';
import { PrintableHeader } from '../../components/common/PrintableHeader';
import '../../styles/print.css';

// Type definitions for Request data
interface Request {
  id: string;
  type: 'DELETE_STUDENT' | 'ROOM_CHANGE' | 'MAINTENANCE' | 'CLEARANCE' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  resolverId?: string;
  resolver?: {
    id: string;
    name: string;
    email: string;
  };
  studentId?: string;
  student?: {
    id: string;
    nameAr: string;
    nameEn: string;
    registrationNumber: string;
    roomNumber?: string;
  };
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

/**
 * Confirmation Dialog Component */
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
  confirmText = 'Confirm',
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
          className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#002855] disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </div>
  </div>
);

/**
 * Requests Page Component */
export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DELETE_STUDENT' | 'ROOM_CHANGE' | 'MAINTENANCE' | 'CLEARANCE' | 'OTHER'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [actionConfirm, setActionConfirm] = useState<{
    requestId: string;
    action: 'approve' | 'reject';
    requestType: string;
    studentName?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const printTableRef = useRef<HTMLDivElement>(null);

  // Fetch requests on mount and when filters change
  useIPCEffect(
    () => {
      const filters: any = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (typeFilter !== 'ALL') filters.type = typeFilter;
      return window.electron.getRequests(filters);
    },
    (result: IpcResponse<{ data: Request[]; total: number }>) => {
      if (result.success && result.data) {
        setRequests(result.data.data || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load requests');
        setRequests([]);
      }
      setIsLoading(false);
    },
    () => {
      setIsLoading(true);
    },
    [statusFilter, typeFilter]
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (formData: { type: string; studentId?: string; description: string }) => {
      try {
        // Get current user ID from localStorage or context (this would come from auth)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const result = await window.electron.createRequest({
          type: formData.type as any,
          studentId: formData.studentId,
          description: formData.description,
          requesterId: currentUser.id,
        });

        if (result.success) {
          setRequests((prev) => [result.data, ...prev]);
          setShowForm(false);
        } else {
          setError(result.error || 'Failed to create request');
        }
      } catch (err) {
        setError('An error occurred while creating the request');
      }
    },
    []
  );

  // Handle approve/reject actions
  const handleAction = useCallback((requestId: string, action: 'approve' | 'reject', requestType: string, studentName?: string) => {
    setActionConfirm({ requestId, action, requestType, studentName });
  }, []);

  // Confirm action
  const confirmAction = useCallback(async () => {
    if (!actionConfirm) return;

    setIsProcessing(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const result = await window.electron.updateRequestStatus({
        requestId: actionConfirm.requestId,
        status: actionConfirm.action === 'approve' ? 'APPROVED' : 'REJECTED',
        resolverId: currentUser.id,
        rejectionReason: actionConfirm.action === 'reject' ? 'Rejected by supervisor' : undefined,
      });

      if (result.success) {
        // Update the request in local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === actionConfirm.requestId ? { ...result.data } : req
          )
        );
        setActionConfirm(null);
      } else {
        setError(result.error || `Failed to ${actionConfirm.action} request`);
      }
    } catch (err) {
      setError('An error occurred while processing the request');
    } finally {
      setIsProcessing(false);
    }
  }, [actionConfirm]);

  // Get type badge styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-700';
      case 'CLEARANCE':
        return 'bg-purple-100 text-purple-700';
      case 'ROOM_CHANGE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE_STUDENT':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} className="text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">الطلبات</h1>
          <p className="text-gray-600">Manage all student requests</p>
        </div>
        <div className="flex items-center gap-3">
          <ReactToPrint
            trigger={() => (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Printer size={20} />
                Print Requests
              </button>
            )}
            content={() => printTableRef.current}
            documentTitle="Student Requests Report"
            pageStyle="@page { margin: 20mm; } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            <Plus size={20} />
            Add Request
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

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-[#003366] text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {(['ALL', 'MAINTENANCE', 'CLEARANCE', 'ROOM_CHANGE', 'DELETE_STUDENT', 'OTHER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === type
                  ? 'bg-[#D4AF37] text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin" />
            <p className="text-gray-500">Loading requests...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No requests found. Click "Add Request" to create one.
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && requests.length > 0 && (
        <div ref={printTableRef} className="print-container">
          <PrintableHeader title="Student Requests Report" />
          <div className="overflow-x-auto border border-gray-200 rounded-lg print-table">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 print-hide-column">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      {request.student ? (
                        <div>
                          <p className="font-medium text-gray-800">{request.student.nameAr}</p>
                          <p className="text-gray-500 text-xs">{request.student.registrationNumber}</p>
                          {request.student.roomNumber && (
                            <p className="text-gray-500 text-xs">Room: {request.student.roomNumber}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No student</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium print-badge ${getTypeBadge(request.type)}`}>
                        {request.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={JSON.parse(request.metadata)?.description}>
                        {JSON.parse(request.metadata)?.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium print-badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">{request.requester.name}</p>
                        <p className="text-gray-500 text-xs">{request.requester.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2 print-hide-column">
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(request.id, 'approve', request.type, request.student?.nameAr)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors print-hide"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'reject', request.type, request.student?.nameAr)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors print-hide"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {request.status !== 'PENDING' && request.resolver && (
                        <div className="text-xs text-gray-500">
                          <p>By {request.resolver.name}</p>
                          {request.resolvedAt && (
                            <p>{formatDate(request.resolvedAt)}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && requests.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{requests.length}</span> request{requests.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Action Confirmation Dialog */}
      {actionConfirm && (
        <ConfirmDialog
          title={`${actionConfirm.action === 'approve' ? 'Approve' : 'Reject'} Request`}
          message={`Are you sure you want to ${actionConfirm.action} this ${actionConfirm.requestType.replace('_', ' ')} request${actionConfirm.studentName ? ` for ${actionConfirm.studentName}` : ''}?`}
          confirmText={actionConfirm.action === 'approve' ? 'Approve' : 'Reject'}
          cancelText="Cancel"
          isLoading={isProcessing}
          onConfirm={confirmAction}
          onCancel={() => setActionConfirm(null)}
        />
      )}
    </div>
  );
};

export default RequestsPage;
