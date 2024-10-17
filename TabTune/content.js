function pauseAndMuteMedia() {
  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach((media) => {
    if (!media.paused) {
      media.pause();
    }
    media.muted = true;
  });
}

function playAndUnmuteMedia() {
  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach((media) => {
    media.muted = false;
    if (media.paused) {
      media.play().catch(e => console.log("Autoplay prevented:", e));
    }
  });
}

// Listen for play/pause messages
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'pauseAndMute') {
    pauseAndMuteMedia();
  } else if (message.action === 'playAndUnmute') {
    playAndUnmuteMedia();
  }
});