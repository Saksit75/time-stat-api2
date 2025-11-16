const classLevelModel = require('./class_level.model');

const getAllClassLevels = async () => {
  return await classLevelModel.getAllClassLevels();
};

const getClassLevelById = async (id) => {
  return await classLevelModel.getClassLevelById(id);
};

const createClassLevel = async (data) => {
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!data.class_level_th || data.class_level_th.trim() === '') {
    throw new Error('กรุณาระบุชั้นภาษาไทย');
  }

  // ทำความสะอาดข้อมูล
  const cleanData = {
    class_level_th: data.class_level_th.trim(),
    class_level_en: data.class_level_en ? data.class_level_en.trim() : null,
    create_by: data.create_by || null,
    update_by: data.update_by || null
  };

  return await classLevelModel.createClassLevel(cleanData);
};

const createBulkClassLevels = async (dataArray) => {
  // ตรวจสอบว่าเป็น array หรือไม่
  if (!Array.isArray(dataArray)) {
    throw new Error('ข้อมูลต้องเป็น array');
  }

  if (dataArray.length === 0) {
    throw new Error('ต้องมีข้อมูลอย่างน้อย 1 รายการ');
  }

  // ตรวจสอบข้อมูลแต่ละรายการ
  for (let i = 0; i < dataArray.length; i++) {
    const data = dataArray[i];
    if (!data.class_level_th || data.class_level_th.trim() === '') {
      throw new Error(`รายการที่ ${i + 1}: กรุณาระบุชั้นภาษาไทย`);
    }
  }

  // ทำความสะอาดข้อมูลทั้งหมด
  const cleanDataArray = dataArray.map(data => ({
    class_level_th: data.class_level_th.trim(),
    class_level_en: data.class_level_en ? data.class_level_en.trim() : null,
    create_by: data.create_by || null,
    update_by: data.update_by || null
  }));

  return await classLevelModel.createBulkClassLevels(cleanDataArray);
};

const updateClassLevel = async (id, data) => {
  // ตรวจสอบว่า class_level มีอยู่จริงหรือไม่
  const existingClassLevel = await classLevelModel.getClassLevelById(id);
  if (!existingClassLevel) {
    const error = new Error('ไม่พบชั้นที่ต้องการแก้ไข');
    error.statusCode = 404;
    throw error;
  }

  // ทำความสะอาดข้อมูล
  const cleanData = {};
  if (data.class_level_th !== undefined) {
    if (!data.class_level_th || data.class_level_th.trim() === '') {
      throw new Error('ชั้นภาษาไทยไม่สามารถเป็นค่าว่างได้');
    }
    cleanData.class_level_th = data.class_level_th.trim();
  }
  if (data.class_level_en !== undefined) {
    cleanData.class_level_en = data.class_level_en ? data.class_level_en.trim() : null;
  }
  if (data.update_by !== undefined) {
    cleanData.update_by = data.update_by;
  }

  return await classLevelModel.updateClassLevel(id, cleanData);
};

const deleteClassLevel = async (id) => {
  // ตรวจสอบว่า class_level มีอยู่จริงหรือไม่
  const existingClassLevel = await classLevelModel.getClassLevelById(id);
  if (!existingClassLevel) {
    const error = new Error('ไม่พบชั้นที่ต้องการลบ');
    error.statusCode = 404;
    throw error;
  }

  return await classLevelModel.deleteClassLevel(id);
};

const searchClassLevels = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return await classLevelModel.getAllClassLevels();
  }

  return await classLevelModel.searchClassLevels(searchTerm.trim());
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
