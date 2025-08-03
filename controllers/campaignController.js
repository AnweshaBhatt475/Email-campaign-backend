const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const { addStepToQueue } = require('../queues/emailStepQueue'); // BullMQ wrapper

// ✅ Create Campaign
const createCampaign = async (req, res) => {
  try {
    const newCampaign = new Campaign({
      ...req.body,
      contactList: req.file?.filename || '',
      userId: req.user.id,
    });
    await newCampaign.save();

    // Add to queue only if first step is immediate
    const firstStep = newCampaign.steps?.[0];
    if (firstStep?.trigger === 'immediate') {
      const customers = await Customer.find({ campaignId: newCampaign._id });
      for (const cust of customers) {
        await addStepToQueue(cust.email, newCampaign._id, 0, firstStep.delay || 0);
      }
    }

    res.status(201).json(newCampaign);
  } catch (err) {
    console.error('❌ createCampaign error:', err.message);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

// ✅ Upload Customers from CSV
const uploadCustomers = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const customers = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        customers.push({
          email: row.Email,
          name: row.Name || '',
          tags: row.Tags?.split(',').map(t => t.trim()) || [],
          campaignId: req.body.campaignId
        });
      })
      .on('end', async () => {
        try {
          const inserted = await Customer.insertMany(customers);

          // Queue only immediate step if it exists
          const campaign = await Campaign.findById(req.body.campaignId);
          const firstStep = campaign?.steps?.[0];
          if (firstStep?.trigger === 'immediate') {
            for (const cust of inserted) {
              try {
                await addStepToQueue(cust.email, campaign._id, 0, firstStep.delay || 0);
              } catch (queueErr) {
                console.warn('⚠️ Queue failed for:', cust.email, queueErr.message);
              }
            }
          }

          res.status(200).json({
            message: 'Customers uploaded and queued',
            count: inserted.length,
          });
        } catch (dbErr) {
          console.error('❌ DB Error:', dbErr.message);
          res.status(500).json({ error: 'Database insert failed' });
        }
      });
  } catch (err) {
    console.error('❌ CSV upload failed:', err.message);
    res.status(500).json({ error: 'CSV upload failed' });
  }
};

// ✅ Get all Campaigns (admin)
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
};

// ✅ Get Campaigns by user
const getMyCampaigns = async (req, res) => {
  try {
    const myCampaigns = await Campaign.find({ userId: req.user.id });
    res.status(200).json(myCampaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user campaigns' });
  }
};

// ✅ Export Campaign
const exportCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export campaign' });
  }
};

// ✅ Import Campaign
const importCampaign = async (req, res) => {
  try {
    const imported = new Campaign({
      ...req.body,
      userId: req.user.id,
    });
    await imported.save();
    res.status(201).json(imported);
  } catch (err) {
    res.status(500).json({ error: 'Failed to import campaign' });
  }
};

// ✅ Get Campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

// ✅ Update Campaign
const updateCampaign = async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getMyCampaigns,
  exportCampaign,
  importCampaign,
  getCampaignById,
  updateCampaign,
  uploadCustomers,
};
