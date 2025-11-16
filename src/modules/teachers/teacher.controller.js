const teacherService = require('./teacher.service');

const createTeacher = async (req, res, next) => {
  const userActionId = req.middlewareUser.id;
  try {

    const newTeacherData = req.body;

    if (req.file) {
      newTeacherData.file = req.file;
    }
    const newTeacher = await teacherService.createTeacher(newTeacherData,Number(userActionId));
    res.status(201).json({
      success: true,
      message: 'created successfully',
      data: newTeacher
    });
  } catch (err) {
    next(err);
  }
};

const getAllTeachers = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const page = Number(req.query.page) || null;
    const limit = Number(req.query.limit) || null;
    const teachers = await teacherService.getAllTeachers(status,page,limit);
    res.json({
      success: true,
      data: teachers
    });
  } catch (err) {
    next(err);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    const teachers = await teacherService.getTeacherById(id);

    if (!teachers) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบบุคลากร'
      });
    }

    res.json({
      success: true,
      data: teachers
    });
  } catch (err) {
    next(err);
  }
};

const updateTeacher = async (req, res, next) => {
  const userActionId = req.middlewareUser.id;
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    const updateTeacher = req.body;

    if (req.file) {
      updateTeacher.file = req.file;
    }

    const teachers = await teacherService.updateTeacher(id, updateTeacher,userActionId);

    res.json({
      success: true,
      data: teachers
    });
  } catch (err) {
    next(err);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    await teacherService.deleteTeacher(id);

    res.json({
      success: true,
      message: 'ลบบุคากรสำเร็จ'
    });
  } catch (err) {
    next(err);
  }
};

const getTeacherPhoto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลข'
      });
    }

    const teacher = await teacherService.getTeacherPhoto(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบบุคลากร'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTeacher, getAllTeachers, getTeacherById, updateTeacher, deleteTeacher, getTeacherPhoto };