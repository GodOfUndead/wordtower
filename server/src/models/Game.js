const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
      default: 1,
    },
    guesses: [{
      word: String,
      result: [{
        type: String,
        enum: ['correct', 'present', 'absent'],
      }],
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    status: {
      type: String,
      enum: ['playing', 'won', 'lost'],
      default: 'playing',
    },
    score: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    timeSpent: Number, // in seconds
    combo: {
      type: Number,
      default: 0,
    },
    powerUpsUsed: [{
      type: {
        type: String,
        enum: ['letterReveal', 'extraTime', 'wordSkip'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Method to calculate score
gameSchema.methods.calculateScore = function () {
  const basePoints = this.level * 100;
  const attemptsLeft = 6 - this.guesses.length;
  const timeBonus = Math.max(0, 300 - this.timeSpent) * 2;
  const comboMultiplier = 1 + (this.combo * 0.1);
  
  this.score = Math.floor(
    (basePoints + (attemptsLeft * 50) + timeBonus) * comboMultiplier
  );
  
  return this.score;
};

// Method to check if guess is correct
gameSchema.methods.checkGuess = function (guess) {
  const result = [];
  const wordArray = this.word.split('');
  const guessArray = guess.split('');
  
  // First pass: mark correct letters
  for (let i = 0; i < wordArray.length; i++) {
    if (guessArray[i] === wordArray[i]) {
      result[i] = 'correct';
      wordArray[i] = null;
      guessArray[i] = null;
    }
  }
  
  // Second pass: mark present letters
  for (let i = 0; i < wordArray.length; i++) {
    if (guessArray[i] === null) continue;
    
    const index = wordArray.indexOf(guessArray[i]);
    if (index !== -1) {
      result[i] = 'present';
      wordArray[index] = null;
    } else {
      result[i] = 'absent';
    }
  }
  
  return result;
};

// Method to end game
gameSchema.methods.endGame = function (status) {
  this.status = status;
  this.endTime = new Date();
  this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
  this.calculateScore();
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game; 