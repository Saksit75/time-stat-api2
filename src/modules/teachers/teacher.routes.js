const express = require('express');
const router = express.Router();
const { validate } = require('../../middlewares/validate.middleware');
const auth = require("../../middlewares/auth.middleware");
const multer = require('multer');
const { createTeacherSchema, updateTeacherSchema } = require('./teacher.schema');
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherPhoto
} = require('./teacher.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', upload.single('photo'), validate(createTeacherSchema), auth, createTeacher);
router.put('/:id', upload.single('photo'), validate(updateTeacherSchema), auth, updateTeacher);
router.delete('/:id', deleteTeacher);
router.get('/photo/:id', getTeacherPhoto);
module.exports = router;
