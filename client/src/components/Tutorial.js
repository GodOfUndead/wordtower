import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tutorialSteps = [
  {
    title: 'Welcome to Word Tower!',
    content: 'Learn how to play and become a word master.',
    position: 'center',
  },
  {
    title: 'Guess the Word',
    content: 'Type a word and press Enter. The letters will change color to show if they are correct.',
    position: 'top',
  },
  {
    title: 'Letter Colors',
    content: 'Green means correct letter in correct position. Yellow means correct letter in wrong position. Gray means letter not in word.',
    position: 'middle',
  },
  {
    title: 'Power-ups',
    content: 'Use power-ups to help you solve words faster. Each power-up has a unique ability.',
    position: 'bottom',
  },
  {
    title: 'Scoring',
    content: 'Earn points for correct guesses. Bonus points for speed and accuracy!',
    position: 'middle',
  },
  {
    title: 'Daily Challenges',
    content: 'Complete daily challenges to earn extra rewards and compete with friends.',
    position: 'top',
  },
  {
    title: 'Ready to Play!',
    content: 'Start your word-guessing adventure now!',
    position: 'center',
  },
];

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if tutorial has been completed before
    const hasCompletedTutorial = localStorage.getItem('tutorialCompleted');
    if (hasCompletedTutorial) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark tutorial as completed
      localStorage.setItem('tutorialCompleted', 'true');
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {tutorialSteps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-6">
              {tutorialSteps[currentStep].content}
            </p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip Tutorial
              </button>
              
              <div className="flex space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tutorial; 