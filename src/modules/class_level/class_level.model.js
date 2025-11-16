const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient();

const getAllClassLevels = async () => {
  return await prisma.class_level.findMany({
    orderBy: { id: 'asc' }
  });
};

const getClassLevelById = async (id) => {
  return await prisma.class_level.findUnique({ 
    where: { id } 
  });
};

const createBulkClassLevels = async (dataArray) => {
  if (!Array.isArray(dataArray)) {
    const error = new Error('ข้อมูลต้องเป็น array');
    error.statusCode = 400;
    throw error;
  }
  const titles = dataArray.map(item => item.class_level_th.trim());
  const uniqueTitles = new Set(titles);
  if (titles.length !== uniqueTitles.size) {
    const error = new Error('พบชื่อระดับชั้นภาษาไทยซ้ำกันในข้อมูลที่ส่งมา');
    error.statusCode = 400;
    throw error;
  }
  const existingLevels = await prisma.class_level.findMany({
    where: {
      class_level_th: { in: titles }
    }
  });

  if (existingLevels.length > 0) {
    const duplicates = existingLevels.map(l => l.class_level_th).join(', ');
    const error = new Error(`ชื่อระดับชั้นต่อไปนี้มีอยู่แล้วในฐานข้อมูล: ${duplicates}`);
    error.statusCode = 409;
    throw error;
  }

  // เพิ่มข้อมูลทั้งหมดในครั้งเดียว
  const now = new Date();
  try {
    const result = await prisma.class_level.createMany({
      data: dataArray.map(item => ({
        class_level_th: item.class_level_th.trim(),
        class_level_en: item.class_level_en?.trim() || null,
        create_by: item.create_by || null,
        create_date: now,
        update_by: item.update_by || null,
        update_date: now
      })),
      skipDuplicates: true // ข้ามถ้ามีซ้ำใน DB
    });

    return {
      count: result.count,
      message: `เพิ่มข้อมูล ${result.count} รายการสำเร็จ`
    };
  } catch (err) {
    throw err;
  }
};


const updateClassLevel = async (id, data) => {
  // ตรวจสอบว่า class_level_th ซ้ำหรือไม่ (ยกเว้นตัวเอง)
  if (data.class_level_th) {
    const existingTitle = await prisma.class_level.findFirst({
      where: { 
        class_level_th: data.class_level_th,
        id: { not: id }
      }
    });

    if (existingTitle) {
      const error = new Error('ชั้นภาษาไทยซ้ำในฐานข้อมูล');
      error.statusCode = 409;
      throw error;
    }
  }

  try {
    return await prisma.class_level.update({ 
      where: { id }, 
      data: {
        ...data,
        update_date: new Date()
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Error('ชั้นซ้ำในฐานข้อมูล');
    }
    throw err;
  }
};

const deleteClassLevel = async (id) => {
  // ตรวจสอบว่ามีการใช้งาน class_level นี้อยู่หรือไม่
  const isUsedInTeacher = await prisma.teacher.findFirst({
    where: { title: id }
  });

  const isUsedInStudent = await prisma.student.findFirst({
    where: { title: id }
  });

  if (isUsedInTeacher || isUsedInStudent) {
    const error = new Error('ไม่สามารถลบได้ เนื่องจากมีการใช้งานอยู่');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.class_level.delete({ 
    where: { id } 
  });
};

const searchClassLevels = async (searchTerm) => {
  return await prisma.class_level.findMany({
    where: {
      OR: [
        { class_level_th: { contains: searchTerm } },
        { class_level_en: { contains: searchTerm } }
      ]
    },
    orderBy: { id: 'asc' }
  });
};

const createClassLevel = async (data) => {
  // ตรวจสอบว่าชื่อระดับชั้นซ้ำหรือไม่
  const existingLevel = await prisma.class_level.findFirst({
    where: { class_level_th: data.class_level_th }
  });

  if (existingLevel) {
    const error = new Error('ชื่อระดับชั้นภาษาไทยซ้ำในฐานข้อมูล');
    error.statusCode = 409;
    throw error;
  }

  try {
    return await prisma.class_level.create({ 
      data: {
        ...data,
        create_date: new Date(),
        update_date: new Date()
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Error('ชื่อระดับชั้นซ้ำในฐานข้อมูล');
    }
    throw err;
  }
};

module.exports = { 
  getAllClassLevels, 
  getClassLevelById, 
  createClassLevel,
  createBulkClassLevels, 
  updateClassLevel, 
  deleteClassLevel,
  searchClassLevels
};
