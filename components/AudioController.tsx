'use client'

import { useState, useEffect } from 'react';
import { useSound } from '@/utils/useSound';

interface AudioControllerProps {
  className?: string;
}

export default function AudioController({ className = '' }: AudioControllerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const { playSound, stopSound, setGlobalVolume } = useSound();

  useEffect(() => {
    // Load saved audio preferences
    const savedMuted = localStorage.getItem('audioMuted');
    const savedVolume = localStorage.getItem('audioVolume');
    
    if (savedMuted !== null) {
      setIsMuted(savedMuted === 'true');
    }
    
    if (savedVolume !== null) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      setGlobalVolume(vol);
    }
  }, [setGlobalVolume]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('audioMuted', newMuted.toString());
    
    if (newMuted) {
      setGlobalVolume(0);
    } else {
      setGlobalVolume(volume);
    }
    
    // Play a test sound
    if (!newMuted) {
      playSound('button-click', { volume: 0.3 });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('audioVolume', newVolume.toString());
    
    if (!isMuted) {
      setGlobalVolume(newVolume);
    }
  };

  const toggleBackgroundMusic = () => {
    if (isMusicPlaying) {
      stopSound('background-music');
      setIsMusicPlaying(false);
    } else {
      playSound('background-music', { 
        volume: isMuted ? 0 : volume * 0.5, 
        loop: true 
      });
      setIsMusicPlaying(true);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Volume Slider */}
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          disabled={isMuted}
        />
      </div>

      {/* Background Music Toggle */}
      <button
        onClick={toggleBackgroundMusic}
        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200"
        title={isMusicPlaying ? 'Stop Music' : 'Play Music'}
      >
        {isMusicPlaying ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f0b90b;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f0b90b;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
} 