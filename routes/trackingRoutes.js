const express = require('express');
const router = express.Router();
const { trackOpen, trackClick } = require('../controllers/trackingController');

router.get('/open/:campaignId/:customerId', trackOpen);
router.get('/click/:campaignId/:customerId', trackClick);

module.exports = router;
