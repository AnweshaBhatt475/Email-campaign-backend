const router = require('express').Router();
const Flow = require('../models/Flow');
const auth = require('../middleware/authenticate');

router.use(auth);

router.post('/', async (req, res) => {
  const flow = await Flow.create({ ...req.body, userId: req.user.id });
  res.json(flow);
});

router.get('/', async (req, res) => {
  const flows = await Flow.find({ userId: req.user.id });
  res.json(flows);
});

module.exports = router;
