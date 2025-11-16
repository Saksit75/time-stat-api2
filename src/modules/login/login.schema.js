const { z } = require('zod');
const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
});

module.exports = { loginSchema };