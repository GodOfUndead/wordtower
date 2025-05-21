import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const GameContext = createContext(null);

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState({
    letterReveal: 3,
    extraTime: 2,
    wordSkip: 1,
  });

  const startNewGame = useCallback(async () => {
    try {
      const response = await axios.get('/api/game/new');
      setCurrentWord(response.data.word);
      setGuesses([]);
      setGameStatus('playing');
      setTimeLeft(300);
      setLevel(1);
      setCombo(0);
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  }, []);

  const makeGuess = useCallback(async (guess) => {
    try {
      const response = await axios.post('/api/game/guess', { guess });
      const { result, isCorrect, newScore, newCombo } = response.data;

      setGuesses((prev) => [...prev, { guess, result }]);
      
      if (isCorrect) {
        setGameStatus('won');
        setScore(newScore);
        setCombo(newCombo);
        setLevel((prev) => prev + 1);
      } else if (guesses.length >= 5) {
        setGameStatus('lost');
      }

      return result;
    } catch (error) {
      console.error('Error making guess:', error);
      throw error;
    }
  }, [guesses.length]);

  const usePowerUp = useCallback(async (type) => {
    if (powerUps[type] > 0) {
      try {
        const response = await axios.post('/api/game/powerup', { type });
        setPowerUps((prev) => ({ ...prev, [type]: prev[type] - 1 }));
        return response.data;
      } catch (error) {
        console.error('Error using power-up:', error);
        throw error;
      }
    }
  }, [powerUps]);

  const value = {
    currentWord,
    guesses,
    gameStatus,
    score,
    level,
    timeLeft,
    combo,
    powerUps,
    startNewGame,
    makeGuess,
    usePowerUp,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}; 