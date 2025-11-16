const express = require('express');
const router = express.Router();
const { validate } = require('../../middlewares/validate.middleware');
const { getFormTimeStat, createTimeStat,timeStatHis,timeStatDelete,timeStatReportSum,timeStatReportStudent,getTimeStatHisDetail ,updateTimeStat} = require('./stat.controller');

const auth = require("../../middlewares/auth.middleware");
  

// Routes
router.get('/get-form-time-stat',getFormTimeStat);
router.post('/create-time-stat',auth, createTimeStat);
router.get('/time-stat-his',auth, timeStatHis);
router.delete('/time-stat-delete/:id',auth, timeStatDelete);
router.get('/time-stat-report-sum',auth, timeStatReportSum); //web
router.get('/time-stat-report-student',auth, timeStatReportStudent); //web
router.get('/time-stat-his-detail/:id',auth, getTimeStatHisDetail);
router.put('/update-time-stat/:id',auth, updateTimeStat);


module.exports = router;