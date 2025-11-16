const express = require('express');
const {
  createNameTitle,
  getAllNameTitles,
  getNameTitleById,
  updateNameTitle,
  deleteNameTitle,
  searchNameTitles
} = require('./name_title.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { 
  createNameTitleSchema, 
  updateNameTitleSchema, 
  getNameTitleSchema, 
  searchNameTitlesSchema,
  getAllNameTitlesSchema
} = require('./name_title.schema');

const router = express.Router();

router.get('/', 
  getAllNameTitles
);

router.get('/search', 
  validate(searchNameTitlesSchema, 'query'),
  searchNameTitles
);
router.get('/:id', 
  validate(getNameTitleSchema, 'params'),
  getNameTitleById
);
router.post('/', 
  validate(createNameTitleSchema),
  createNameTitle
);
router.put('/:id', 
  validate(getNameTitleSchema, 'params'),
  validate(updateNameTitleSchema),
  updateNameTitle
);
router.delete('/:id', 
  validate(getNameTitleSchema, 'params'),
  deleteNameTitle
);

module.exports = router;
