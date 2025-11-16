const argon2 = require('argon2');
const teacherModel = require('./teacher.model');
const { uploadImage, deleteImage } = require('../../utils/cloudinary');

const getAllTeachers = async (status, page, limit) => {
  return await teacherModel.getAllTeachers(status, page, limit);
};

const getTeacherById = async (id) => {
  return await teacherModel.getTeacherById(id);
};

const createTeacher = async (data, userActionId) => {
  try {
    if (data.password) {
      data.password = await argon2.hash(data.password, { type: argon2.argon2id });
    }

    // ถ้ามีไฟล์รูป
    if (data.file) {
      const result = await uploadImage(data.file.buffer,'teachers');
      data.photoUrl = result.secure_url;
      data.photoPublicId = result.public_id;
    }

    const result = await teacherModel.createTeacher(data, userActionId);
    return result;
  } catch (error) {
    console.error('Teacher service - error:', error);
    throw error;
  }
};

const updateTeacher = async (id, data, userActionId) => {
  try {
    if (data.file) {
      const teacher = await teacherModel.getTeacherById(id);
      if (teacher?.photo_id) {
        await deleteImage(teacher.photo_id);
      }

      const result = await uploadImage(data.file.buffer);
      data.photoUrl = result.secure_url;
      data.photoPublicId = result.public_id;
    }

    return await teacherModel.updateTeacher(id, data, userActionId);
  } catch (error) {
    console.error('Teacher service - error:', error);
    throw error;
  }
};

const deleteTeacher = async (id) => {
  try {
    const teacher = await teacherModel.getTeacherById(id);
    if (teacher?.photo_id) {
      await deleteImage(teacher.photo_id);
    }
    return await teacherModel.deleteTeacher(id);
  } catch (error) {
    console.error('Teacher service - error:', error);
    throw error;
  }
};

const getTeacherPhoto = async (id) => {
  return await teacherModel.getTeacherPhoto(id);
};

module.exports = { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getTeacherPhoto };
