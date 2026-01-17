import React from 'react';
import { Users, Home, Star, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logs } from '../data/mockData';

export function DashboardPage() {
  const stats = [
    {
      title: 'إجمالي الطلاب',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'إجمالي الغرف',
      value: '80',
      icon: Home,
      color: 'bg-green-500',
      trend: '+5%',
    },
    {
      title: 'الغرف المميزة',
      value: '32',
      icon: Star,
      color: 'bg-[#D4AF37]',
      trend: '+8%',
    },
    {
      title: 'الغرف العادية',
      value: '48',
      icon: Home,
      color: 'bg-gray-500',
      trend: '+3%',
    },
  ];

  const quickActions = [
    { title: 'إضافة طالب جديد', path: '/add-student', color: 'bg-[#003366]' },
    { title: 'بحث عن طالب', path: '/search-student', color: 'bg-blue-600' },
    { title: 'تصفح الطلاب', path: '/browse-students', color: 'bg-green-600' },
    { title: 'بحث عن غرفة', path: '/room-search', color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          مرحباً بك في لوحة التحكم
        </h1>
        <p className="text-gray-600">نظرة عامة على نظام إدارة السكن الجامعي</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#003366]" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`${action.color} text-white p-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-between group`}
            >
              <span className="font-medium">{action.title}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#003366]" />
            النشاطات الأخيرة
          </h2>
          <Link
            to="/logs"
            className="text-[#003366] hover:text-[#004488] font-medium text-sm flex items-center gap-1"
          >
            عرض الكل
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {logs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{log.action}</p>
                  <p className="text-sm text-gray-600">
                    بواسطة {log.user} • {log.entity}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">{log.date}</p>
                <p className="text-sm text-gray-500">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
