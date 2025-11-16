const statModel = require('./stat.model');

const getFormTimeStat = async () => {
  try {
    const { students, classLevel } = await statModel.getFormTimeStat();

    const formData = {};

    for (const classLev of classLevel) {
      const studentsInClass = [];
      let maleCount = 0;
      let femaleCount = 0;

      // loop แค่ครั้งเดียวสำหรับ students ทุกคน
      for (const student of students) {
        if (student.class_level === classLev.id) {
          // เพิ่ม student ลง studentsByClass
          studentsInClass.push({
            id: student.id,
            student_id: student.student_id,
            student_number: student.student_number,
            title: student.title_relation?.title_th || '',
            first_name: student.first_name,
            last_name: student.last_name,
            gender: student.gender,
            class_status: 'come'
          });

          // นับ male/female
          if (student.gender === 'm') maleCount++;
          else if (student.gender === 'f') femaleCount++;
        }
      }

      const totalCount = studentsInClass.length;

      formData[classLev.id] = {
        class_level: classLev.id,
        class_level_th: classLev.class_level_th,
        amount_male: maleCount,
        amount_female: femaleCount,
        amount_count: totalCount,
        come_male: maleCount,
        come_female: femaleCount,
        come_count: totalCount,
        not_come_male: null,
        not_come_female: null,
        not_come_count: null,
        absent: null,
        leave: null,
        sick: null,
        late: null,
        remark: studentsInClass
      };
    }
    const result = { formTimeStat: { date: new Date(), formData, teacher: null } };
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createTimeStat = async (data, userActionId) => {
  try {
    const result = await statModel.createTimeStat(data, userActionId);
    if (result) {
      console.log("Create :", JSON.stringify(result, null, 2));
    }
    return result
  } catch (error) {
    throw error;
  }
};

const timeStatHis = async (page, limit, startMonth = null, startYear = null, endMonth = null, endYear = null) => {
  try {
    return await statModel.timeStatHis(page, limit, startMonth, startYear, endMonth, endYear);
  } catch (error) {
    throw error;
  }
};
const timeStatDelete = async (id) => {
  try {
    return await statModel.timeStatDelete(id);
  } catch (error) {
    throw error;
  }
};
const timeStatReportSum = async (startMonth, startYear, endMonth, endYear) => {
  try {
    return await statModel.timeStatReportSum(startMonth, startYear, endMonth, endYear);
  } catch (error) {
    throw error;
  }
};
const timeStatReportStudent = async (startMonth, startYear, endMonth, endYear) => {

  try {
    return await statModel.timeStatReportStudent(startMonth, startYear, endMonth, endYear);
  } catch (error) {
    throw error;
  }
};

const getTimeStatHisDetail = async (id) => {
  try {
    const his = await statModel.getTimeStatHisDetail(id);
    const teacher = his[0]?.teacher
    const date = his[0]?.date
    const formData = his.reduce((acc, item) => {
      acc[item.class_level] = {
        class_level: item.class_level,
        class_level_th: item.class_level_relation.class_level_th,
        amount_male: item.amount_male,
        amount_female: item.amount_female,
        amount_count: item.amount_count,
        come_male: item.come_male,
        come_female: item.come_female,
        come_count: item.come_count,
        not_come_male: item.not_come_male,
        not_come_female: item.not_come_female,
        not_come_count: item.not_come_count,
        absent: item.absent,
        leave: item.sleave,
        sick: item.sick,
        late: item.late,
        remark: item.time_stat_detail.map((detail) => ({
          id: detail.id,
          s_id: detail.s_id,
          student_id: detail.student_id,
          student_number: detail.student_number,
          title: detail.student_title || '',
          first_name: detail.student_first_name,
          last_name: detail.student_last_name,
          gender: detail.student_gender,
          class_status: detail.remark
        })),
      };
      return acc;
    }, {});

    const result = { date: new Date(date), formData, teacher: teacher };
    return result
  } catch (error) {
    throw error;
  }
};

const updateTimeStat = async (id, data, userActionId) => {
  try {
    return await statModel.updateTimeStat(id, data, userActionId);
  } catch (error) {
    throw error;
  }
}
module.exports = { getFormTimeStat, createTimeStat, timeStatHis, timeStatDelete, timeStatReportSum, timeStatReportStudent, getTimeStatHisDetail,updateTimeStat };
