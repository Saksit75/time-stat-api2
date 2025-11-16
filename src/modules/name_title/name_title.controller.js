const nameTitleService = require('./name_title.service');

const createNameTitle = async (req, res, next) => {
  try {
    const newNameTitle = await nameTitleService.createNameTitle(req.body);
    
    res.status(201).json({
      success: true,
      message: 'สร้างข้อมูลสำเร็จ',
      data: newNameTitle
    });
  } catch (err) {
    next(err);
  }
};

const getAllNameTitles = async (req, res, next) => {
  try {
    const nameTitles = await nameTitleService.getAllNameTitles();
    
    res.json({
      success: true,
      message: 'ดึงข้อมูลทั้งหมดสำเร็จ',
      data: nameTitles,
      count: nameTitles.length
    });
  } catch (err) {
    next(err);
  }
};

const getNameTitleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    const nameTitle = await nameTitleService.getNameTitleById(id);
    
    if (!nameTitle) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบชื่อยศที่ต้องการ'
      });
    }
    
    res.json({
      success: true,
      message: 'ดึงข้อมูลชื่อยศสำเร็จ',
      data: nameTitle
    });
  } catch (err) {
    next(err);
  }
};

const updateNameTitle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    const updatedNameTitle = await nameTitleService.updateNameTitle(id, req.body);
    
    res.json({
      success: true,
      message: 'แก้ไขชื่อยศสำเร็จ',
      data: updatedNameTitle
    });
  } catch (err) {
    next(err);
  }
};

const deleteNameTitle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID ต้องเป็นตัวเลขบวก'
      });
    }
    
    await nameTitleService.deleteNameTitle(id);
    
    res.json({
      success: true,
      message: 'ลบชื่อยศสำเร็จ'
    });
  } catch (err) {
    next(err);
  }
};

const searchNameTitles = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    const nameTitles = await nameTitleService.searchNameTitles(q);
    
    res.json({
      success: true,
      message: 'ค้นหาชื่อยศสำเร็จ',
      data: nameTitles,
      count: nameTitles.length,
      searchTerm: q || ''
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  createNameTitle, 
  getAllNameTitles, 
  getNameTitleById, 
  updateNameTitle, 
  deleteNameTitle,
  searchNameTitles
};
