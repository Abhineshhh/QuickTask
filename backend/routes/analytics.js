const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserStats, getProductivity } = require('../controllers/analyticsController');

/** Health check for the analytics service */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics' });
});

/** User aggregate statistics */
router.get('/user-stats/:userId', auth, getUserStats);

/** Productivity trends over time */
router.get('/productivity/:userId', auth, getProductivity);

module.exports = router;
