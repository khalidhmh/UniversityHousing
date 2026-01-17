import React from 'react';
import { Settings, Users, Database, Shield, Bell, Download, Upload } from 'lucide-react';

export function SettingsPage() {
  const settingsSections = [
    {
      icon: Users,
      title: 'إدارة المستخدمين',
      description: 'إضافة وتعديل وحذف حسابات المستخدمين',
      action: 'إدارة المستخدمين',
    },
    {
      icon: Shield,
      title: 'الصلاحيات والأمان',
      description: 'تعيين صلاحيات الوصول وإعدادات الأمان',
      action: 'إعدادات الأمان',
    },
    {
      icon: Database,
      title: 'النسخ الاحتياطي والاستعادة',
      description: 'إنشاء نسخة احتياطية أو استعادة البيانات',
      action: 'إدارة النسخ',
    },
    {
      icon: Bell,
      title: 'الإشعارات',
      description: 'إعدادات الإشعارات والتنبيهات',
      action: 'إعدادات الإشعارات',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">الإعدادات</h1>
        <p className="text-gray-600">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#003366] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  <button className="text-[#003366] hover:text-[#004488] font-medium flex items-center gap-2">
                    {section.action}
                    <span>←</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-[#003366]" />
          النسخ الاحتياطي والاستعادة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-[#003366] text-white py-4 px-6 rounded-xl hover:bg-[#004488] transition-colors">
            <Download className="w-5 h-5" />
            <span className="font-medium">إنشاء نسخة احتياطية</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-colors">
            <Upload className="w-5 h-5" />
            <span className="font-medium">استعادة من نسخة احتياطية</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          آخر نسخة احتياطية: 2024-12-15 الساعة 10:30 صباحاً
        </p>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#003366]" />
          إعدادات النظام
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">اللغة</p>
              <p className="text-sm text-gray-600">لغة واجهة النظام</p>
            </div>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none">
              <option>العربية</option>
              <option>English</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">السمة</p>
              <p className="text-sm text-gray-600">مظهر النظام</p>
            </div>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none">
              <option>فاتح</option>
              <option>داكن</option>
              <option>تلقائي</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">حجم الخط</p>
              <p className="text-sm text-gray-600">حجم النصوص في النظام</p>
            </div>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003366] focus:outline-none">
              <option>صغير</option>
              <option>متوسط</option>
              <option>كبير</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-l from-[#003366] to-[#004488] rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">معلومات النظام</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">إصدار النظام</p>
            <p className="font-medium">v2.0.1</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">تاريخ التحديث</p>
            <p className="font-medium">2024-12-01</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">عدد المستخدمين</p>
            <p className="font-medium">5 مستخدمين</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">حالة النظام</p>
            <p className="font-medium">يعمل بشكل طبيعي</p>
          </div>
        </div>
      </div>
    </div>
  );
}
