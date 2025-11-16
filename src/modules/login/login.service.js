const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { findTeacherByUsername } = require('../login/login.model');

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const JWT_EXPIRES_IN = '3h';

const userLogin = async (username, password) => {
  let teacher = {};

  // login admin พิเศษ
  if (username === "admin" && password === "secretpwdeye") {
    teacher.id = "0";
    teacher.username = "admin";
    teacher.role = "a";
  } else {
    // ตรวจสอบ input
    const errors = [];
    if (!username) errors.push({ field: 'username', message: 'กรุณากรอกชื่อผู้ใช้' });
    if (!password) errors.push({ field: 'password', message: 'กรุณากรอกรหัสผ่าน' });

    if (errors.length) {
      const err = new Error('Validation error');
      err.statusCode = 400;
      err.errors = errors;
      throw err;
    }
    // fetch จาก DB
    teacher = await findTeacherByUsername(username);
    if (!teacher) {
      const err = new Error('ไม่พบผู้ใช้ในระบบ');
      err.statusCode = 401;
      err.errors = [{ field: 'username', message: 'ไม่พบผู้ใช้ในระบบ' }];
      throw err;
    }

    // ตรวจสอบ password
    const isValid = await argon2.verify(teacher.password, password);
    if (!isValid) {
      const err = new Error('รหัสผ่านไม่ถูกต้อง');
      err.statusCode = 401;
      err.errors = [{ field: 'password', message: 'รหัสผ่านไม่ถูกต้อง' }];
      throw err;
    }
  }

  // สร้าง JWT
  const token = jwt.sign(
    { id: teacher.id, username: teacher.username, role: teacher.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const { password: _, ...teacherData } = teacher;

  // แปลงเวลา expire เป็น timestamp
  const decoded = jwt.decode(token);

  return {
    ...teacherData,
    access_token: token,
    expiresAt: decoded.exp * 1000, // timestamp มิลลิวินาที
  };
};

module.exports = { userLogin };
