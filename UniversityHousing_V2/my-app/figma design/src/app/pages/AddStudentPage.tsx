import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, X, AlertCircle } from 'lucide-react';
import { colleges, grades } from '../data/mockData';

export function AddStudentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    registrationNumber: '',
    universityType: 'حكومية' as 'حكومية' | 'أهلية',
    accommodationType: 'عادي' as 'عادي' | 'مميز',
    college: '',
    grade: '',
    roomNumber: '',
    housingDate: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Ahlia university must have Premium accommodation
    if (formData.universityType === 'أهلية' && formData.accommodationType !== 'مميز') {
      setShowValidation(true);
      return;
    }
    
    setShowValidation(false);
    alert('تم حفظ بيانات الطالب بنجاح!');
    navigate('/browse-students');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-adjust accommodation type if university type changes to Ahlia
    if (name === 'universityType' && value === 'أهلية') {
      setFormData((prev) => ({ ...prev, accommodationType: 'مميز' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">إضافة طالب جديد</h1>

        {showValidation && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">تنبيه:</p>
              <p className="text-red-700 text-sm">
                طلاب الجامعات الأهلية يجب أن يكون سكنهم من النوع المميز فقط
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              رفع صورة الطالب
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهوية الوطنية *
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                placeholder="أدخل رقم الهوية"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم التسجيل *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                placeholder="أدخل رقم التسجيل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الجامعة *
              </label>
              <select
                name="universityType"
                value={formData.universityType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                required
              >
                <option value="حكومية">حكومية</option>
                <option value="أهلية">أهلية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع السكن *
              </label>
              <select
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                required
                disabled={formData.universityType === 'أهلية'}
              >
                <option value="عادي">عادي</option>
                <option value="مميز">مميز</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكلية *
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                required
              >
                <option value="">اختر الكلية</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى الدراسي *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                required
              >
                <option value="">اختر المستوى</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الغرفة *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                placeholder="أدخل رقم الغرفة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ السكن *
              </label>
              <input
                type="date"
                name="housingDate"
                value={formData.housingDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-[#003366] text-white py-4 rounded-xl hover:bg-[#004488] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={() => navigate('/browse-students')}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
