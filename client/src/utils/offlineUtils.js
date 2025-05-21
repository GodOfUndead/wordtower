// Offline game state
const OFFLINE_STATE_KEY = 'wordTowerOfflineState';
const OFFLINE_WORDS_KEY = 'wordTowerOfflineWords';

// Save offline game state
export const saveOfflineState = (state) => {
  try {
    localStorage.setItem(OFFLINE_STATE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error saving offline state:', error);
    return false;
  }
};

// Load offline game state
export const loadOfflineState = () => {
  try {
    const state = localStorage.getItem(OFFLINE_STATE_KEY);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error loading offline state:', error);
    return null;
  }
};

// Save offline words
export const saveOfflineWords = (words) => {
  try {
    localStorage.setItem(OFFLINE_WORDS_KEY, JSON.stringify(words));
    return true;
  } catch (error) {
    console.error('Error saving offline words:', error);
    return false;
  }
};

// Load offline words
export const loadOfflineWords = () => {
  try {
    const words = localStorage.getItem(OFFLINE_WORDS_KEY);
    return words ? JSON.parse(words) : null;
  } catch (error) {
    console.error('Error loading offline words:', error);
    return null;
  }
};

// Check if offline mode is available
export const isOfflineModeAvailable = () => {
  return !!loadOfflineWords();
};

// Sync offline progress with server
export const syncOfflineProgress = async (api) => {
  try {
    const offlineState = loadOfflineState();
    if (!offlineState) return true;

    // Sync game results
    if (offlineState.gameResults) {
      for (const result of offlineState.gameResults) {
        await api.post('/api/games/result', result);
      }
    }

    // Sync achievements
    if (offlineState.achievements) {
      for (const achievement of offlineState.achievements) {
        await api.post('/api/achievements/unlock', achievement);
      }
    }

    // Clear offline state after successful sync
    localStorage.removeItem(OFFLINE_STATE_KEY);
    return true;
  } catch (error) {
    console.error('Error syncing offline progress:', error);
    return false;
  }
};

// Save game result for offline sync
export const saveOfflineGameResult = (result) => {
  const state = loadOfflineState() || { gameResults: [] };
  state.gameResults.push(result);
  return saveOfflineState(state);
};

// Save achievement for offline sync
export const saveOfflineAchievement = (achievement) => {
  const state = loadOfflineState() || { achievements: [] };
  state.achievements.push(achievement);
  return saveOfflineState(state);
};

// Check network status
export const checkNetworkStatus = () => {
  return navigator.onLine;
};

// Add network status listeners
export const addNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}; 