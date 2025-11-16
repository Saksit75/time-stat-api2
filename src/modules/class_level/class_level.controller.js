const classLevelService = require('./class_level.service');

const createClassLevel = async (req, res, next) => {
  try {
    const newClassLevel = await classLevelService.createClassLevel(req.body);
    
    res.status(201).json({
      success: true,
      message: 'สร้างข้อมูลสำเร็จ',
      data: newClassLevel
    });
  } catch (err) {
    next(err);
  }
};

const createBulkClassLevels = async (req, res, next) => {
  try {
    const result = await classLevelService.createBulkClassLevels(req.body);
    
    res.status(201).json({
      success: true,
      message: result.message || 'สร้างข้อมูลหลายรายการสำเร็จ',
      data: result,
      count: result.count
    });
  } catch (err) {
    next(err);
  }
};

const getAllClassLevels = async (req, res, next) => {
  try {
    const classLevels = await classLevelService.getAllClassLevels();
    
    res.json({
      success: true,
      message: 'ดึงข้อมูลทั้งหมดสำเร็จ',
      data: classLevels,
      count: classLevels.length
    });
  } catch (err) {
    next(err);
  }
};

const getClassLevelById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    const classLevel = await classLevelService.getClassLevelById(id);
    
    if (!classLevel) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบชั้นที่ต้องการ'
      });
    }
    
    res.json({
      success: true,
      message: 'ดึงข้อมูลชั้นสำเร็จ',
      data: classLevel
    });
  } catch (err) {
    next(err);
  }
};

const updateClassLevel = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    const updatedClasslevel = await classLevelService.updateClassLevel(id, req.body);
    
    res.json({
      success: true,
      message: 'แก้ไขชั้นสำเร็จ',
      data: updatedClasslevel
    });
  } catch (err) {
    next(err);
  }
};

const deleteClassLevel = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    await classLevelService.deleteClassLevel(id);
    
    res.json({
      success: true,
      message: 'ลบชั้นสำเร็จ'
    });
  } catch (err) {
    next(err);
  }
};

const searchClassLevels = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    const classLevel = await classLevelService.searchClassLevels(q);
    
    res.json({
      success: true,
      message: 'ค้นหาชั้นสำเร็จ',
      data: classLevel,
      count: classLevel.length,
      searchTerm: q || ''
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  createClassLevel,
  createBulkClassLevels, 
  getAllClassLevels, 
  getClassLevelById, 
  updateClassLevel, 
  deleteClassLevel,
  searchClassLevels
};
