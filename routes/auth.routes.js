//auth.routes.js

const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const imageUpload = require('../utils/imageUpload')

const auth = require('../controllers/auth.controller');

router.post('/register', imageUpload.single('avatar'), auth.register);
router.post('/login', auth.login);
router.post('/logout', authMiddleware, auth.logout);
router.get('/user', authMiddleware, auth.getUser);

module.exports = router;