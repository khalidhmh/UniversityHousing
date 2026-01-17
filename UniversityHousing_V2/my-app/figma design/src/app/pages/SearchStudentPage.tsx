import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { students } from '../data/mockData';

export function SearchStudentPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(students);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.nationalId.includes(query) ||
        student.registrationNumber.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">بحث عن طالب</h1>
        <p className="text-gray-600">
          ابحث باستخدام الاسم أو رقم الهوية أو رقم التسجيل
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="w-full pr-14 pl-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
          />
        </div>

        {searchQuery && (
          <p className="mt-4 text-sm text-gray-600">
            تم العثور على {searchResults.length} نتيجة
          </p>
        )}
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((student) => (
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
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                {student.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهوية:</span>
                  <span className="font-medium text-gray-800">
                    {student.nationalId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم التسجيل:</span>
                  <span className="font-medium text-gray-800">
                    {student.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
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

      {searchResults.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            لم يتم العثور على نتائج
          </h3>
          <p className="text-gray-500">جرب البحث باستخدام كلمات مختلفة</p>
        </div>
      )}
    </div>
  );
}
