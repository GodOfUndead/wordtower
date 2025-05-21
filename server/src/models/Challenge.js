const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  word: {
    type: String,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guess: String,
    result: [String], // 'correct', 'present', 'absent'
    time: Number,
    score: Number,
  }],
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: Number,
    time: Number,
    attempts: Number,
  }],
}, {
  timestamps: true,
});

// Index for efficient querying by date
challengeSchema.index({ date: 1 });

// Method to get today's challenge
challengeSchema.statics.getTodayChallenge = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let challenge = await this.findOne({ date: today });
  
  if (!challenge) {
    // Create new challenge if none exists for today
    const word = await require('../utils/wordUtils').getRandomWord(3); // Medium difficulty
    challenge = await this.create({
      date: today,
      word,
      difficulty: 3,
    });
  }
  
  return challenge;
};

// Method to add attempt
challengeSchema.methods.addAttempt = async function(userId, guess, result, time) {
  const score = this.calculateScore(result, time);
  
  this.attempts.push({
    user: userId,
    guess,
    result,
    time,
    score,
  });
  
  // Update leaderboard
  await this.updateLeaderboard(userId, score, time, this.attempts.length);
  
  return this.save();
};

// Method to calculate score
challengeSchema.methods.calculateScore = function(result, time) {
  const baseScore = 1000;
  const timeBonus = Math.max(0, 60 - time) * 10;
  const accuracyBonus = result.filter(r => r === 'correct').length * 100;
  
  return baseScore + timeBonus + accuracyBonus;
};

// Method to update leaderboard
challengeSchema.methods.updateLeaderboard = async function(userId, score, time, attempts) {
  const existingEntry = this.leaderboard.find(entry => entry.user.toString() === userId.toString());
  
  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.score = score;
      existingEntry.time = time;
      existingEntry.attempts = attempts;
    }
  } else {
    this.leaderboard.push({
      user: userId,
      score,
      time,
      attempts,
    });
  }
  
  // Sort leaderboard by score (descending)
  this.leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 100 entries
  this.leaderboard = this.leaderboard.slice(0, 100);
};

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge; 