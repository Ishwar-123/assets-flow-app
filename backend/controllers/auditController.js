const Audit = require('../models/Audit');

const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find({}).populate('auditors', 'name');
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAudit = async (req, res) => {
  try {
    const { name, startDate, endDate, auditors } = req.body;
    const audit = await Audit.create({ name, startDate, endDate, auditors });
    res.status(201).json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAudits, createAudit };
