const { z } = require('zod');

// Schema สำหรับสร้าง name_title
const createNameTitleSchema = z.object({
  title_th: z.string()
    .min(1, 'กรุณากรอกชื่อยศภาษาไทย')
    .max(100, 'ชื่อยศภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
    .trim(),
  title_en: z.string()
    .max(100, 'ชื่อยศภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  create_by: z.number()
    .int()
    .min(1, 'create_by ต้องเป็นตัวเลขบวก')
    .optional()
    .nullable()
});

// Schema สำหรับแก้ไข name_title (ทุก field เป็น optional)
const updateNameTitleSchema = z.object({
  title_th: z.string()
    .min(1, 'ชื่อยศภาษาไทยต้องไม่เป็นค่าว่าง')
    .max(100, 'ชื่อยศภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  title_en: z.string()
    .max(100, 'ชื่อยศภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  update_by: z.number()
    .int()
    .min(1, 'update_by ต้องเป็นตัวเลขบวก')
    .optional()
    .nullable()
});

// Schema สำหรับดึง name_title ตาม id
const getNameTitleSchema = z.object({
  id: z.number()
    .int()
    .min(1, 'ID ต้องเป็นตัวเลขบวก')
});

// Schema สำหรับค้นหา name_title
const searchNameTitlesSchema = z.object({
  q: z.string()
    .min(1, 'กรุณากรอกคำค้นหา')
    .max(100, 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร')
    .optional()
});

// Schema สำหรับดึง name_title ทั้งหมด (สามารถเพิ่ม query params)
const getAllNameTitlesSchema = z.object({
  page: z.number()
    .int()
    .min(1, 'หน้า pagination ต้องเป็นตัวเลขบวก')
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
  createNameTitleSchema,
  updateNameTitleSchema,
  getNameTitleSchema,
  searchNameTitlesSchema,
  getAllNameTitlesSchema
};
