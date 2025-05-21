class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = localStorage.getItem('soundMuted') === 'true';
    this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.5;
  }

  // Load all sound effects
  loadSounds() {
    const soundFiles = {
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      win: '/sounds/win.mp3',
      lose: '/sounds/lose.mp3',
      powerup: '/sounds/powerup.mp3',
      button: '/sounds/button.mp3',
      achievement: '/sounds/achievement.mp3',
      levelUp: '/sounds/level-up.mp3',
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      this.sounds[key] = new Audio(path);
      this.sounds[key].volume = this.volume;
    });
  }

  // Play a sound effect
  play(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;

    // Clone the audio to allow multiple plays
    const sound = this.sounds[soundName].cloneNode();
    sound.volume = this.volume;
    sound.play().catch(error => {
      console.warn('Error playing sound:', error);
    });
  }

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('soundMuted', this.isMuted);
    return this.isMuted;
  }

  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume);
    
    // Update volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Get mute state
  isSoundMuted() {
    return this.isMuted;
  }
}

// Create a singleton instance
const soundManager = new SoundManager();
export default soundManager; 