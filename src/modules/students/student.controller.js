const studentService = require('./student.service');

const createStudent = async (req, res, next) => {
  const userActionId = req.middlewareUser.id;
  try {
    if (req.file) {
      req.body.file = req.file; // ส่งทั้ง object ไป model
    }
    const newStudent = await studentService.createStudent(req.body, Number(userActionId));
    res.status(201).json({
      success: true,
      message: 'created successfully',
      data: newStudent
    });
  } catch (err) {
     console.log("errorCreate : ",err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};
const updateStudent = async (req, res, next) => {
  const userActionId = req.middlewareUser.id;
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID ต้องเป็นตัวเลข' });
    }
    const updateData = req.body;
    if (req.file) {
      updateData.file = req.file; 
    }
    const student = await studentService.updateStudent(id, updateData, Number(userActionId));
    res.json({ success: true, data: student });

  } catch (err) {
    console.log("errorUpdate : ",err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
   
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const class_level = Number(req.query.classLevel) || null;
    const page = Number(req.query.page) || null;
    const limit = Number(req.query.limit) || null;
    const students = await studentService.getAllStudents(status, class_level, page, limit);
    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบนักเรียน'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};


const deleteStudent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    await studentService.deleteStudent(id);

    res.json({
      success: true,
      message: 'ลบนักเรียนสำเร็จ'
    });
  } catch (err) {
    next(err);
  }
};

const getStudentByClassLevelId = async (req, res, next) => {
  try {
    const classLevelId = parseInt(req.params.id);

    if (isNaN(classLevelId)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    const students = await studentService.getStudentByClassLevelId(classLevelId);

    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

const getSomeStudents = async (req, res, next) => {
  try {
    const query = req.query.q || null;
    const students = await studentService.getSomeStudents(query);
    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    next(err);
  }
};
const upClassLevel = async (req, res, next) => {
  try {
    const sIds = Array.isArray(req.body.sIds) ? req.body.sIds : [];


    console.log("sIds:", sIds);

    const result = await studentService.upClassLevel(sIds);

    return res.json({
      success: true,
      message: "เลื่อนชั้นเรียบร้อย",
      data: result,
    });

  } catch (err) {
    next(err);
  }
};

const updateStudentNumber = async (req, res, next) => {
  const userActionId = req.middlewareUser.id;
  const students = req.body
  console.log("data : ", req.body);
  // return;
  try {

    const result = await studentService.updateStudentNumber(students, userActionId);
    return res.json({
      success: true,
      message: "เลื่อนชั้นเรียบร้อย",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByClassLevelId,
  getSomeStudents,
  upClassLevel,
  updateStudentNumber
};