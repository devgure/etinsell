const express = require('express');
const { getProfile } = require('../controllers/authController');
const router = express.Router();

router.get('/', getProfile);

module.exports = router;
