const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTodayChallenge,
  submitAttempt,
  getChallengeHistory,
} = require('../controllers/challengeController');

// Get today's challenge
router.get('/today', protect, getTodayChallenge);

// Submit attempt for today's challenge
router.post('/today/attempt', protect, submitAttempt);

// Get challenge history
router.get('/history', protect, getChallengeHistory);

module.exports = router; 