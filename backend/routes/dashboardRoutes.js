const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protected dashboard route
router.get('/dashboard', ensureAuthenticated, getDashboard);

// Root → redirect to dashboard or login
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

module.exports = router;
