const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authenticate');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // ✅ this fixes the 404 issue

module.exports = router;
