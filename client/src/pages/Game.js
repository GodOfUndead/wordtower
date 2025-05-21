import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Game = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    word: '',
    guesses: [],
    currentGuess: '',
    attempts: 0,
    maxAttempts: 6,
    gameOver: false,
    won: false,
    score: 0,
    level: 1,
    timeLeft: 60,
    powerUps: {
      reveal: 3,
      extraTime: 2,
      skip: 1,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const startNewGame = useCallback(async () => {
    try {
      const response = await axios.get('/api/game/new');
      setGameState((prev) => ({
        ...prev,
        word: response.data.word,
        guesses: [],
        currentGuess: '',
        attempts: 0,
        gameOver: false,
        won: false,
        timeLeft: 60,
      }));
      setMessage('');
    } catch (err) {
      setError('Failed to start new game');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    let timer;
    if (!gameState.gameOver && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && !gameState.gameOver) {
      handleGameOver(false);
    }
    return () => clearInterval(timer);
  }, [gameState.timeLeft, gameState.gameOver]);

  const handleKeyPress = (key) => {
    if (gameState.gameOver) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
    } else if (/^[a-zA-Z]$/.test(key)) {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess + key.toLowerCase(),
      }));
    }
  };

  const submitGuess = async () => {
    if (
      gameState.currentGuess.length !== gameState.word.length ||
      gameState.attempts >= gameState.maxAttempts
    ) {
      return;
    }

    try {
      const response = await axios.post('/api/game/guess', {
        guess: gameState.currentGuess,
      });

      const { correct, score, level } = response.data;

      setGameState((prev) => ({
        ...prev,
        guesses: [...prev.guesses, gameState.currentGuess],
        currentGuess: '',
        attempts: prev.attempts + 1,
        score,
        level,
        gameOver: correct || prev.attempts + 1 >= prev.maxAttempts,
        won: correct,
      }));

      if (correct) {
        setMessage('Congratulations! You won!');
      } else if (gameState.attempts + 1 >= gameState.maxAttempts) {
        setMessage(`Game Over! The word was ${gameState.word}`);
      }
    } catch (err) {
      setError('Failed to submit guess');
    }
  };

  const handleGameOver = async (won) => {
    try {
      await axios.post('/api/game/end', { won });
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        won,
      }));
    } catch (err) {
      setError('Failed to end game');
    }
  };

  const usePowerUp = async (type) => {
    if (gameState.powerUps[type] <= 0) return;

    try {
      const response = await axios.post('/api/game/powerup', { type });
      const { result } = response.data;

      setGameState((prev) => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [type]: prev.powerUps[type] - 1,
        },
        ...(type === 'extraTime' && { timeLeft: prev.timeLeft + 30 }),
        ...(type === 'reveal' && { word: result }),
        ...(type === 'skip' && { word: result }),
      }));
    } catch (err) {
      setError('Failed to use power-up');
    }
  };

  const getLetterStatus = (letter, index) => {
    if (!gameState.guesses.some((guess) => guess[index] === letter)) {
      return 'bg-gray-200';
    }
    if (gameState.word[index] === letter) {
      return 'bg-green-500 text-white';
    }
    if (gameState.word.includes(letter)) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Level {gameState.level}</h1>
            <p className="text-gray-600">Score: {gameState.score}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Time Left: {gameState.timeLeft}s</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => usePowerUp('reveal')}
                disabled={gameState.powerUps.reveal <= 0}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md disabled:opacity-50"
              >
                Reveal ({gameState.powerUps.reveal})
              </button>
              <button
                onClick={() => usePowerUp('extraTime')}
                disabled={gameState.powerUps.extraTime <= 0}
                className="px-3 py-1 bg-green-100 text-green-600 rounded-md disabled:opacity-50"
              >
                +30s ({gameState.powerUps.extraTime})
              </button>
              <button
                onClick={() => usePowerUp('skip')}
                disabled={gameState.powerUps.skip <= 0}
                className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md disabled:opacity-50"
              >
                Skip ({gameState.powerUps.skip})
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {Array.from({ length: gameState.maxAttempts }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-2">
              {Array.from({ length: gameState.word.length }).map((_, colIndex) => {
                const letter = gameState.guesses[rowIndex]?.[colIndex] || '';
                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-md ${
                      gameState.guesses[rowIndex]
                        ? getLetterStatus(letter, colIndex)
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {letter.toUpperCase()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {message && (
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-900">{message}</p>
          </div>
        )}

        {gameState.gameOver ? (
          <div className="text-center">
            <button
              onClick={startNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 26 }).map((_, index) => {
              const letter = String.fromCharCode(65 + index);
              return (
                <button
                  key={letter}
                  onClick={() => handleKeyPress(letter)}
                  className="w-10 h-10 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 