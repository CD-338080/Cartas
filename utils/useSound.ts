import { useCallback, useRef } from 'react';
import { soundGenerator } from './soundGenerator';

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
}

export const useSound = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundName: string, config: SoundConfig = {}) => {
    // Use generated sounds by default for immediate audio experience
    playGeneratedSound(soundName, config.volume || 0.5);
    
    // Optionally try to load audio files if they exist (for future use)
    try {
      if (!audioRefs.current[soundName]) {
        const audio = new Audio(`/sounds/${soundName}.mp3`);
        audio.preload = 'auto';
        audioRefs.current[soundName] = audio;
      }

      const audio = audioRefs.current[soundName];
      
      // Apply configuration
      if (config.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, config.volume));
      }
      
      if (config.loop !== undefined) {
        audio.loop = config.loop;
      }
      
      if (config.playbackRate !== undefined) {
        audio.playbackRate = config.playbackRate;
      }

      // Try to play audio file, but don't wait for it
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently fail - we're already using generated sounds
      });
    } catch (error) {
      // Silently fail - we're already using generated sounds
    }
  }, []);

  // Fallback function to play generated sounds
  const playGeneratedSound = (soundName: string, volume: number) => {
    switch (soundName) {
      case SOUND_EFFECTS.BUTTON_CLICK:
        soundGenerator.playButtonClick(volume);
        break;
      case SOUND_EFFECTS.ROULETTE_SPIN:
        soundGenerator.playRouletteSpin(volume);
        break;
      case SOUND_EFFECTS.ROULETTE_WIN:
        soundGenerator.playWin(volume);
        break;
      case SOUND_EFFECTS.ROULETTE_LOSE:
        soundGenerator.playLose(volume);
        break;
      case SOUND_EFFECTS.ROULETTE_BALL_BOUNCE:
        soundGenerator.playBallBounce(volume);
        break;
      case SOUND_EFFECTS.COIN_COLLECT:
        soundGenerator.playCoinCollect(volume);
        break;
      case SOUND_EFFECTS.LEVEL_UP:
        soundGenerator.playLevelUp(volume);
        break;
      case SOUND_EFFECTS.ENERGY_REFILL:
        soundGenerator.playEnergyRefill(volume);
        break;
      case SOUND_EFFECTS.BACKGROUND_MUSIC:
        soundGenerator.playBackgroundMusic(volume);
        break;
      case SOUND_EFFECTS.CARD_DEAL:
        soundGenerator.playCardDeal(volume);
        break;
      case SOUND_EFFECTS.CARD_FLIP:
        soundGenerator.playCardFlip(volume);
        break;
      case SOUND_EFFECTS.CHIP_SOUND:
        soundGenerator.playChipSound(volume);
        break;
      default:
        soundGenerator.playButtonClick(volume);
        break;
    }
  };

  const stopSound = useCallback((soundName: string) => {
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setVolume = useCallback((soundName: string, volume: number) => {
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setGlobalVolume = useCallback((volume: number) => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = Math.max(0, Math.min(1, volume));
    });
  }, []);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setVolume,
    setGlobalVolume,
  };
};

// Predefined sound effects for the game
export const SOUND_EFFECTS = {
  // Roulette sounds
  ROULETTE_SPIN: 'roulette-spin',
  ROULETTE_WIN: 'roulette-win',
  ROULETTE_LOSE: 'roulette-lose',
  ROULETTE_BALL_BOUNCE: 'roulette-ball-bounce',
  
  // UI sounds
  BUTTON_CLICK: 'button-click',
  BUTTON_HOVER: 'button-hover',
  POPUP_OPEN: 'popup-open',
  POPUP_CLOSE: 'popup-close',
  
  // Game sounds
  COIN_COLLECT: 'coin-collect',
  LEVEL_UP: 'level-up',
  ENERGY_REFILL: 'energy-refill',
  
  // Blackjack specific sounds
  CARD_DEAL: 'card-deal',
  CARD_FLIP: 'card-flip',
  CHIP_SOUND: 'chip-sound',
  
  // Background music
  BACKGROUND_MUSIC: 'background-music',
  CASINO_AMBIENCE: 'casino-ambience',
} as const;

export type SoundEffect = typeof SOUND_EFFECTS[keyof typeof SOUND_EFFECTS]; 