const fs = require('fs').promises;
const path = require('path');

// Word lists by length
const wordLists = {
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
};

// Load word lists
const loadWordLists = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '../../data/words.json'),
      'utf8'
    );
    const words = JSON.parse(data);
    
    // Sort words by length
    words.forEach((word) => {
      const length = word.length;
      if (length >= 4 && length <= 8) {
        wordLists[length].push(word);
      }
    });
    
    console.log('Word lists loaded successfully');
  } catch (error) {
    console.error('Error loading word lists:', error);
    process.exit(1);
  }
};

// Get random word for level
const getRandomWord = async (level) => {
  // Determine word length based on level
  let length;
  if (level <= 3) length = 4;
  else if (level <= 6) length = 5;
  else if (level <= 9) length = 6;
  else if (level <= 12) length = 7;
  else length = 8;
  
  const words = wordLists[length];
  if (!words || words.length === 0) {
    throw new Error('No words available for this level');
  }
  
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

// Initialize word lists
loadWordLists();

module.exports = {
  getRandomWord,
}; 