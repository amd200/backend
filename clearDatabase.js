import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// إعداد الاتصال بقاعدة البيانات باستخدام pg
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // تعيين مهلة الاتصال بـ 10 ثوانٍ
  ssl: { rejectUnauthorized: false }  // إضافة هذا في حالة الحاجة إلى SSL
});

// دالة لمسح البيانات من الجداول
async function clearDatabase() {
  try {
    // فتح الاتصال بقاعدة البيانات
    await client.connect();
    console.log('Connected to the database.');

    // مسح البيانات من جميع الجداول
    await client.query(`
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN 
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
              EXECUTE 'TRUNCATE TABLE public.' || r.tablename || ' RESTART IDENTITY CASCADE;';
          END LOOP; 
      END $$;
    `);

    console.log('All data cleared from the database!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await client.end();
    console.log('Connection closed.');
  }
}

// تنفيذ دالة مسح البيانات
clearDatabase();
