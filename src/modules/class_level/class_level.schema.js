const { z } = require('zod');

// ✅ สร้าง Schema สำหรับเพิ่ม class_level เดียว
const createClassLevelSchema = z.object({
  class_level_th: z.string()
    .min(1, 'กรุณากรอกชื่อระดับชั้นภาษาไทย')
    .max(100, 'ชื่อระดับชั้นภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
    .trim(),
  class_level_en: z.string()
    .max(100, 'ชื่อระดับชั้นภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  // create_by: z.number()
  //   .int()
  //   .min(1, 'create_by ต้องเป็นตัวเลขบวก')
  //   .optional()
  //   .nullable()
});

// ✅ สร้าง Schema สำหรับเพิ่ม class_level หลายรายการ
const createBulkClassLevelSchema = z.array(createClassLevelSchema)
  .min(1, 'ต้องมีข้อมูลอย่างน้อย 1 รายการ')
  .max(100, 'ไม่สามารถเพิ่มได้เกิน 100 รายการในครั้งเดียว');

// ✅ Schema สำหรับแก้ไข class_level (optional fields)
const updateClassLevelSchema = z.object({
  class_level_th: z.string()
    .min(1, 'ชื่อระดับชั้นภาษาไทยต้องไม่เป็นค่าว่าง')
    .max(100, 'ชื่อระดับชั้นภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  class_level_en: z.string()
    .max(100, 'ชื่อระดับชั้นภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  update_by: z.number()
    .int()
    .min(1, 'update_by ต้องเป็นตัวเลขบวก')
    .optional()
    .nullable()
});

// ✅ Schema สำหรับดึงข้อมูล class_level ตาม ID
const getClassLevelSchema = z.object({
  id: z.number()
    .int()
    .min(1, 'ID ต้องเป็นตัวเลขบวก')
});

// ✅ Schema สำหรับค้นหา class_level (ใช้ชื่อค้นหา)
const searchClassLevelsSchema = z.object({
  q: z.string()
    .min(1, 'กรุณากรอกคำค้นหา')
    .max(100, 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร')
    .optional()
});

// ✅ Schema สำหรับดึง class_level ทั้งหมด (รองรับ pagination)
const getAllClassLevelsSchema = z.object({
  page: z.number()
    .int()
    .min(1, 'หน้าที่ดึงข้อมูลต้องเป็นตัวเลขบวก')
    .optional(),
  limit: z.number()
    .int()
    .min(1, 'จำนวนรายการต่อหน้าต้องเป็นตัวเลขบวก')
    .max(100, 'จำนวนรายการต่อหน้าต้องไม่เกิน 100')
    .optional(),
  search: z.string()
    .max(100, 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร')
    .optional()
});

module.exports = {
  createClassLevelSchema,
  createBulkClassLevelSchema,
  updateClassLevelSchema,
  getClassLevelSchema,
  searchClassLevelsSchema,
  getAllClassLevelsSchema
};
