const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const formatDateThaiCustom = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const dayName = days[d.getDay()];
    const dayNumber = d.getDate();
    const monthName = months[d.getMonth()];
    const yearBE = d.getFullYear() + 543;

    return `วัน ${dayName} ที่ ${dayNumber} เดือน ${monthName} พ.ศ. ${yearBE}`;
};

const getFormTimeStat = async () => {
    try {
        const students = await prisma.student.findMany({ where: { status: "in" }, include: { title_relation: true, class_level_relation: true } });
        const classLevel = await prisma.class_level.findMany();
        return { students, classLevel };
    } catch (err) {
        throw err
    }
};

const createTimeStat = async (data, userActionId) => {
    try {
        const countSameDate = await prisma.time_stat.count({
            where: { date: data.date },
        });

        if (countSameDate > 0) {
            const error = new Error(`มีข้อมูลในวันที่ ${formatDateThaiCustom(data.date)} แล้ว`);
            error.statusCode = 409;
            throw error;
        }

        const formItems = Object.values(data.formData);
        const allInsertedStats = [];
        const allStudentDetails = [];

        const result = await prisma.$transaction(async (tx) => {
            const createdStatDate = await tx.date_time_stat.create({
                data: {
                    date_time_stat: data.date,
                    create_by: Number(userActionId),
                    update_by: Number(userActionId),
                },
            });

            // วนลูปบันทึกรายการลูก
            for (const item of formItems) {
                const createdStat = await tx.time_stat.create({
                    data: {
                        date_time_stat_id: createdStatDate.id,
                        date: data.date,
                        class_level: item.class_level,
                        teacher: Number(data.teacher),
                        amount_male: item.amount_male ?? 0,
                        amount_female: item.amount_female ?? 0,
                        amount_count: item.amount_count ?? 0,
                        come_male: item.come_male ?? 0,
                        come_female: item.come_female ?? 0,
                        come_count: item.come_count ?? 0,
                        not_come_male: item.not_come_male ?? 0,
                        not_come_female: item.not_come_female ?? 0,
                        not_come_count: item.not_come_count ?? 0,
                        absent: item.absent ?? 0,
                        sleave: item.leave ?? 0,
                        sick: item.sick ?? 0,
                        late: item.late ?? 0,
                        create_by: Number(userActionId),
                        update_by: Number(userActionId),
                    },
                });

                allInsertedStats.push(createdStat);

                if (Array.isArray(item.remark) && item.remark.length > 0) {
                    const detailData = item.remark.map((student) => ({
                        time_stat_id: createdStat.id,
                        s_id: Number(student.id),
                        student_id: student.student_id,
                        student_number: student.student_number,
                        student_title: student.title,
                        student_first_name: student.first_name,
                        student_last_name: student.last_name,
                        student_gender: student.gender,
                        student_class_level: item.class_level,
                        remark: student.class_status,
                        create_by: Number(userActionId),
                        update_by: Number(userActionId),
                    }));

                    await tx.time_stat_detail.createMany({
                        data: detailData,
                    });

                    allStudentDetails.push(...detailData);
                }
            }
            return {
                time_stat: allInsertedStats,
                time_stat_detail: allStudentDetails,
            };
        });

        return {
            message: "success",
            data: result,
        };
    } catch (err) {
        console.error("❌ Error in createTimeStat:", err);
        throw err;
    }
};

const timeStatHis = async (page, limit, startMonth, startYear, endMonth, endYear) => {
    try {
        const where = {};
        if (startMonth && startYear && endMonth && endYear) {
            const startDate = new Date(`${Number(startYear) - 543}-${startMonth}-01`);
            const endDate = new Date(`${Number(endYear) - 543}-${endMonth}-31`);
            where.date_time_stat = {
                gte: startDate,
                lte: endDate,
            };
        }
        const total = await prisma.date_time_stat.count({ where });
        const timeStat = await prisma.date_time_stat.findMany({
            select: {
                id: true,
                date_time_stat: true,
            },
            where,
            skip: (page - 1) * limit,
            take: parseInt(limit),
            orderBy: { date_time_stat: "desc" },
        });
        const totalPages = Math.ceil(total / limit);
        return {
            timeStat,
            total,
            totalPages,
            currentPage: page,
            limit,
            startMonth,
            startYear,
            endMonth,
            endYear,
            where
        };
    } catch (err) {
        throw err;
    }
};
const timeStatReportSum = async (startMonth, startYear, endMonth, endYear) => {
    try {
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
        const countMap = new Map();

        for (const record of records) {
            const date = new Date(record.date_time_stat);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const key = `${year}-${month}`;
            countMap.set(key, (countMap.get(key) || 0) + 1);
        }
        let totalDays = 0;
        const result = Array.from(countMap.entries()).map(([key, count]) => {
            const [year, month] = key.split('-');
            totalDays += count;
            return {
                year: Number(year),
                month: Number(month),
                count,
            };
        });
        return { result, totalDays, startMonth, startYear, endMonth, endYear };
    } catch (err) {
        throw err;
    }
};
const timeStatReportStudent = async (startMonth, startYear, endMonth, endYear) => {
    console.log(" timeStatReportStudent : ", startMonth, startYear, endMonth, endYear);

    try {
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

        return Array.from(studentMap.values());
    } catch (err) {
        throw err;
    }
};

