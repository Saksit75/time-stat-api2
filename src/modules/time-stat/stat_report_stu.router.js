const express = require("express")
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit");
const sarabunBase64 = require("../../fonts/base64/sarabun");
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
      where.time_stat_relation = { date: { gte: startDate, lte: endDate } };
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
        { student_class_level: "asc" },
        { student_number: "asc" }
      ],
    });

    const studentMap = new Map();
    for (const record of records) {
      const { s_id, student_title, student_first_name, student_last_name, student_number, remark, class_level_relation } = record;
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
        });
      }
      const student = studentMap.get(s_id);
      switch (remark) {
        case "absent": student.absent += 1; break;
        case "leave": student.leave += 1; break;
        case "sick": student.sick += 1; break;
        case "late": student.late += 1; break;
      }
    }

    const result = Array.from(studentMap.values());

    // สร้าง PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=TimeStat_Student.pdf");

    doc.pipe(res);
    const sarabunRegular = Buffer.from(sarabunBase64.regular, "base64");
    const sarabunBold = Buffer.from(sarabunBase64.bold, "base64");
    // ฟอนต์ไทย
        doc.registerFont("Sarabun", sarabunRegular);
    doc.registerFont("Sarabun-Bold", sarabunBold);

    // หัวเรื่อง
    doc.font("Sarabun-Bold")
       .fontSize(18)
       .text("เวลาเรียนของนักเรียน", { align: "center" });

    doc.moveDown();

    // ตาราง
    const tableTop = doc.y;
    const itemHeight = 25;
    const startX = 50;
    const colWidths = [40, 170, 40, 80, 40, 40, 40, 45];

    // Header
    const headers = ["ลำดับ", "ชื่อ-สกุล", "เลขที่", "ชั้น", "ขาด", "ลา", "ป่วย", "มาสาย"];
    headers.forEach((h, i) => {
      doc.rect(startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, colWidths[i], itemHeight).stroke();
      doc.font("Sarabun").fontSize(11).text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, tableTop + 7, { width: colWidths[i] - 10, align: "center" });
    });

    let y = tableTop + itemHeight;

    // Rows
    result.forEach((stu, idx) => {
      const values = [
        idx + 1,
        `${stu.stu_title}${stu.stu_firstname} ${stu.stu_lastname}`,
        stu.stu_number,
        stu.stu_class_level,
        stu.absent,
        stu.leave,
        stu.sick,
        stu.late
      ];

      values.forEach((val, i) => {
        doc.rect(startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, colWidths[i], itemHeight).stroke();
        const align = ["center","left","center","left","center","center","center","center"][i];
        doc.font("Sarabun").fontSize(9).text(String(val), startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 7, { width: colWidths[i] - 10, align });
      });
      y += itemHeight;

      // new page if overflow
      if (y + itemHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.y;
      }
    });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting PDF");
  }
});



module.exports = router;
