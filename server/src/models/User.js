const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    score: {
      type: Number,
      default: 0,
    },
    highestLevel: {
      type: Number,
      default: 1,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    achievements: [{
      type: String,
      enum: [
        'FIRST_WIN',
        'LEVEL_5',
        'LEVEL_10',
        'SCORE_1000',
        'SCORE_5000',
        'PERFECT_GAME',
        'SPEED_DEMON',
      ],
    }],
    stats: {
      averageGuesses: {
        type: Number,
        default: 0,
      },
      fastestSolve: {
        type: Number,
        default: null,
      },
      longestCombo: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update stats after a game
userSchema.methods.updateStats = function (gameResult) {
  const { guesses, timeSpent, score, level, combo } = gameResult;
  
  this.gamesPlayed += 1;
  if (gameResult.won) {
    this.gamesWon += 1;
  }
  
  this.score += score;
  this.highestLevel = Math.max(this.highestLevel, level);
  
  // Update average guesses
  this.stats.averageGuesses = 
    (this.stats.averageGuesses * (this.gamesPlayed - 1) + guesses) / this.gamesPlayed;
  
  // Update fastest solve
  if (gameResult.won && (!this.stats.fastestSolve || timeSpent < this.stats.fastestSolve)) {
    this.stats.fastestSolve = timeSpent;
  }
  
  // Update longest combo
  this.stats.longestCombo = Math.max(this.stats.longestCombo, combo);
  
  // Check for achievements
  this.checkAchievements();
};

// Method to check and update achievements
userSchema.methods.checkAchievements = function () {
  const newAchievements = [];
  
  if (this.gamesWon === 1 && !this.achievements.includes('FIRST_WIN')) {
    newAchievements.push('FIRST_WIN');
  }
  if (this.highestLevel >= 5 && !this.achievements.includes('LEVEL_5')) {
    newAchievements.push('LEVEL_5');
  }
  if (this.highestLevel >= 10 && !this.achievements.includes('LEVEL_10')) {
    newAchievements.push('LEVEL_10');
  }
  if (this.score >= 1000 && !this.achievements.includes('SCORE_1000')) {
    newAchievements.push('SCORE_1000');
  }
  if (this.score >= 5000 && !this.achievements.includes('SCORE_5000')) {
    newAchievements.push('SCORE_5000');
  }
  if (this.stats.fastestSolve && this.stats.fastestSolve < 60 && !this.achievements.includes('SPEED_DEMON')) {
    newAchievements.push('SPEED_DEMON');
  }
  
  this.achievements.push(...newAchievements);
  return newAchievements;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 