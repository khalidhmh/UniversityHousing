/**
 * === Prisma Seed Script ===
 * 
 * Populates the database with test data:
 * - 1 Admin User (admin / admin123)
 * - 1 Supervisor User (supervisor / supervisor123)
 * - 10 Dummy Students
 * 
 * Usage:
 *   npx prisma db seed
 * 
 * Note: This script uses bcryptjs to hash passwords
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean up existing data (optional - comment out to preserve)
  // await prisma.log.deleteMany({});
  // await prisma.student.deleteMany({});
  // await prisma.user.deleteMany({});

  try {
    // ============================================
    // 1. CREATE ADMIN USER
    // ============================================
    console.log('👤 Creating Admin User...');
    
    const adminPassword = await bcryptjs.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        fullName: 'مسؤول النظام | System Administrator',
        role: 'MANAGER',
      },
    });
    console.log('✅ Admin User Created:', adminUser.username);

    // ============================================
    // 2. CREATE SUPERVISOR USER
    // ============================================
    console.log('\n👤 Creating Supervisor User...');
    
    const supervisorPassword = await bcryptjs.hash('supervisor123', 10);
    const supervisorUser = await prisma.user.upsert({
      where: { username: 'supervisor' },
      update: {},
      create: {
        username: 'supervisor',
        password: supervisorPassword,
        fullName: 'فريج علي الشمري | Supervisor User',
        role: 'SUPERVISOR',
      },
    });
    console.log('✅ Supervisor User Created:', supervisorUser.username);

    // ============================================
    // 3. CREATE DUMMY STUDENTS
    // ============================================
    console.log('\n🎓 Creating Dummy Students...');

    const dummyStudents = [
      {
        nationalId: '1234567890',
        name: 'أحمد محمد علي',
        registrationNumber: 'STD2024001',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية الهندسة',
        level: 'السنة الأولى',
        roomNumber: '101',
        housingDate: '2024-01-15',
        photoPath: null,
      },
      {
        nationalId: '0987654321',
        name: 'فاطمة حسن الزهراني',
        registrationNumber: 'STD2024002',
        universityType: 'أهلية',
        accommodationType: 'مميز',
        college: 'كلية الطب',
        level: 'السنة الرابعة',
        roomNumber: '205',
        housingDate: '2024-01-20',
        photoPath: null,
      },
      {
        nationalId: '1122334455',
        name: 'عمر خالد السعيد',
        registrationNumber: 'STD2024003',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية العلوم',
        level: 'السنة الثانية',
        roomNumber: '103',
        housingDate: '2024-02-01',
        photoPath: null,
      },
      {
        nationalId: '2233445566',
        name: 'مريم عبدالله القحطاني',
        registrationNumber: 'STD2024004',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية الآداب',
        level: 'السنة الأولى',
        roomNumber: '208',
        housingDate: '2024-02-10',
        photoPath: null,
      },
      {
        nationalId: '3344556677',
        name: 'سارة أحمد الغامدي',
        registrationNumber: 'STD2024005',
        universityType: 'أهلية',
        accommodationType: 'مميز',
        college: 'كلية إدارة الأعمال',
        level: 'السنة الثالثة',
        roomNumber: '301',
        housingDate: '2024-02-15',
        photoPath: null,
      },
      {
        nationalId: '4455667788',
        name: 'يوسف عبدالرحمن المالكي',
        registrationNumber: 'STD2024006',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية الهندسة',
        level: 'السنة الرابعة',
        roomNumber: '102',
        housingDate: '2024-03-01',
        photoPath: null,
      },
      {
        nationalId: '5566778899',
        name: 'ليلى محمود الجعفري',
        registrationNumber: 'STD2024007',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية التربية',
        level: 'السنة الثالثة',
        roomNumber: '315',
        housingDate: '2024-03-10',
        photoPath: null,
      },
      {
        nationalId: '6677889900',
        name: 'محمد علي سالم',
        registrationNumber: 'STD2024008',
        universityType: 'أهلية',
        accommodationType: 'مميز',
        college: 'كلية الهندسة',
        level: 'السنة الثانية',
        roomNumber: '401',
        housingDate: '2024-03-15',
        photoPath: null,
      },
      {
        nationalId: '7788990011',
        name: 'نور محمد الدوسري',
        registrationNumber: 'STD2024009',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية العلوم',
        level: 'السنة الأولى',
        roomNumber: '104',
        housingDate: '2024-04-01',
        photoPath: null,
      },
      {
        nationalId: '8899001122',
        name: 'خديجة حسين الحربي',
        registrationNumber: 'STD2024010',
        universityType: 'حكومية',
        accommodationType: 'عادي',
        college: 'كلية الآداب',
        level: 'السنة الرابعة',
        roomNumber: '209',
        housingDate: '2024-04-10',
        photoPath: null,
      },
    ];

    for (const student of dummyStudents) {
      const createdStudent = await prisma.student.upsert({
        where: { nationalId: student.nationalId },
        update: {},
        create: student,
      });
      console.log(
        `✅ Student Created: ${createdStudent.name} (${createdStudent.registrationNumber})`
      );
    }

    // ============================================
    // 4. CREATE SAMPLE LOGS
    // ============================================
    console.log('\n📝 Creating Sample Audit Logs...');

    await prisma.log.create({
      data: {
        action: 'LOGIN',
        details: JSON.stringify({
          username: 'admin',
          ip: '192.168.1.1',
          timestamp: new Date().toISOString(),
        }),
        userId: adminUser.id,
      },
    });

    console.log('✅ Sample logs created');

    // ============================================
    // 5. SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seed completed successfully!\n');

    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const logCount = await prisma.log.count();

    console.log('📊 Database Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Logs: ${logCount}\n`);

    console.log('🔐 Test Credentials:');
    console.log('   Admin:      admin / admin123');
    console.log('   Supervisor: supervisor / supervisor123\n');

    console.log('💡 Next Steps:');
    console.log('   1. Run: npm run electron-dev');
    console.log('   2. Login with test credentials');
    console.log('   3. Test the application\n');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

// Execute seed
main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✨ Seed script finished!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
