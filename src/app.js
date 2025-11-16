const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const path = require('path');
// const { v2: cloudinary } = require("cloudinary");
const auth = require("./middlewares/auth.middleware");

const studentRoutes = require('./modules/students/student.routes');
const teacherRoutes = require('./modules/teachers/teacher.routes');
const loginRoutes = require('./modules/login/login.routes');
const logoutRoutes = require('./modules/logout/logout.routes');
const nameTitleRoutes = require('./modules/name_title/name_title.routes');
const classLevelRoutes = require('./modules/class_level/class_level.routes');
const statRoutes = require('./modules/time-stat/stat.routes');
const slidingJWT = require('./middlewares/jwtSliding.middleware');
const timeStatReportSum = require('./modules/time-stat/stat_report_sum.router');
const timeStatReportStu = require('./modules/time-stat/stat_report_stu.router');

const app = express();
app.use(morgan('dev')); // แสดง log
app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use('/students', slidingJWT, auth, studentRoutes);
app.use('/teachers', slidingJWT, auth, teacherRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/name-title', nameTitleRoutes);
app.use('/class-level', classLevelRoutes);
app.use('/time-stat', statRoutes);
app.use('/time-stat-report', timeStatReportSum);
app.use('/time-stat-report', timeStatReportStu);

app.get('/', (req, res) => {
  res.send('Welcome to Time stat API!');
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.statusCode || 500;
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || [{ field: 'server', message }],
  });
});

module.exports = { app }
