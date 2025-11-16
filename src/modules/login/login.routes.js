const express = require('express');
const { userLogin } = require('./login.controller');
  

const { validate } = require('../../middlewares/validate.middleware')
const { loginSchema } = require('./login.schema');

const router = express.Router();

// ใช้ validate middleware
router.post('/', validate(loginSchema), userLogin);

module.exports = router;