const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['game', 'challenge', 'social', 'special'],
  },
  requirement: {
    type: {
      type: String,
      required: true,
      enum: ['score', 'games', 'wins', 'streak', 'challenges', 'perfect', 'social'],
    },
    value: {
      type: Number,
      required: true,
    },
  },
  reward: {
    type: {
      type: String,
      required: true,
      enum: ['points', 'powerup', 'badge'],
    },
    value: {
      type: Number,
      required: true,
    },
  },
}, {
  timestamps: true,
});

// Method to check if user has earned achievement
achievementSchema.statics.checkAchievements = async function(userId, stats) {
  const achievements = await this.find();
  const earnedAchievements = [];
  
  for (const achievement of achievements) {
    const hasEarned = await this.checkAchievement(userId, achievement, stats);
    if (hasEarned) {
      earnedAchievements.push(achievement);
    }
  }
  
  return earnedAchievements;
};

// Method to check individual achievement
achievementSchema.statics.checkAchievement = async function(userId, achievement, stats) {
  const User = require('./User');
  const user = await User.findById(userId);
  
  if (!user) return false;
  
  // Check if user already has this achievement
  if (user.achievements.includes(achievement._id)) {
    return false;
  }
  
  // Check achievement requirements
  switch (achievement.requirement.type) {
    case 'score':
      return stats.totalScore >= achievement.requirement.value;
    
    case 'games':
      return stats.gamesPlayed >= achievement.requirement.value;
    
    case 'wins':
      return stats.gamesWon >= achievement.requirement.value;
    
    case 'streak':
      return stats.currentStreak >= achievement.requirement.value;
    
    case 'challenges':
      return stats.challengesCompleted >= achievement.requirement.value;
    
    case 'perfect':
      return stats.perfectGames >= achievement.requirement.value;
    
    case 'social':
      return stats.friendsCount >= achievement.requirement.value;
    
    default:
      return false;
  }
};

// Method to grant achievement reward
achievementSchema.methods.grantReward = async function(userId) {
  const User = require('./User');
  const user = await User.findById(userId);
  
  if (!user) return;
  
  // Add achievement to user's achievements
  user.achievements.push(this._id);
  
  // Grant reward
  switch (this.reward.type) {
    case 'points':
      user.points += this.reward.value;
      break;
    
    case 'powerup':
      user.powerups.push({
        type: this.reward.value,
        quantity: 1,
      });
      break;
    
    case 'badge':
      user.badges.push(this.reward.value);
      break;
  }
  
  await user.save();
};

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement; 