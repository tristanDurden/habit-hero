// alarm.ts - Standalone alarm utility that can be used outside React components

let audioInstance: HTMLAudioElement | null = null;

function getAudioInstance(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  
  if (!audioInstance) {
    audioInstance = new Audio("/sounds/boombaclat.mp3");
    audioInstance.preload = "auto";
    audioInstance.volume = 0.7;
    audioInstance.loop = true;
    
    // Handle audio errors
    audioInstance.addEventListener("error", (e) => {
      console.error("Audio error:", e);
    });
  }
  
  return audioInstance;
}


export function playAlarm() {
  const audio = getAudioInstance();
  if (!audio) return;
  console.log("Playing alarm");
  // Reset to beginning and play
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore autoplay errors
  });
}

export function stopAlarm() {
  const audio = getAudioInstance();
  if (!audio) return;
  
  audio.pause();
  audio.currentTime = 0;
}

