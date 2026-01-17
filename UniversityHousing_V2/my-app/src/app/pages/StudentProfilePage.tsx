import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, QrCode, X, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { students } from '../data/mockData';
import { Dialog, DialogContent } from '../components/ui/dialog';

export function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">لم يتم العثور على الطالب</p>
      </div>
    );
  }

  const handleDelete = () => {
    alert('تم حذف الطالب بنجاح');
    navigate('/browse-students');
  };

  const handleEdit = () => {
    alert('سيتم فتح صفحة التعديل');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#003366] hover:text-[#004488] font-medium"
      >
        <ArrowRight className="w-5 h-5" />
        العودة
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-l from-[#003366] to-[#004488] p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
                <p className="text-blue-100 mb-4">{student.registrationNumber}</p>
                <div className="flex gap-2">
                  <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
                    {student.universityType}
                  </span>
                  <span
                    className={`px-4 py-1 rounded-full text-sm ${
                      student.accommodationType === 'مميز'
                        ? 'bg-[#D4AF37]'
                        : 'bg-white/20'
                    }`}
                  >
                    سكن {student.accommodationType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="p-3 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 rounded-lg transition-colors"
                title="رمز QR"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">رقم الهوية الوطنية</p>
                <p className="font-medium text-gray-800">{student.nationalId}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">الكلية</p>
                <p className="font-medium text-gray-800">{student.college}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">المستوى الدراسي</p>
                <p className="font-medium text-gray-800">{student.grade}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">رقم الغرفة</p>
                <p className="font-medium text-gray-800">غرفة {student.roomNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">رقم التسجيل</p>
                <p className="font-medium text-gray-800">
                  {student.registrationNumber}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">نوع الجامعة</p>
                <p className="font-medium text-gray-800">{student.universityType}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">نوع السكن</p>
                <p className="font-medium text-gray-800">
                  {student.accommodationType}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">تاريخ السكن</p>
                <p className="font-medium text-gray-800">
                  {new Date(student.housingDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">رمز QR للطالب</h2>
            <p className="text-gray-600">{student.name}</p>
            <div className="flex justify-center p-6 bg-gray-50 rounded-xl">
              <QRCodeSVG
                value={JSON.stringify({
                  id: student.id,
                  name: student.name,
                  registrationNumber: student.registrationNumber,
                  roomNumber: student.roomNumber,
                })}
                size={256}
                level="H"
              />
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-[#003366] text-white py-3 rounded-xl hover:bg-[#004488] transition-colors"
            >
              إغلاق
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">تأكيد الحذف</h2>
            <p className="text-gray-600">
              هل أنت متأكد من حذف بيانات الطالب {student.name}؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
