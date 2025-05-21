const express = require('express');
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getRandomWord } = require('../utils/wordUtils');
const router = express.Router();

// Start new game
router.get('/new', auth, async (req, res) => {
  try {
    // Get user's current level
    const user = await User.findById(req.user._id);
    const level = user.highestLevel;
    
    // Get appropriate word for level
    const word = await getRandomWord(level);
    
    // Create new game
    const game = new Game({
      user: req.user._id,
      word,
      level,
    });
    
    await game.save();
    
    res.json({ word: game.word });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Make a guess
router.post('/guess', auth, async (req, res) => {
  try {
    const { guess } = req.body;
    const game = await Game.findOne({
      user: req.user._id,
      status: 'playing',
    });
    
    if (!game) {
      return res.status(404).json({ message: 'No active game found' });
    }
    
    // Check guess
    const result = game.checkGuess(guess);
    game.guesses.push({ word: guess, result });
    
    // Check if won
    const isCorrect = result.every((r) => r === 'correct');
    if (isCorrect) {
      game.endGame('won');
      
      // Update user stats
      const user = await User.findById(req.user._id);
      user.updateStats({
        guesses: game.guesses.length,
        timeSpent: game.timeSpent,
        score: game.score,
        level: game.level,
        combo: game.combo,
        won: true,
      });
      await user.save();
      
      // Increment combo
      game.combo += 1;
    } else if (game.guesses.length >= 6) {
      game.endGame('lost');
      
      // Update user stats
      const user = await User.findById(req.user._id);
      user.updateStats({
        guesses: game.guesses.length,
        timeSpent: game.timeSpent,
        score: game.score,
        level: game.level,
        combo: game.combo,
        won: false,
      });
      await user.save();
      
      // Reset combo
      game.combo = 0;
    }
    
    await game.save();
    
    res.json({
      result,
      isCorrect,
      newScore: game.score,
      newCombo: game.combo,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Use power-up
router.post('/powerup', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const game = await Game.findOne({
      user: req.user._id,
      status: 'playing',
    });
    
    if (!game) {
      return res.status(404).json({ message: 'No active game found' });
    }
    
    // Record power-up usage
    game.powerUpsUsed.push({ type });
    await game.save();
    
    let result;
    switch (type) {
      case 'letterReveal':
        // Reveal a random incorrect letter
        const revealedIndex = Math.floor(Math.random() * game.word.length);
        result = { revealedIndex, letter: game.word[revealedIndex] };
        break;
      case 'extraTime':
        // Add 30 seconds
        result = { timeAdded: 30 };
        break;
      case 'wordSkip':
        // Skip to next word
        const newWord = await getRandomWord(game.level);
        game.word = newWord;
        result = { newWord };
        break;
      default:
        throw new Error('Invalid power-up type');
    }
    
    await game.save();
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get game history
router.get('/history', auth, async (req, res) => {
  try {
    const games = await Game.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(games);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 