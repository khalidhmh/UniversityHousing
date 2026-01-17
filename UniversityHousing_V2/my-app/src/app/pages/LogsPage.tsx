import React, { useState } from 'react';
import { ClipboardList, Filter, Calendar } from 'lucide-react';
import { logs } from '../data/mockData';

export function LogsPage() {
  const [selectedDate, setSelectedDate] = useState('');

  const filteredLogs = selectedDate
    ? logs.filter((log) => log.date === selectedDate)
    : logs;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">سجل النشاطات</h1>
          <p className="text-gray-600">عرض جميع العمليات المسجلة في النظام</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="font-medium text-gray-700">تصفية حسب التاريخ:</label>
          <div className="relative flex-1 max-w-xs">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pr-12 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none"
            />
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-[#003366] hover:text-[#004488] font-medium"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="px-6 py-4 text-right font-medium">المستخدم</th>
                <th className="px-6 py-4 text-right font-medium">الإجراء</th>
                <th className="px-6 py-4 text-right font-medium">الكيان</th>
                <th className="px-6 py-4 text-right font-medium">التاريخ</th>
                <th className="px-6 py-4 text-right font-medium">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center text-white">
                        {log.user.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">
                        {log.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm inline-block ${
                        log.action.includes('إضافة')
                          ? 'bg-green-100 text-green-800'
                          : log.action.includes('حذف')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{log.entity}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(log.date).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">لا توجد سجلات لهذا التاريخ</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <p className="text-sm text-green-700 mb-1">عمليات الإضافة</p>
          <p className="text-3xl font-bold text-green-800">
            {logs.filter((l) => l.action.includes('إضافة')).length}
          </p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-sm text-blue-700 mb-1">عمليات التعديل</p>
          <p className="text-3xl font-bold text-blue-800">
            {logs.filter((l) => l.action.includes('تعديل')).length}
          </p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-sm text-red-700 mb-1">عمليات الحذف</p>
          <p className="text-3xl font-bold text-red-800">
            {logs.filter((l) => l.action.includes('حذف')).length}
          </p>
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-700 mb-1">إجمالي العمليات</p>
          <p className="text-3xl font-bold text-gray-800">{logs.length}</p>
        </div>
      </div>
    </div>
  );
}
