const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const {
  createCampaign,
  getCampaigns,
  exportCampaign,
  importCampaign,
  getMyCampaigns,
  getCampaignById,
  updateCampaign
} = require('../controllers/campaignController');

// ✅ Apply authentication middleware to all campaign routes
router.use(auth);

// ✅ Create a new campaign
router.post('/', createCampaign);

// ✅ Get all campaigns (admin or for debug)
router.get('/', getCampaigns);

// ✅ Get campaigns created by logged-in user
router.get('/my', getMyCampaigns);

// ✅ Export a campaign by ID
router.get('/export/:id', exportCampaign);

// ✅ Import a campaign
router.post('/import', importCampaign);

// ✅ Get campaign by ID (must go after static routes like /my or /export/:id)
router.get('/:id', getCampaignById);

// ✅ Update campaign by ID
router.put('/:id', updateCampaign);

module.exports = router;
