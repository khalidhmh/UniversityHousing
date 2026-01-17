const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // تشفير الباسورد
  const hashedPassword = await bcrypt.hash('password123', 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: 'manager@test.com',
        password: hashedPassword,
        name: 'Admin Manager',
        role: 'ADMIN' // لو حصل خطأ هنا امسح السطر ده، ممكن يكون الـ Role مش موجود في الداتابيز بتاعتك
      },
    });
    console.log('✅ تم إنشاء المدير بنجاح:', user.email);
  } catch (e) {
    console.error('❌ حدث خطأ:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();