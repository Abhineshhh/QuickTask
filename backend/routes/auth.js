const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validators');
const auth = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);

module.exports = router;
