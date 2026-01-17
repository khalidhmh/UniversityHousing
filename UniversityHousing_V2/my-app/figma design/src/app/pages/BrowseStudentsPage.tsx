import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { students, colleges, grades } from '../data/mockData';

export function BrowseStudentsPage() {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter students
  const filteredStudents = students.filter((student) => {
    if (selectedCollege && student.college !== selectedCollege) return false;
    if (selectedGrade && student.grade !== selectedGrade) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تصفح الطلاب</h1>
          <p className="text-gray-600">
            عدد الطلاب: {filteredStudents.length} من أصل {students.length}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 bg-white rounded-2xl shadow-lg p-6 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            تصفية النتائج
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكلية
              </label>
              <select
                value={selectedCollege}
                onChange={(e) => {
                  setSelectedCollege(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none"
              >
                <option value="">جميع الكليات</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى الدراسي
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none"
              >
                <option value="">جميع المستويات</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedCollege('');
                setSelectedGrade('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Students Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {displayedStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {student.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{student.college}</p>
                    <p>{student.grade}</p>
                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                      <span className="text-[#003366] font-medium">
                        غرفة {student.roomNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          student.accommodationType === 'مميز'
                            ? 'bg-[#D4AF37] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {student.accommodationType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-[#003366] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } shadow`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
