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
const htmlSum = (data, totalDays) => {
  let rows = "";
  data.forEach((r, i) => {
    rows += `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td style="text-align:center;">${r.year + 543}</td>
        <td style="text-align:left;">${textMonth[r.month]}</td>
        <td style="text-align:right;">${r.count}</td>
      </tr>
    `;
  });

  // รวมทั้งหมด
  rows += `
    <tr>
      <td></td>
      <td></td>
      <td style="text-align:left;font-weight:bold;">รวมทั้งหมด</td>
      <td style="text-align:right;font-weight:bold;">${totalDays} วัน</td>
    </tr>
  `;

  return `
    <html>
      <head>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h2>สรุปเวลาเรียน</h2>
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ปี (พ.ศ.)</th>
              <th>เดือน</th>
              <th>จำนวนวัน</th>
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
router.get("/export-time-stat-sum-excel", async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    // 1. ดึงข้อมูลสรุปเวลาการเรียน
    const where = {};
    if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(`${Number(startYear) - 543}-${startMonth}-01`);
      const endDate = new Date(`${Number(endYear) - 543}-${endMonth}-31`);

      where.date_time_stat = {
        gte: startDate,
        lte: endDate,
      };
    }

    const records = await prisma.date_time_stat.findMany({
      select: { id: true, date_time_stat: true },
      where,
      orderBy: { date_time_stat: 'asc' },
    });

    // 2. นับจำนวนต่อเดือน
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
      return {
        year: Number(year),
        month: Number(month),
        count,
      };
    });

    // 3. สร้าง workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("สรุปเวลาเรียน");

    sheet.columns = [
      { header: "ลำดับ", key: "index", width: 15, style: { alignment: { horizontal: "center" } } },
      { header: "ปี (พ.ศ.)", key: "year", width: 15, style: { alignment: { horizontal: "center" } } },
      { header: "เดือน", key: "month", width: 15, style: { alignment: { horizontal: "center" } } },
      { header: "จำนวนวัน", key: "count", width: 15, style: { alignment: { horizontal: "center" } } },
    ];
    let totalDays = 0;
    result.forEach((r, index) => {
      let row = sheet.addRow({
        index: index + 1,
        year: r.year + 543, // แปลงเป็น พ.ศ.
        month: textMonth[r.month],
        count: r.count,
      });
      row.getCell('index').alignment = { horizontal: 'center' };
      row.getCell('year').alignment = { horizontal: 'center' };
      row.getCell('month').alignment = { horizontal: 'left' };
      row.getCell('count').alignment = { horizontal: 'right' };
      totalDays += r.count; // นับรวม totalDays
    });
    row = sheet.addRow({
      index: '',
      year: '',
      month: 'รวมทั้งหมด',
      count: `${totalDays} วัน`,
    });
    row.getCell('index').alignment = { horizontal: 'center' };
    row.getCell('year').alignment = { horizontal: 'center' };
    row.getCell('month').alignment = { horizontal: 'left' };
    row.getCell('count').alignment = { horizontal: 'right' };
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=TimeStat_Summary.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting Excel");
  }
});

router.get("/export-time-stat-sum-pdf", async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    // 1. ดึงข้อมูล
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

    // 2. นับจำนวนต่อเดือน
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

    let totalDays = result.reduce((sum, r) => sum + r.count, 0);

    // 3. สร้าง HTML
    const html = htmlSum(result, totalDays);

    // 4. ใช้ puppeteer แปลงเป็น PDF
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

    // 5. ส่ง PDF ให้ client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=TimeStat_Summary.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting PDF");
  }
});


module.exports = router;
