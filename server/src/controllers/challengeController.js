const Challenge = require('../models/Challenge');
const { checkWord } = require('../utils/wordUtils');

// Get today's challenge
exports.getTodayChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.getTodayChallenge();
    
    // Get user's attempts for this challenge
    const userAttempts = challenge.attempts.filter(
      attempt => attempt.user.toString() === req.user._id.toString()
    );
    
    // Get user's position in leaderboard
    const userPosition = challenge.leaderboard.findIndex(
      entry => entry.user.toString() === req.user._id.toString()
    );
    
    res.json({
      challenge: {
        date: challenge.date,
        difficulty: challenge.difficulty,
        attempts: userAttempts,
        position: userPosition !== -1 ? userPosition + 1 : null,
        leaderboard: challenge.leaderboard.slice(0, 10).map(entry => ({
          user: entry.user,
          score: entry.score,
          time: entry.time,
          attempts: entry.attempts,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge', error: error.message });
  }
};

// Submit attempt for today's challenge
exports.submitAttempt = async (req, res) => {
  try {
    const { guess } = req.body;
    
    if (!guess) {
      return res.status(400).json({ message: 'Guess is required' });
    }
    
    const challenge = await Challenge.getTodayChallenge();
    
    // Check if user has already completed the challenge
    const userAttempts = challenge.attempts.filter(
      attempt => attempt.user.toString() === req.user._id.toString()
    );
    
    if (userAttempts.length >= 6) {
      return res.status(400).json({ message: 'Maximum attempts reached for today' });
    }
    
    // Check if word is valid
    const isValid = await checkWord(guess);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid word' });
    }
    
    // Check guess against challenge word
    const result = [];
    const challengeWord = challenge.word.toLowerCase();
    const guessWord = guess.toLowerCase();
    
    for (let i = 0; i < challengeWord.length; i++) {
      if (guessWord[i] === challengeWord[i]) {
        result.push('correct');
      } else if (challengeWord.includes(guessWord[i])) {
        result.push('present');
      } else {
        result.push('absent');
      }
    }
    
    // Calculate time taken (in seconds)
    const time = Math.floor((Date.now() - challenge.date) / 1000);
    
    // Add attempt to challenge
    await challenge.addAttempt(req.user._id, guess, result, time);
    
    // Check if challenge is completed
    const isCompleted = result.every(r => r === 'correct');
    
    res.json({
      result,
      isCompleted,
      attempts: userAttempts.length + 1,
      time,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting attempt', error: error.message });
  }
};

// Get challenge history
exports.getChallengeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const challenges = await Challenge.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('leaderboard.user', 'username');
    
    const total = await Challenge.countDocuments();
    
    res.json({
      challenges: challenges.map(challenge => ({
        date: challenge.date,
        difficulty: challenge.difficulty,
        attempts: challenge.attempts.filter(
          attempt => attempt.user.toString() === req.user._id.toString()
        ),
        leaderboard: challenge.leaderboard.slice(0, 10),
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge history', error: error.message });
  }
}; 