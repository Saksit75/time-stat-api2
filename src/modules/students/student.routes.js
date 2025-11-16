const express = require('express');
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByClassLevelId,
  getSomeStudents,
  upClassLevel,
  updateStudentNumber
} = require('./student.controller');
const { validate } = require('../../middlewares/validate.middleware')
const { createStudentSchema, updateStudentSchema } = require('./student.schema');
const auth = require("../../middlewares/auth.middleware");
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/', getAllStudents);
router.get('/some', getSomeStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), validate(createStudentSchema),auth,  createStudent);
router.put('/:id', upload.single('photo'), validate(updateStudentSchema),auth, updateStudent);
router.delete('/:id', deleteStudent);
router.get('/class-level/:id', getStudentByClassLevelId);
router.post('/up-level',auth, upClassLevel); 
router.post('/update-student-number',auth, updateStudentNumber); 
module.exports = router;