// Share text templates
const shareTemplates = {
  win: (score, level) => `I just scored ${score} points and reached level ${level} in Word Tower! Can you beat my score?`,
  achievement: (achievement) => `I just unlocked the "${achievement}" achievement in Word Tower!`,
  challenge: (streak) => `I'm on a ${streak}-day streak in Word Tower's daily challenges!`,
  highScore: (score) => `I just set a new high score of ${score} points in Word Tower!`,
};

// Share URLs
const shareUrls = {
  twitter: 'https://twitter.com/intent/tweet',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  whatsapp: 'https://api.whatsapp.com/send',
  telegram: 'https://t.me/share/url',
};

// Share to social media
export const shareToSocial = (platform, text, url) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `${shareUrls.twitter}?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `${shareUrls.facebook}?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case 'whatsapp':
      shareUrl = `${shareUrls.whatsapp}?text=${encodedText}%20${encodedUrl}`;
      break;
    case 'telegram':
      shareUrl = `${shareUrls.telegram}?url=${encodedUrl}&text=${encodedText}`;
      break;
    default:
      return;
  }
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

// Share game result
export const shareGameResult = (type, data) => {
  const gameUrl = window.location.origin;
  let shareText = '';
  
  switch (type) {
    case 'win':
      shareText = shareTemplates.win(data.score, data.level);
      break;
    case 'achievement':
      shareText = shareTemplates.achievement(data.name);
      break;
    case 'challenge':
      shareText = shareTemplates.challenge(data.streak);
      break;
    case 'highScore':
      shareText = shareTemplates.highScore(data.score);
      break;
    default:
      return;
  }
  
  return {
    text: shareText,
    url: gameUrl,
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Generate share image
export const generateShareImage = async (data) => {
  // This would typically use a canvas to generate an image
  // For now, we'll return a placeholder
  return {
    url: `${window.location.origin}/share-image.png`,
    alt: 'Word Tower Game Result',
  };
};

// Share to native share API if available
export const shareNative = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Word Tower',
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
}; 