Account Workshop

ระบบสมัครสมาชิก เข้าสู่ระบบ และจัดการสมาชิกด้วย Express.js และ MongoDB

การติดตั้ง

npm install

การเปิดใช้งาน

npm run dev

เข้าใช้งานผ่านเบราว์เซอร์ที่ http://localhost:3000

API Endpoints

GET / - หน้าเว็บหลัก
POST /api/register - สมัครสมาชิก
POST /api/login - เข้าสู่ระบบ
GET /api/users - ดึงข้อมูลสมาชิกทั้งหมด
DELETE /api/users/:id - ลบข้อมูลสมาชิกตาม ID

ภาพหลักฐานการทำงาน

หน้าเว็บและการทดสอบระบบ
![alt text](web-1.png)
การเชื่อมต่อเซิร์ฟเวอร์และฐานข้อมูล
![alt text](MongoDB_connect-1.png)
ข้อมูลใน MongoDB Compass
![alt text](MongoDB_data-1.png)