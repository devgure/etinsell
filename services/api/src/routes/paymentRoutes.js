const express = require('express');
const { createCheckoutSession, webhook, tip } = require('../controllers/paymentController');
const router = express.Router();

router.post('/checkout', createCheckoutSession);
router.post('/webhook', webhook);
router.post('/tip', tip);

module.exports = router;
