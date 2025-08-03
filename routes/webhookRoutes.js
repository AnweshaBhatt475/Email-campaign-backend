const router = require('express').Router();
const { receiveWebhook } = require('../controllers/webhookController');

router.post('/', receiveWebhook);

module.exports = router;
