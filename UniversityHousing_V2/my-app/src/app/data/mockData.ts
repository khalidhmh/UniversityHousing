export interface Student {
  id: string;
  name: string;
  nationalId: string;
  registrationNumber: string;
  universityType: 'أهلية' | 'حكومية';
  accommodationType: 'عادي' | 'مميز';
  college: string;
  grade: string;
  roomNumber: string;
  housingDate: string;
  photo: string;
}

export interface LogEntry {
  id: string;
  user: string;
  action: string;
  date: string;
  time: string;
  entity: string;
}

export const students: Student[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    nationalId: '1234567890',
    registrationNumber: 'STD2024001',
    universityType: 'حكومية',
    accommodationType: 'عادي',
    college: 'كلية الهندسة',
    grade: 'السنة الثالثة',
    roomNumber: '101',
    housingDate: '2024-01-15',
    photo: 'https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '2',
    name: 'فاطمة حسن الزهراني',
    nationalId: '0987654321',
    registrationNumber: 'STD2024002',
    universityType: 'أهلية',
    accommodationType: 'مميز',
    college: 'كلية الطب',
    grade: 'السنة الرابعة',
    roomNumber: '205',
    housingDate: '2024-01-20',
    photo: 'https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '3',
    name: 'عمر خالد السعيد',
    nationalId: '1122334455',
    registrationNumber: 'STD2024003',
    universityType: 'حكومية',
    accommodationType: 'عادي',
    college: 'كلية العلوم',
    grade: 'السنة الثانية',
    roomNumber: '103',
    housingDate: '2024-02-01',
    photo: 'https://images.unsplash.com/photo-1639654655546-68bc1f21e9e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '4',
    name: 'مريم عبدالله القحطاني',
    nationalId: '2233445566',
    registrationNumber: 'STD2024004',
    universityType: 'حكومية',
    accommodationType: 'عادي',
    college: 'كلية الآداب',
    grade: 'السنة الأولى',
    roomNumber: '208',
    housingDate: '2024-02-10',
    photo: 'https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '5',
    name: 'سارة أحمد الغامدي',
    nationalId: '3344556677',
    registrationNumber: 'STD2024005',
    universityType: 'أهلية',
    accommodationType: 'مميز',
    college: 'كلية إدارة الأعمال',
    grade: 'السنة الثالثة',
    roomNumber: '301',
    housingDate: '2024-02-15',
    photo: 'https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '6',
    name: 'يوسف عبدالرحمن المالكي',
    nationalId: '4455667788',
    registrationNumber: 'STD2024006',
    universityType: 'حكومية',
    accommodationType: 'عادي',
    college: 'كلية الهندسة',
    grade: 'السنة الرابعة',
    roomNumber: '102',
    housingDate: '2024-03-01',
    photo: 'https://images.unsplash.com/photo-1639654655546-68bc1f21e9e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '7',
    name: 'نورة محمد الدوسري',
    nationalId: '5566778899',
    registrationNumber: 'STD2024007',
    universityType: 'حكومية',
    accommodationType: 'عادي',
    college: 'كلية الصيدلة',
    grade: 'السنة الثانية',
    roomNumber: '210',
    housingDate: '2024-03-05',
    photo: 'https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '8',
    name: 'خالد فهد العتيبي',
    nationalId: '6677889900',
    registrationNumber: 'STD2024008',
    universityType: 'أهلية',
    accommodationType: 'مميز',
    college: 'كلية الحقوق',
    grade: 'السنة الثالثة',
    roomNumber: '305',
    housingDate: '2024-03-10',
    photo: 'https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
];

export const logs: LogEntry[] = [
  {
    id: '1',
    user: 'مدير النظام',
    action: 'إضافة طالب جديد',
    date: '2024-12-17',
    time: '09:30',
    entity: 'أحمد محمد علي',
  },
  {
    id: '2',
    user: 'موظف السكن',
    action: 'تعديل بيانات طالب',
    date: '2024-12-17',
    time: '10:15',
    entity: 'فاطمة حسن الزهراني',
  },
  {
    id: '3',
    user: 'مدير النظام',
    action: 'حذف طالب',
    date: '2024-12-16',
    time: '14:20',
    entity: 'محمد سعيد الأحمدي',
  },
  {
    id: '4',
    user: 'موظف السكن',
    action: 'إضافة غرفة جديدة',
    date: '2024-12-16',
    time: '11:00',
    entity: 'غرفة رقم 401',
  },
  {
    id: '5',
    user: 'مدير النظام',
    action: 'تعديل صلاحيات مستخدم',
    date: '2024-12-15',
    time: '08:45',
    entity: 'موظف السكن',
  },
];

export const colleges = [
  'كلية الهندسة',
  'كلية الطب',
  'كلية العلوم',
  'كلية الآداب',
  'كلية إدارة الأعمال',
  'كلية الصيدلة',
  'كلية الحقوق',
  'كلية التربية',
];

export const grades = [
  'السنة الأولى',
  'السنة الثانية',
  'السنة الثالثة',
  'السنة الرابعة',
  'السنة الخامسة',
];
