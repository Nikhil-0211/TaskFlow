const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../utils/validation');
const auth = require('../middleware/auth');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);

module.exports = router;
