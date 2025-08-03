const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// POST /api/customers/upload
router.post('/upload', async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data)) return res.status(400).send('Invalid format');

    const inserted = await Customer.insertMany(data, { ordered: false });
    res.status(201).json({ inserted: inserted.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
