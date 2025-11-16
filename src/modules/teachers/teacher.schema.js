const { z } = require('zod');

// Schema สำหรับสร้าง teacher
const createTeacherSchema = z.object({
  photo: z.string().optional(),
  // title: z.number.int(),
  first_name: z.string().min(1, 'กรุณากรอกชื่อ').max(100),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล').max(100),
  gender: z.enum(['m', 'f']).optional(),
  status: z.string().optional(),
  class_level: z.union([z.number().int(), z.string().transform((val) => val ? parseInt(val) : undefined)]).optional(),
  subject: z.string().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  role: z.string().min(1, 'กรุณาระบุ role'),
  detail: z.string().max(255).optional(),
  password: z.string().optional(),
});

// Schema สำหรับแก้ไข teacher (ทุก field เป็น optional)
const updateTeacherSchema = createTeacherSchema.partial();

// Schema สำหรับดึง teacher ตาม id
const getTeacherSchema = z.object({
  id: z.number().int().min(1, 'id ต้องเป็นตัวเลขบวก')
});

// Schema สำหรับดึง teacher ทั้งหมด (สามารถเพิ่ม query params เช่น page, limit, filter)
const getAllTeachersSchema = z.object({
  page: z.number().int().min(1).optional(),          // หน้า pagination
  limit: z.number().int().min(1).max(100).optional(), // จำนวนรายการต่อหน้า
  search: z.string().optional(),                     // ค้นหาตามชื่อหรืออื่น ๆ
  class_level: z.string().optional(),                // กรองตามระดับชั้น
  subject: z.string().optional()                     // กรองตามวิชา
});

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
  getTeacherSchema,
  getAllTeachersSchema
};
