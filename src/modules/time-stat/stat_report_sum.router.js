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

/* =========================================================
   == EXCEL EXPORT เหมือนเดิม ไม่แก้ ==
   ========================================================= */
router.get("/export-time-stat-sum-excel", async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    const where = {};
    if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(`${Number(startYear) - 543}-${startMonth}-01`);
      const endDate = new Date(`${Number(endYear) - 543}-${endMonth}-31`);
      where.date_time_stat = { gte: startDate, lte: endDate };
    }

    const records = await prisma.date_time_stat.findMany({
      select: { id: true, date_time_stat: true },
      where,
      orderBy: { date_time_stat: 'asc' },
    });

    const countMap = new Map();
    for (const record of records) {
      const date = new Date(record.date_time_stat);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }

    const result = Array.from(countMap.entries()).map(([key, count]) => {
      const [year, month] = key.split('-');
      return { year: Number(year), month: Number(month), count };
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("สรุปเวลาเรียน");

    sheet.columns = [
      { header: "ลำดับ", key: "index", width: 15 },
      { header: "ปี (พ.ศ.)", key: "year", width: 15 },
      { header: "เดือน", key: "month", width: 15 },
      { header: "จำนวนวัน", key: "count", width: 15 },
    ];

    let totalDays = 0;
    result.forEach((r, index) => {
      sheet.addRow({
        index: index + 1,
        year: r.year + 543,
        month: textMonth[r.month],
        count: r.count,
      });
      totalDays += r.count;
    });

    sheet.addRow({
      index: "",
      year: "",
      month: "รวมทั้งหมด",
      count: `${totalDays} วัน`,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=TimeStat_Summary.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting Excel");
  }
});


/* =========================================================
   == PDF EXPORT (ใช้ html-pdf-node) แทน puppeteer ==
   ========================================================= */
router.get("/export-time-stat-sum-pdf", async (req, res) => {
  try {
    // query date
    const { startMonth, startYear, endMonth, endYear } = req.query;
    const where = {};
    if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(`${Number(startYear)-543}-${startMonth}-01`);
      const endDate = new Date(`${Number(endYear)-543}-${endMonth}-31`);
      where.date_time_stat = { gte: startDate, lte: endDate };
    }

    const records = await prisma.date_time_stat.findMany({
      select: { id: true, date_time_stat: true },
      where,
      orderBy: { date_time_stat: "asc" },
    });

    const countMap = new Map();
    for (const record of records) {
      const date = new Date(record.date_time_stat);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }

    const result = Array.from(countMap.entries()).map(([key, count]) => {
      const [year, month] = key.split("-");
      return { year: Number(year), month: Number(month), count };
    });

    const totalDays = result.reduce((sum, r) => sum + r.count, 0);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=TimeStat_Summary.pdf");
    doc.pipe(res);

    // แปลง Base64 เป็น Buffer และลงทะเบียนฟอนต์
    const sarabunRegular = Buffer.from(sarabunBase64.regular, "base64");
    const sarabunBold = Buffer.from(sarabunBase64.bold, "base64");

    doc.registerFont("Sarabun", sarabunRegular);
    doc.registerFont("Sarabun-Bold", sarabunBold);

    // หัวเรื่อง
    doc.font("Sarabun-Bold")
       .fontSize(20)
       .text("รายงานสรุปการมาเรียนของนักเรียน", { align: "center" });

    doc.moveDown(2);

    // ตารางตัวอย่าง (Header)
    const startX = 60, rowHeight = 30;
    let startY = doc.y;
    const colWidths = [80, 100, 150, 120];

    const drawCell = (x, y, width, height, text, options={}) => {
      if (options.fillColor) {
        doc.fillColor(options.fillColor).rect(x, y, width, height).fill();
        doc.fillColor("#000000");
      }
      doc.rect(x, y, width, height).stroke();
      doc.font(options.bold ? "Sarabun-Bold" : "Sarabun").fontSize(options.fontSize || 14);
      const textY = y + (height - (options.fontSize || 14)) / 2;
      doc.text(text, x + 5, textY, { width: width-10, align: options.align || "left", lineBreak: false });
    };

    // Header row
    drawCell(startX, startY, colWidths[0], rowHeight, "ลำดับ", { bold:true, align:"center", fillColor:"#eeeeee" });
    drawCell(startX+colWidths[0], startY, colWidths[1], rowHeight, "ปี (พ.ศ.)", { bold:true, align:"center", fillColor:"#eeeeee" });
    drawCell(startX+colWidths[0]+colWidths[1], startY, colWidths[2], rowHeight, "เดือน", { bold:true, align:"center", fillColor:"#eeeeee" });
    drawCell(startX+colWidths[0]+colWidths[1]+colWidths[2], startY, colWidths[3], rowHeight, "จำนวนวัน", { bold:true, align:"center", fillColor:"#eeeeee" });
    startY += rowHeight;

    // Data rows
    result.forEach((r, i) => {
      drawCell(startX, startY, colWidths[0], rowHeight, String(i+1), { align:"center" });
      drawCell(startX+colWidths[0], startY, colWidths[1], rowHeight, String(r.year+543), { align:"center" });
      drawCell(startX+colWidths[0]+colWidths[1], startY, colWidths[2], rowHeight, textMonth[r.month], { align:"left" });
      drawCell(startX+colWidths[0]+colWidths[1]+colWidths[2], startY, colWidths[3], rowHeight, String(r.count), { align:"right" });
      startY += rowHeight;
    });

    // Summary
    drawCell(startX, startY, colWidths[0]+colWidths[1], rowHeight, "", {});
    drawCell(startX+colWidths[0]+colWidths[1], startY, colWidths[2], rowHeight, "รวมทั้งหมด", { bold:true, align:"left" });
    drawCell(startX+colWidths[0]+colWidths[1]+colWidths[2], startY, colWidths[3], rowHeight, `${totalDays} วัน`, { bold:true, align:"right" });

    doc.end();

  } catch(err){
    console.error(err);
    res.status(500).send("Error exporting PDF");
  }
});
module.exports = router;
