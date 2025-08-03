const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/authenticate');
const { upload } = require('../controllers/uploadController');
router.post('/', auth, multer().single('file'), upload);
module.exports = router;
