import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    highestLevel: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [statsResponse, achievementsResponse] = await Promise.all([
          axios.get('/api/users/stats'),
          axios.get('/api/users/achievements'),
        ]);

        setStats(statsResponse.data);
        setAchievements(achievementsResponse.data);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Games Played</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Games Won</h3>
            <p className="text-2xl font-bold text-green-600">{stats.gamesWon}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Highest Level</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.highestLevel}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Total Score</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.totalScore}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg ${
                achievement.unlocked
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  {achievement.unlocked ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">?</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile; 