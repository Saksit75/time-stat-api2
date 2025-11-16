const express = require('express');
const {
  createClassLevel,
  createBulkClassLevels,
  getAllClassLevels,
  getClassLevelById,
  updateClassLevel,
  deleteClassLevel,
  searchClassLevels
} = require('./class_level.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { 
  createClassLevelSchema,
  createBulkClassLevelSchema,
  updateClassLevelSchema,
  getClassLevelSchema,
  searchClassLevelsSchema
} = require('./class_level.schema');

const router = express.Router();

router.get('/', 
  getAllClassLevels
);

router.get('/search', 
  validate(searchClassLevelsSchema, 'query'),
  searchClassLevels
);
router.get('/:id', 
  validate(getClassLevelSchema, 'params'),
  getClassLevelById
);
router.post('/', 
  validate(createClassLevelSchema),
  createClassLevel
);

router.post('/bulk', 
  validate(createBulkClassLevelSchema),
  createBulkClassLevels
);
router.put('/:id', 
  validate(getClassLevelSchema, 'params'),
  validate(updateClassLevelSchema),
  updateClassLevel
);
router.delete('/:id', 
  validate(getClassLevelSchema, 'params'),
  deleteClassLevel
);

module.exports = router;
