const express = require("express")
const ExcelJS = require("exceljs")
const puppeteer = require("puppeteer");
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

const router = express.Router();
const textMonth = {
  1: "มกราคม",
  2: "กุมภาพันธ์",
  3: "มีนาคม",
  4: "เมษายน",
  5: "พฤษภาคม",
  6: "มิถุนายน",
  7: "กรกฎาคม",
  8: "สิงหาคม",
  9: "กันยายน",
  10: "ตุลาคม",
  11: "พฤศจิกายน",
  12: "ธันวาคม",
};
const htmlStu = (data) => {
  let rows = "";
  data.forEach((r, i) => {
    rows += `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td style="text-align:left;">${r.stu_title}${r.stu_firstname} ${r.stu_lastname}</td>
        <td style="text-align:center;">${r.stu_number}</td>
        <td style="text-align:left;">${r.stu_class_level}</td>
        <td style="text-align:center;">${r.absent}</td>
        <td style="text-align:center;">${r.leave}</td>
        <td style="text-align:center;">${r.sick}</td>
        <td style="text-align:center;">${r.late}</td>
      </tr>
    `;
  })



  return `
    <html>
      <head>
      <title>รายงานสรุปการมาเรียนของนักเรียน</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #eee; }
        </style>
      </head>
      <body>
      <div style="text-align:center;"><h2>เวลาเรียนของนักเรียน</h2></div>
        
        <table>
          <thead>
            <tr>
              <th rowspan="2">ลำดับ</th>
              <th rowspan="2">ชื่อ-สกุล</th>
              <th rowspan="2">เลขที่</th>
              <th rowspan="2">ชั้น</th>
              <th colspan="4">จำนวนวันมาเรียน</th>
            </tr>
            <tr>
              <th>ขาด</th>
              <th>ลา</th>
              <th>ป่วย</th>
              <th>มาสาย</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}
router.get("/export-time-stat-stu-excel", async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    // 1. ดึงข้อมูลนักเรียน
    const where = {};
     if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(Number(startYear) - 543, Number(startMonth) - 1, 1);
      const endDate = new Date(Number(endYear) - 543, Number(endMonth), 0);
      where.time_stat_relation = {
        date: { gte: startDate, lte: endDate }
      };
    }
    const records = await prisma.time_stat_detail.findMany({
      select: {
        s_id: true,
        student_title: true,
        student_first_name: true,
        student_last_name: true,
        student_number: true,
        remark: true,
        class_level_relation: { select: { class_level_th: true } },
        time_stat_relation: { select: { date: true } },
      },
      where,
      orderBy: [
        { student_class_level: 'asc' },
        { student_number: 'asc' }
      ],
    });

    // 2. จัดกลุ่มนักเรียน
    const studentMap = new Map();
    for (const r of records) {
      const { s_id, student_title, student_first_name, student_last_name, student_number, remark, class_level_relation, time_stat_relation } = r;
      if (!studentMap.has(s_id)) {
        studentMap.set(s_id, {
          name: `${student_title}${student_first_name} ${student_last_name}`,
          number: student_number,
          class_level: class_level_relation?.class_level_th || "",
          absent: 0,
          leave: 0,
          sick: 0,
          late: 0
        });
      }
      const stu = studentMap.get(s_id);
      switch (remark) {
        case 'absent': stu.absent += 1; break;
        case 'leave': stu.leave += 1; break;
        case 'sick': stu.sick += 1; break;
        case 'late': stu.late += 1; break;
      }
    }

    const result = Array.from(studentMap.values());

    // 3. สร้าง workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("เวลาเรียนของนักเรียน");

    // 4. สร้าง header แบบ rowspan/colspan
    sheet.addRow(["ลำดับ", "ชื่อ-สกุล", "เลขที่", "ชั้น", "จำนวนวันมาเรียน", "", "", ""]);
    sheet.addRow(["", "", "", "", "ขาด", "ลา", "ป่วย", "มาสาย"]);

    sheet.mergeCells("A1:A2");
    sheet.mergeCells("B1:B2");
    sheet.mergeCells("C1:C2");
    sheet.mergeCells("D1:D2");
    sheet.mergeCells("E1:H1");

    // ตั้งค่าความกว้างคอลัมน์
    sheet.columns = [
      { width: 10 }, // ลำดับ
      { width: 25 }, // ชื่อ-สกุล
      { width: 10 }, // เลขที่
      { width: 10 }, // ชั้น
      { width: 10 }, // ขาด
      { width: 10 }, // ลา
      { width: 10 }, // ป่วย
      { width: 10 }, // มาสาย
    ];

    // จัด alignment header
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // 5. เพิ่มข้อมูลนักเรียน
    result.forEach((stu, idx) => {
      const row = sheet.addRow([
        idx + 1,
        stu.name,
        stu.number,
        stu.class_level,
        stu.absent,
        stu.leave,
        stu.sick,
        stu.late
      ]);

      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
    });

    // 6. ส่งไฟล์
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=TimeStat_Student.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting Excel");
  }
})

router.get("/export-time-stat-stu-pdf", async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;
    const where = {};
    if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(Number(startYear) - 543, Number(startMonth) - 1, 1);
      const endDate = new Date(Number(endYear) - 543, Number(endMonth), 0);
      where.time_stat_relation = {
        date: { gte: startDate, lte: endDate }
      };
    }
    const records = await prisma.time_stat_detail.findMany({
      select: {
        s_id: true,
        student_title: true,
        student_first_name: true,
        student_last_name: true,
        student_number: true,
        remark: true,
        class_level_relation: { select: { class_level_th: true } },
        time_stat_relation: { select: { date: true } },
      },
      where,
      orderBy: [
        { student_class_level: 'asc' },
        { student_number: 'asc' }
      ],
    });
    const studentMap = new Map();
    for (const record of records) {
      const { s_id, student_title, student_first_name, student_last_name, student_number, remark, class_level_relation, time_stat_relation } = record;
      if (!studentMap.has(s_id)) {
        studentMap.set(s_id, {
          s_id,
          stu_title: student_title,
          stu_firstname: student_first_name,
          stu_lastname: student_last_name,
          stu_class_level: class_level_relation?.class_level_th || "",
          stu_number: student_number,
          absent: 0,
          leave: 0,
          sick: 0,
          late: 0,
          attendance_dates: []
        });
      }
      const student = studentMap.get(s_id);
      if (remark !== "come") {
        student.attendance_dates.push({ date: time_stat_relation.date, remark });
      }
      switch (remark) {
        case 'absent': student.absent += 1; break;
        case 'leave': student.leave += 1; break;
        case 'sick': student.sick += 1; break;
        case 'late': student.late += 1; break;
      }
    }
    const result = Array.from(studentMap.values());
    const html = htmlStu(result);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=TimeStat_Student.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting PDF");
  }
});


module.exports = router;
