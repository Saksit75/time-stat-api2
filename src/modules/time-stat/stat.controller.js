const statService = require('./stat.service');

const getFormTimeStat = async (req, res) => {
    try {
        const { formTimeStat } = await statService.getFormTimeStat();
        res.status(200).json({ message: 'success', data: formTimeStat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTimeStat = async (req, res) => {
    const userActionId = req.middlewareUser.id;

    try {
        const timeStat = await statService.createTimeStat(req.body, userActionId);
        res.status(200).json({ message: 'success', data: timeStat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const timeStatHis = async (req, res) => {
    const { page, limit, startMonth, startYear, endMonth, endYear } = req.query;
    try {
        const timeStat = await statService.timeStatHis(page, limit, startMonth, startYear, endMonth, endYear);
        res.status(200).json({ message: 'success', data: timeStat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}
const timeStatDelete = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Missing id" });
    }
    try {
        const delTimeStat = await statService.timeStatDelete(id);
        res.status(200).json({ message: 'success', data: delTimeStat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const timeStatReportSum = async (req, res) => {
     const { startMonth, startYear, endMonth, endYear } = req.query;
    try {
        const timeStatSum = await statService.timeStatReportSum(startMonth, startYear, endMonth, endYear);
        res.status(200).json({ message: 'success', data: timeStatSum });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
}
const timeStatReportStudent = async (req, res) => {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    
    try {
        const timeStatStu = await statService.timeStatReportStudent(startMonth, startYear, endMonth, endYear);
        res.status(200).json({ message: 'success', data: timeStatStu });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
}
const getTimeStatHisDetail = async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: "Missing id" });
    }
    try {
        const timeStatDetail = await statService.getTimeStatHisDetail(id);
        res.status(200).json({ message: 'success', data: timeStatDetail });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const updateTimeStat = async (req, res) => {
    const id = req.params.id;
    const userActionId = req.middlewareUser.id;
   
    try {
        const timeStat = await statService.updateTimeStat(id,req.body,userActionId);
        res.status(200).json({ message: 'success', data: timeStat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = { getFormTimeStat, createTimeStat, timeStatHis, timeStatDelete, timeStatReportSum,timeStatReportStudent, getTimeStatHisDetail, updateTimeStat };