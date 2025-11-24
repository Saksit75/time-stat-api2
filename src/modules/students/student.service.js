const studentModel = require('./student.model');
const { uploadImage, deleteImage } = require('../../utils/cloudinary');

const getAllStudents = async (status, class_level, page, limit) => {
  return await studentModel.getAllStudents(status, class_level, page, limit);
};
const getStudentById = async (id) => {
  return await studentModel.getStudentById(id);
};

const createStudent = async (data, userActionId) => {
  try {
    if (data.file) {
      const result = await uploadImage(data.file.buffer, 'students');
      data.photoUrl = result.secure_url;
      data.photoPublicId = result.public_id;
    }
    const result = await studentModel.createStudent(data, userActionId);
    return result;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (id, data, userActionId) => {
  try {
    if (data.file) {
      const student = await studentModel.getStudentById(id);
      if (student?.photo_id) {
        await deleteImage(student.photo_id);
      }
      const result = await uploadImage(data.file.buffer, 'students');
      data.photoUrl = result.secure_url;
      data.photoPublicId = result.public_id;
    }
    return await studentModel.updateStudent(id, data, userActionId);
  } catch (error) {
    throw error;
  }
}


const deleteStudent = async (id) => {
  try {
    const student = await studentModel.getStudentById(id);
    if (student?.photo_id) {
      await deleteImage(student.photo_id);
    }
    return await studentModel.deleteStudent(id);
  } catch (error) {
    console.error("Error deleteStudent:", error);
    return { message: "เกิดข้อผิดพลาด", error: error.message };
  }
}




const getStudentByClassLevelId = async (class_level) => {
  try {
    const { students, classLevel } = await studentModel.getStudentByClassLevelId(class_level);
    const studentsByclass = (students || []).map((student) => ({ //studentsByclass ถูกสร้างจาก .map() ซึ่ง return เป็น array เสมอ
      id: student.id,
      student_id: student.student_id,
      student_number: student.student_number,
      title: student.title_relation.title_th,
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
    }));
    const data = {
      message: "success",
      class_id: class_level,
      class_level_th: classLevel?.class_level_th || null,
      data: studentsByclass,
    };
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error getStudentByClassLevelId:", error);
    return { message: "เกิดข้อผิดพลาด", error: error.message };
  }
};

const getSomeStudents = async (query) => {
  try {
    const someStudents = await studentModel.getSomeStudents(query);
    return someStudents;
  } catch (error) {
    console.error("Error getSomeStudents:", error);
    return { message: "เกิดข้อผิดพลาด", error: error.message };
  }

};

const upClassLevel = async (sIds) => {
  try {
    const result = await studentModel.upClassLevel(sIds);
    return result;
  } catch (error) {
    console.error("Error upClassLevel:", error);
    return { message: "เกิดข้อผิดพลาด", error: error.message };
  }
};
const updateStudentNumber = async (students, userActionId) => {
  try {
    const result = await studentModel.updateStudentNumber(students, userActionId);
    return result;
  } catch (error) {
    console.error("Error updateStudentNumber:", error);
    return { message: "เกิดข้อผิดพลาด", error: error.message };
  }
};

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, getStudentByClassLevelId, getSomeStudents, upClassLevel, updateStudentNumber };

