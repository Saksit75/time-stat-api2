const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient();

const getAllNameTitles = async () => {
  return await prisma.name_title.findMany({
    orderBy: { id: 'asc' }
  });
};

const getNameTitleById = async (id) => {
  return await prisma.name_title.findUnique({ 
    where: { id } 
  });
};

const createNameTitle = async (data) => {
  // ตรวจสอบว่า title_th ซ้ำหรือไม่
  const existingTitle = await prisma.name_title.findFirst({
    where: { title_th: data.title_th }
  });

  if (existingTitle) {
    const error = new Error('ชื่อยศภาษาไทยซ้ำในฐานข้อมูล');
    error.statusCode = 409;
    throw error;
  }

  try {
    return await prisma.name_title.create({ 
      data: {
        ...data,
        create_date: new Date(),
        update_date: new Date()
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Error('ชื่อยศซ้ำในฐานข้อมูล');
    }
    throw err;
  }
};

const updateNameTitle = async (id, data) => {
  // ตรวจสอบว่า title_th ซ้ำหรือไม่ (ยกเว้นตัวเอง)
  if (data.title_th) {
    const existingTitle = await prisma.name_title.findFirst({
      where: { 
        title_th: data.title_th,
        id: { not: id }
      }
    });

    if (existingTitle) {
      const error = new Error('ชื่อยศภาษาไทยซ้ำในฐานข้อมูล');
      error.statusCode = 409;
      throw error;
    }
  }

  try {
    return await prisma.name_title.update({ 
      where: { id }, 
      data: {
        ...data,
        update_date: new Date()
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Error('ชื่อยศซ้ำในฐานข้อมูล');
    }
    throw err;
  }
};

const deleteNameTitle = async (id) => {
  // ตรวจสอบว่ามีการใช้งาน name_title นี้อยู่หรือไม่
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

  return await prisma.name_title.delete({ 
    where: { id } 
  });
};

const searchNameTitles = async (searchTerm) => {
  return await prisma.name_title.findMany({
    where: {
      OR: [
        { title_th: { contains: searchTerm } },
        { title_en: { contains: searchTerm } }
      ]
    },
    orderBy: { id: 'asc' }
  });
};

module.exports = { 
  getAllNameTitles, 
  getNameTitleById, 
  createNameTitle, 
  updateNameTitle, 
  deleteNameTitle,
  searchNameTitles
};
