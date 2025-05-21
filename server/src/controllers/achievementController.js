const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Get all achievements
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    const user = await User.findById(req.user._id).populate('achievements');
    
    // Map achievements with user's progress
    const achievementsWithProgress = achievements.map(achievement => {
      const hasEarned = user.achievements.some(a => a._id.toString() === achievement._id.toString());
      return {
        ...achievement.toObject(),
        hasEarned,
      };
    });
    
    res.json(achievementsWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
};

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements');
    res.json(user.achievements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user achievements', error: error.message });
  }
};

// Check for new achievements
exports.checkAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user's stats
    const stats = {
      totalScore: user.totalScore,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      currentStreak: user.currentStreak,
      challengesCompleted: user.challengesCompleted,
      perfectGames: user.perfectGames,
      friendsCount: user.friends.length,
    };
    
    // Check for new achievements
    const earnedAchievements = await Achievement.checkAchievements(user._id, stats);
    
    // Grant rewards for earned achievements
    for (const achievement of earnedAchievements) {
      await achievement.grantReward(user._id);
    }
    
    res.json({
      message: 'Achievements checked successfully',
      earnedAchievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking achievements', error: error.message });
  }
};

// Get achievement progress
exports.getAchievementProgress = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    const user = await User.findById(req.user._id);
    
    // Get user's stats
    const stats = {
      totalScore: user.totalScore,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      currentStreak: user.currentStreak,
      challengesCompleted: user.challengesCompleted,
      perfectGames: user.perfectGames,
      friendsCount: user.friends.length,
    };
    
    // Calculate progress for each achievement
    const progress = achievements.map(achievement => {
      const hasEarned = user.achievements.includes(achievement._id);
      let currentValue = 0;
      let targetValue = achievement.requirement.value;
      
      switch (achievement.requirement.type) {
        case 'score':
          currentValue = stats.totalScore;
          break;
        case 'games':
          currentValue = stats.gamesPlayed;
          break;
        case 'wins':
          currentValue = stats.gamesWon;
          break;
        case 'streak':
          currentValue = stats.currentStreak;
          break;
        case 'challenges':
          currentValue = stats.challengesCompleted;
          break;
        case 'perfect':
          currentValue = stats.perfectGames;
          break;
        case 'social':
          currentValue = stats.friendsCount;
          break;
      }
      
      return {
        achievement: achievement._id,
        name: achievement.name,
        currentValue,
        targetValue,
        progress: Math.min(100, (currentValue / targetValue) * 100),
        hasEarned,
      };
    });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievement progress', error: error.message });
  }
}; 