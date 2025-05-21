const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAchievements,
  getUserAchievements,
  checkAchievements,
  getAchievementProgress,
} = require('../controllers/achievementController');

// Get all achievements
router.get('/', protect, getAchievements);

// Get user's achievements
router.get('/user', protect, getUserAchievements);

// Check for new achievements
router.post('/check', protect, checkAchievements);

// Get achievement progress
router.get('/progress', protect, getAchievementProgress);

module.exports = router; 