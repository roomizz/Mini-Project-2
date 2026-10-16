const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'account-db';
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static('public'));

let users = null;
const HIDE_PASSWORD = { projection: { passwordHash: 0 } };

// POST /api/register - สมัครสมาชิก
app.post('/api/register', async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'username ต้องเป็น a-z, 0-9 หรือ _ ยาว 3-20 ตัว' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' });
  }

  const user = { 
    username, 
    name, 
    email: email.toLowerCase(), 
    role: 'member', 
    createdAt: new Date() 
  };

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ ...user, passwordHash });
    res.status(201).json({ _id: result.insertedId, ...user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'username หรือ email ถูกใช้แล้ว' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// POST /api/login - เข้าสู่ระบบ
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await users.findOne({ username });
  const ok = user && (await bcrypt.compare(password ?? '', user.passwordHash));

  if (!ok) {
    return res.status(401).json({ error: 'username หรือรหัสผ่านไม่ถูกต้อง' });
  }

  await users.updateOne(
    { _id: user._id },
    { $inc: { loginCount: 1 },$set: { lastLoginAt: new Date() } }
  );

  res.json({
    message: 'เข้าสู่ระบบสำเร็จ',
    user: { username: user.username, name: user.name, role: user.role }
  });
});

// GET /api/users - ดึงรายชื่อสมาชิกทั้งหมด (ซ่อน passwordHash)
app.get('/api/users', async (req, res) => {
  const list = await users.find({}, HIDE_PASSWORD).sort({ createdAt: -1 }).toArray();
  res.json(list);
});

// DELETE /api/users/:username - ลบบัญชีผู้ใช้
app.delete('/api/users/:username', async (req, res) => {
  const result = await users.deleteOne({ username: req.params.username });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }
  res.status(204).end();
});

async function main() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  users = client.db(DATABASE_NAME).collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  console.log('เชื่อมต่อ MongoDB สำเร็จ');

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ', err.message);
  process.exit(1);
});