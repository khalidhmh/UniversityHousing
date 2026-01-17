import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorOpen, Search } from 'lucide-react';
import { students } from '../data/mockData';

export function RoomSearchPage() {
  const navigate = useNavigate();
  const [roomNumber, setRoomNumber] = useState('');
  const [roomStudents, setRoomStudents] = useState<typeof students>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!roomNumber.trim()) return;

    const foundStudents = students.filter(
      (student) => student.roomNumber === roomNumber
    );
    setRoomStudents(foundStudents);
    setSearched(true);
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">بحث عن غرفة</h1>
        <p className="text-gray-600">أدخل رقم الغرفة لعرض الطلاب المقيمين فيها</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <DoorOpen className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="أدخل رقم الغرفة..."
              className="w-full pr-14 pl-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#003366] text-white px-8 py-4 rounded-xl hover:bg-[#004488] transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            بحث
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {roomStudents.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  غرفة رقم {roomNumber}
                </h2>
                <p className="text-gray-600">
                  عدد الطلاب: {roomStudents.length} من 3
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roomStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 mb-2 truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {student.college}
                        </p>
                        <p className="text-sm text-gray-600">{student.grade}</p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
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
                ))}

                {/* Empty slots */}
                {Array.from({ length: 3 - roomStudents.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300"
                  >
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                      <DoorOpen className="w-12 h-12 mb-2" />
                      <p className="text-sm">سرير شاغر</p>
                    </div>
                  </div>
                ))}
              </div>

              {roomStudents.length === 3 && (
                <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-800 font-medium">
                    الغرفة ممتلئة بالكامل
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <DoorOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                لا يوجد طلاب في هذه الغرفة
              </h3>
              <p className="text-gray-500">
                قد تكون الغرفة شاغرة أو رقم الغرفة غير صحيح
              </p>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <DoorOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            ابدأ البحث عن غرفة
          </h3>
          <p className="text-gray-500">
            أدخل رقم الغرفة في خانة البحث أعلاه لعرض التفاصيل
          </p>
        </div>
      )}
    </div>
  );
}
