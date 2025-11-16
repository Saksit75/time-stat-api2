const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const getAllStudents = async (status = null, class_level = null, page = null, limit = null) => {
  const whereClause = {};
  if (status !== null) {
    whereClause.status = status;
  }
  if (class_level !== null) {
    whereClause.class_level = class_level;
  }
  const pageNum = page ? Number(page) : null;
  const limitNum = limit ? Number(limit) : null;
  const queryOptions = {
    where: whereClause,
    orderBy: [
      { status: "asc" },
      { class_level: "asc" },
      { student_number: "asc" },
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
  const students = await prisma.student.findMany(queryOptions);
  if (pageNum && limitNum) {
    const total = await prisma.student.count({ where: whereClause });
    const totalPages = Math.ceil(total / limitNum);
    return {
      students,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    };
  } else {
    return {
      students,
      total: students.length,
      totalPages: 1,
      currentPage: 1,
      limit: students.length,
    };
  }
};


const getStudentById = async (id) => {
  return await prisma.student.findUnique({ where: { id }, include: { title_relation: true, class_level_relation: true }, });
};

const createStudent = async (data, userActionId) => {
  try {
    if (data.id_card) {
      const existIdCard = await prisma.student.findFirst({ where: { id_card: data.id_card } });
      if (existIdCard) {
        const error = new Error("รหัสบัตรประชาชนถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
      if (data.id_card.length !== 13) {
        throw new Error('หมายเลขบัตรประชาชนต้องเป็น 13 หลัก');
      }
    }

    if (data.student_id) {
      const existStudentId = await prisma.student.findFirst({ where: { student_id: data.student_id } });
      if (existStudentId) {
        const error = new Error("รหัสนักเรียนถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.student_number && data.class_level) {
      const existStudent = await prisma.student.findFirst({
        where: {
          student_number: data.student_number,
          class_level: Number(data.class_level),
          NOT: { status: "out" },
        },
      });
      if (existStudent) {
        const error = new Error(`เลขที่นักเรียน ${data.student_number} ในระดับชั้นนี้ถูกใช้แล้ว`);
        error.statusCode = 409;
        throw error;
      }
    }

    const studentData = {
      ...data,
      title: data.title ? Number(data.title) : undefined,
      class_level: data.class_level ? Number(data.class_level) : undefined,
      photo_id: data.photoPublicId || null,
      photo: data.photoUrl || null,
      create_by: Number(userActionId),
      update_by: Number(userActionId)
    };
    delete studentData.file;
    delete studentData.photoPublicId;
    delete studentData.photoUrl;

    const result = await prisma.student.create({ data: studentData });
    return result;

  } catch (err) {
    console.error(err);
    throw err;
  }
};


const updateStudent = async (id, data, userActionId) => {
  try {
    if (data.id_card) {
      const existIdCard = await prisma.student.findFirst(
        {
          where: {
            id_card: data.id_card,
            NOT: { id: id }
          }
        }
      );
      if (existIdCard) {
        const error = new Error("รหัสบัตรประชาชนถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
      if (data.id_card.length !== 13) {
        throw new Error('หมายเลขบัตรประชาชนต้องเป็น 13 หลัก');
      }
    }

    if (data.student_id) {
      const existStudentId = await prisma.student.findFirst({
        where: {
          student_id: data.student_id,
          NOT: { id: id },
        },
      });

      if (existStudentId) {
        const error = new Error("รหัสนักเรียนถูกใช้แล้ว");
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.student_number && data.class_level) {
      const existStudent = await prisma.student.findFirst({
        where: {
          student_number: data.student_number,
          class_level: Number(data.class_level),
          status: { not: "out" },
          NOT: { id: id },
        },
      });
      if (existStudent) {
        const error = new Error(`เลขที่นักเรียน ${data.student_number} ในระดับชั้นนี้ถูกใช้แล้ว`);
        error.statusCode = 409;
        throw error;
      }
    }

    const studentData = {
      ...data,
      title: data.title ? Number(data.title) : undefined,
      class_level: data.class_level ? Number(data.class_level) : undefined,
      update_by: Number(userActionId),
      update_date: new Date(),
    };
    if (data.photoUrl) {
      studentData.photo = data.photoUrl;
      studentData.photo_id = data.photoPublicId;
    }
    delete studentData.file;
    delete studentData.photoPublicId;
    delete studentData.photoUrl;

    // สร้าง student จริง
    const result = await prisma.student.update({ where: { id }, data: studentData });
    return result;

  } catch (err) {
    console.error(err);
    throw err;
  }
};

const deleteStudent = async (id) => {
  return await prisma.student.delete({ where: { id } });
};

const getStudentByClassLevelId = async (class_level) => {
  try {
    const students = await prisma.student.findMany({
      where: { class_level, status: "in" },
      include: { title_relation: true, class_level_relation: true },
    });

    const classLevel = await prisma.class_level.findFirst({
      where: { id: class_level },
    });

    return { students, classLevel };
  } catch (error) {
    console.error("Error fetching students by class level:", error);
    throw new Error("Failed to fetch students by class level");
  }
};

const getSomeStudents = async (query = null) => {
  let q = query;
  console.log("q : ", query);

  if (!query || query.trim() === "") {
    // ไม่มีคำค้น → ดึงมาแค่ 20 คน
    return await prisma.$queryRaw`
  SELECT 
    s.id,
    s.student_number AS student_number,
    s.first_name AS first_name,
    s.last_name AS last_name,
    t.title_th AS title,
    c.class_level_th AS class_level
  FROM student s
  LEFT JOIN class_level c ON s.class_level = c.id
  LEFT JOIN name_title t ON s.title = t.id
  ORDER BY s.class_level ASC, s.student_number ASC
  LIMIT 20;
`;
  }

  // ถ้ามีคำค้น → ค้นหาตามชื่อ, นามสกุล หรือเลขประจำตัว
  return await prisma.$queryRaw`
  SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.student_number,
    c.class_level_th as class_level,
    t.title_th as title
  FROM student s
  LEFT JOIN class_level c ON s.class_level = c.id
  LEFT JOIN name_title t ON s.title = t.id
  WHERE CONCAT(t.title_th, s.first_name, ' ', s.last_name) LIKE ${'%' + q + '%'}
  ORDER BY s.class_level ASC, s.student_number ASC
  LIMIT 20;
`;
};

const upClassLevel = async (sIds) => {
  try {
    const result = "";
    if (sIds.length <= 0) {
      result = await prisma.student.updateMany({
        where: {
          class_level: {
            lt: 12 // less than เลื่อนเฉพาะคนที่ชั้นน้อยกว่า 12
          }
        },
        data: {
          class_level: {
            increment: 1
          }
        }
      });
    } else {
      result = await prisma.student.updateMany({
        where: {
          id: { notIn: sIds },
          class_level: { lt: 12 }
        },
        data: {
          class_level: { increment: 1 }
        }
      });

      const selectedStudents = await prisma.student.findMany({
        where: { id: { in: sIds } },
        select: { id: true, class_level: true, student_number: true },
        orderBy: [
          { class_level: "asc" },
          { student_number: "asc" },
        ],
      });

      //ดึงเลขที่สูงสุดของแต่ละชั้น
      const classMaxNumbers = await prisma.student.groupBy({
        by: ["class_level"],
        _max: { student_number: true },
      });

      // แปลงข้อมูลให้ง่ายต่อการ lookup
      const maxMap = {};
      for (const row of classMaxNumbers) {
        maxMap[row.class_level] = row._max.student_number || 0;
      }

      //สร้าง list สำหรับ update
      const updates = [];
      for (const student of selectedStudents) {
        const currentMax = maxMap[student.class_level] || 0;
        const newNumber = currentMax + 1;

        // อัปเดตค่า max ของชั้นนั้น
        maxMap[student.class_level] = newNumber;

        updates.push(
          prisma.student.update({
            where: { id: student.id },
            data: { student_number: newNumber },
          })
        );
      }
      await prisma.$transaction(updates);
    }

    return result;
  } catch (error) {
    console.error("Error upClassLevel:", error);
    throw error;
  }
}

const updateStudentNumber = async (students, userActionId) => {

  if (students.length <= 0) {
    throw new Error('ไม่พบข้อมูลนักเรียน');
  }
  try {
    const queries = students.data.map((student) =>
      prisma.student.update({
        where: { id: student.id },
        data: {
          student_number: String(student.studentNumber),
          update_by: userActionId,
          update_date: new Date(),
        }
      })
    )

    // ✅ รันทุกคำสั่งใน transaction เดียว
    const result = await prisma.$transaction(queries)
    return result
  } catch (error) {
    console.error("Error updateStudentNumber:", error)
    throw error
  }
}

module.exports = { getAllStudents, createStudent, getStudentById, updateStudent, deleteStudent, getStudentByClassLevelId, getSomeStudents, upClassLevel, updateStudentNumber };