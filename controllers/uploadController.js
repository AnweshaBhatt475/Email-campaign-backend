const Customer = require('../models/Customer');
const { parseExcel } = require('../utils/excelParser');

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const records = await parseExcel(req.file.buffer);
  await Customer.insertMany(records, { ordered: false }).catch(() => {});
  res.json({ count: records.length });
};