const timeStatDelete = async (id) => {
    id = Number(id);
    try {
        const timeStats = await prisma.time_stat.findMany({
            select: { id: true },
            where: { date_time_stat_id: id }
        });
        const timeStatIds = timeStats.map(t => t.id);
        const delTimeStatDetail = await prisma.time_stat_detail.deleteMany({
            where: { time_stat_id: { in: timeStatIds } }
        });
        const delTimeStat = await prisma.time_stat.deleteMany({
            where: { id: { in: timeStatIds } }
        });
        const delDateTimeStat = await prisma.date_time_stat.deleteMany({
            where: { id }
        });
        return { deletedDateTimeStat: delDateTimeStat.count, deletedTimeStat: delTimeStat.count, deletedTimeStatDetail: delTimeStatDetail.count };
    } catch (err) {
        throw err;
    }
};

const getTimeStatHisDetail = async (date_time_stat_id) => {
    try {
        const result = await prisma.time_stat.findMany({
            where: { date_time_stat_id: Number(date_time_stat_id) },
            include: {
                time_stat_detail: true,
                class_level_relation: true,
            },
            orderBy: { class_level: "asc" },
        });
        if (result.length === 0) {
            throw new Error(`ไม่พบข้อมูล time_stat ของ date_time_stat_id: ${date_time_stat_id}`);
        }

        return result;
    } catch (err) {
        console.error("Error getTimeStatHisDetail:", err);
        throw err;
    }
};

const updateTimeStat = async (id, data, userActionId) => {
  try {
    const formItems = Object.values(data.formData);
    const allInsertedStats = [];
    const allStudentDetails = [];

    const result = await prisma.$transaction(async (tx) => {
      const updateStatDate = await tx.date_time_stat.update({
        where: { id: Number(id) },
        data: {
          update_by: Number(userActionId),
          update_date: new Date(),
        },
      });
      const oldStats = await tx.time_stat.findMany({
        where: { date_time_stat_id: Number(id) },
        select: { id: true },
      });
      if (oldStats.length > 0) {
        const oldIds = oldStats.map((s) => s.id);
        await tx.time_stat_detail.deleteMany({
          where: { time_stat_id: { in: oldIds } },
        });
        await tx.time_stat.deleteMany({
          where: { id: { in: oldIds } },
        });
      }
      for (const item of formItems) {
        const newStat = await tx.time_stat.create({
          data: {
            date_time_stat_id: Number(id),
            date: new Date(data.date),
            class_level: item.class_level,
            teacher: Number(data.teacher),
            amount_male: item.amount_male ?? 0,
            amount_female: item.amount_female ?? 0,
            amount_count: item.amount_count ?? 0,
            come_male: item.come_male ?? 0,
            come_female: item.come_female ?? 0,
            come_count: item.come_count ?? 0,
            not_come_male: item.not_come_male ?? 0,
            not_come_female: item.not_come_female ?? 0,
            not_come_count: item.not_come_count ?? 0,
            absent: item.absent ?? 0,
            sleave: item.leave ?? 0,
            sick: item.sick ?? 0,
            late: item.late ?? 0,
            create_by: Number(userActionId),
            create_date: new Date(),
            update_by: Number(userActionId),
            update_date: new Date(),
          },
        });
        allInsertedStats.push(newStat);
        if (Array.isArray(item.remark) && item.remark.length > 0) {
          const detailData = item.remark.map((student) => ({
            time_stat_id: newStat.id,
            s_id: Number(student.id),
            student_id: student.student_id,
            student_number: student.student_number,
            student_title: student.title,
            student_first_name: student.first_name,
            student_last_name: student.last_name,
            student_gender: student.gender,
            student_class_level: item.class_level,
            remark: student.class_status,
            create_by: Number(userActionId),
            create_date: new Date(),
            update_by: Number(userActionId),
            update_date: new Date(),
          }));
          await tx.time_stat_detail.createMany({ data: detailData });
          allStudentDetails.push(...detailData);
        }
      }
      return {
        date_time_stat: updateStatDate,
        time_stat: allInsertedStats,
        time_stat_detail: allStudentDetails,
      };
    });

    return {
      message: "success",
      data: result,
    };
  } catch (err) {
    console.error("Error in updateTimeStat:", err);
    throw err;
  }
};





module.exports = {
    getFormTimeStat,
    createTimeStat,
    timeStatHis,
    timeStatDelete,
    timeStatReportSum,
    timeStatReportStudent,
    getTimeStatHisDetail,
    updateTimeStat
};
