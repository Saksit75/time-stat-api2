const { z } = require('zod');

// Schema สำหรับสร้างนักเรียน
const createStudentSchema = z.object({
  title: z.coerce.number().int().optional(),
  first_name: z.string().min(1, 'กรุณากรอกชื่อ').max(100),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล').max(100),
  gender: z.enum(['m', 'f']).optional(),
  id_card: z.string().length(13, 'เลขบัตรประชาชนต้องเป็น 13 หลัก').optional().or(z.literal('')),
  detail: z.string().max(100).or(z.literal('')).optional(),
  class_level: z.coerce.number().int().optional(),
});

// Schema สำหรับแก้ไขนักเรียน (ทุก field เป็น optional)
const updateStudentSchema = createStudentSchema.partial();

// Schema สำหรับดึงนักเรียนตาม id
const getStudentSchema = z.object({
  id: z.number().int().min(1, 'id ต้องเป็นตัวเลขบวก')
});

// Schema สำหรับดึงนักเรียนทั้งหมด (สามารถเพิ่ม query params เช่น page, limit, filter)
const getAllStudentsSchema = z.object({
  page: z.number().int().min(1).optional(),      // หน้า pagination
  limit: z.number().int().min(1).max(100).optional(), // จำนวนรายการต่อหน้า
  search: z.string().optional(),                // ค้นหาตามชื่อหรืออื่น ๆ
  class_level: z.string().optional()            // กรองตามระดับชั้น
});

module.exports = { 
  createStudentSchema, 
  updateStudentSchema, 
  getStudentSchema, 
  getAllStudentsSchema 
};
