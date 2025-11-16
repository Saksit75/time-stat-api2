const nameTitleModel = require('./name_title.model');

const getAllNameTitles = async () => {
  return await nameTitleModel.getAllNameTitles();
};

const getNameTitleById = async (id) => {
  return await nameTitleModel.getNameTitleById(id);
};

const createNameTitle = async (data) => {
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!data.title_th || data.title_th.trim() === '') {
    throw new Error('กรุณาระบุชื่อยศภาษาไทย');
  }

  // ทำความสะอาดข้อมูล
  const cleanData = {
    title_th: data.title_th.trim(),
    title_en: data.title_en ? data.title_en.trim() : null,
    create_by: data.create_by || null,
    update_by: data.update_by || null
  };

  return await nameTitleModel.createNameTitle(cleanData);
};

const updateNameTitle = async (id, data) => {
  // ตรวจสอบว่า name_title มีอยู่จริงหรือไม่
  const existingNameTitle = await nameTitleModel.getNameTitleById(id);
  if (!existingNameTitle) {
    const error = new Error('ไม่พบชื่อยศที่ต้องการแก้ไข');
    error.statusCode = 404;
    throw error;
  }

  // ทำความสะอาดข้อมูล
  const cleanData = {};
  if (data.title_th !== undefined) {
    if (!data.title_th || data.title_th.trim() === '') {
      throw new Error('ชื่อยศภาษาไทยไม่สามารถเป็นค่าว่างได้');
    }
    cleanData.title_th = data.title_th.trim();
  }
  if (data.title_en !== undefined) {
    cleanData.title_en = data.title_en ? data.title_en.trim() : null;
  }
  if (data.update_by !== undefined) {
    cleanData.update_by = data.update_by;
  }

  return await nameTitleModel.updateNameTitle(id, cleanData);
};

const deleteNameTitle = async (id) => {
  // ตรวจสอบว่า name_title มีอยู่จริงหรือไม่
  const existingNameTitle = await nameTitleModel.getNameTitleById(id);
  if (!existingNameTitle) {
    const error = new Error('ไม่พบชื่อยศที่ต้องการลบ');
    error.statusCode = 404;
    throw error;
  }

  return await nameTitleModel.deleteNameTitle(id);
};

const searchNameTitles = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return await nameTitleModel.getAllNameTitles();
  }

  return await nameTitleModel.searchNameTitles(searchTerm.trim());
};

module.exports = { 
  getAllNameTitles, 
  getNameTitleById, 
  createNameTitle, 
  updateNameTitle, 
  deleteNameTitle,
  searchNameTitles
};
