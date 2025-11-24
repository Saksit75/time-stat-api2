const { de } = require("zod/locales");
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const argon2 = require("argon2");

const getAllTeachers = async (status = null, page = null, limit = null) => {
  const whereClause = {};
  if (status !== null) {
    whereClause.status = status;
  }
  const pageNum = page ? Number(page) : null;
  const limitNum = limit ? Number(limit) : null;
  const queryOptions = {
    where: whereClause,
    orderBy: [
      { status: "asc" },
      { id: "desc" },
    ],
    include: {
      title_relation: true,
      class_level_relation: true,
    },
  };
  if (pageNum && limitNum) {
    queryOptions.skip = (pageNum - 1) * limitNum;
    queryOptions.take = limitNum;
  }
  const teachers = await prisma.teacher.findMany(queryOptions);
  if (pageNum && limitNum) {
    const total = await prisma.teacher.count({ where: whereClause });
    const totalPages = Math.ceil(total / limitNum);
    return {
      teachers,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    };
  } else {
    return {
      teachers,
      total: teachers.length,
      totalPages: 1,
      currentPage: 1,
      limit: teachers.length,
    };
  }
};

const getTeacherById = async (id) => {
  return await prisma.teacher.findUnique({
    where: { id },
    include: { title_relation: true, class_level_relation: true },
  });
};

const createTeacher = async (data, userActionId) => {
  try {
    if (data.password && !data.username) {
      throw new Error("หากมีรหัสผ่าน ต้องระบุชื่อผู้ใช้ด้วย");
    }

    if (data.username && data.username.trim() !== "") {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { username: data.username },
      });
      if (existingTeacher) {
        const error = new Error("ชื่อผู้ใช้ถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.class_level !== undefined && data.class_level !== null) {
      data.class_level = parseInt(data.class_level);
      if (isNaN(data.class_level)) {
        throw new Error("class_level ต้องเป็นตัวเลขที่ถูกต้อง");
      }
    }

    if (data.title) data.title = parseInt(data.title);
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    const prismaData = {
      ...data,
      username: data.username || undefined,
      class_level: data.class_level || undefined,
      title: data.title || undefined,
      photo_id: data.photoPublicId || undefined,
      photo: data.photoUrl || undefined,
      create_by: Number(userActionId),
      update_by: Number(userActionId),
    };
    delete prismaData.file;
    delete prismaData.photoPublicId;
    delete prismaData.photoUrl;

    const result = await prisma.teacher.create({ data: prismaData });
    return result;
  } catch (err) {
      throw new Error("ชื่อผู้ใช้ซ้ำในฐานข้อมูล");
    // throw err;
  }
};

const updateTeacher = async (id, data, userActionId) => {
  try {
    if (data.password && !data.username) {
      throw new Error("หากมีรหัสผ่าน ต้องระบุชื่อผู้ใช้ด้วย");
    }

    if (data.username && data.username.trim() !== "") {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          username: data.username,
          NOT: { id: id },
        },
      });
      if (existingTeacher) {
        const error = new Error("ชื่อผู้ใช้ถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.class_level !== undefined && data.class_level !== null) {
      data.class_level = parseInt(data.class_level);
      if (isNaN(data.class_level)) {
        throw new Error("class_level ต้องเป็นตัวเลขที่ถูกต้อง");
      }
    }

    if (data.title) data.title = parseInt(data.title);
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    const prismaData = {
      ...data,
      username: data.username || undefined,
      class_level: data.class_level || undefined,
      title: data.title || undefined,
      update_by: Number(userActionId),
      update_date: new Date(),
    };
    if (data.photoUrl) {
      prismaData.photo = data.photoUrl;
      prismaData.photo_id = data.photoPublicId;
    }
    delete prismaData.file;
    delete prismaData.photoPublicId;
    delete prismaData.photoUrl;

    const result = await prisma.teacher.update({ where: { id }, data: prismaData });
    return result;
  } catch (err) {
    throw err;
  }
};

const deleteTeacher = async (id) => {
  return await prisma.teacher.delete({ where: { id } });
};

const getTeacherPhoto = async (id) => {
  return await prisma.teacher.findUnique({ where: { id }, select: { photo: true } });
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherPhoto
};
