'use client'

import { useState, useEffect } from 'react';
import { useSound, SOUND_EFFECTS } from '@/utils/useSound';

interface AudioSettingsProps {
  className?: string;
}

export default function AudioSettings({ className = '' }: AudioSettingsProps) {
  const [settings, setSettings] = useState({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    isMuted: false,
    enableSfx: true,
    enableMusic: true,
    enableHaptic: true,
  });

  const { playSound, setGlobalVolume } = useSound();

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('audioSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('audioSettings', JSON.stringify(newSettings));
    
    // Apply volume changes
    if (!newSettings.isMuted) {
      setGlobalVolume(newSettings.masterVolume);
    }
  };

  const handleMasterVolumeChange = (volume: number) => {
    const newSettings = { ...settings, masterVolume: volume };
    saveSettings(newSettings);
    
    if (!newSettings.isMuted) {
      setGlobalVolume(volume);
    }
  };

  const handleSfxVolumeChange = (volume: number) => {
    saveSettings({ ...settings, sfxVolume: volume });
  };

  const handleMusicVolumeChange = (volume: number) => {
    saveSettings({ ...settings, musicVolume: volume });
  };

  const toggleMute = () => {
    const newMuted = !settings.isMuted;
    const newSettings = { ...settings, isMuted: newMuted };
    saveSettings(newSettings);
    
    if (newMuted) {
      setGlobalVolume(0);
    } else {
      setGlobalVolume(settings.masterVolume);
    }
    
    // Play test sound
    if (!newMuted && settings.enableSfx) {
      playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: settings.sfxVolume * 0.5 });
    }
  };

  const toggleSfx = () => {
    const newEnableSfx = !settings.enableSfx;
    saveSettings({ ...settings, enableSfx: newEnableSfx });
    
    if (newEnableSfx && !settings.isMuted) {
      playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: settings.sfxVolume * 0.5 });
    }
  };

  const toggleMusic = () => {
    saveSettings({ ...settings, enableMusic: !settings.enableMusic });
  };

  const toggleHaptic = () => {
    saveSettings({ ...settings, enableHaptic: !settings.enableHaptic });
  };

  const testSound = (soundType: keyof typeof SOUND_EFFECTS) => {
    if (!settings.isMuted && settings.enableSfx) {
      playSound(SOUND_EFFECTS[soundType], { volume: settings.sfxVolume });
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
        Configuración de Audio
      </h2>

      <div className="space-y-6">
        {/* Master Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Volumen Principal
            </label>
            <span className="text-white/70 text-sm">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.isMuted ? 0 : settings.masterVolume}
            onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            disabled={settings.isMuted}
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Efectos de Sonido
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => testSound('BUTTON_CLICK')}
                className="px-2 py-1 bg-[#f0b90b] text-black text-xs rounded hover:bg-[#f3ba2f] transition-colors"
              >
                Test
              </button>
              <span className="text-white/70 text-sm">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.sfxVolume}
            onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            disabled={!settings.enableSfx}
          />
        </div>

        {/* Music Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Música de Fondo
            </label>
            <span className="text-white/70 text-sm">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.musicVolume}
            onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            disabled={!settings.enableMusic}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Silenciar Todo</span>
            <button
              onClick={toggleMute}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.isMuted ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.isMuted ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Efectos de Sonido</span>
            <button
              onClick={toggleSfx}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableSfx ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.enableSfx ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Música de Fondo</span>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableMusic ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.enableMusic ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Vibración</span>
            <button
              onClick={toggleHaptic}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableHaptic ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.enableHaptic ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Test Sounds */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Probar Sonidos</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => testSound('ROULETTE_SPIN')}
              className="px-3 py-2 bg-[#f0b90b] text-black text-sm rounded hover:bg-[#f3ba2f] transition-colors"
            >
              Ruleta
            </button>
            <button
              onClick={() => testSound('ROULETTE_WIN')}
              className="px-3 py-2 bg-[#f0b90b] text-black text-sm rounded hover:bg-[#f3ba2f] transition-colors"
            >
              Victoria
            </button>
            <button
              onClick={() => testSound('COIN_COLLECT')}
              className="px-3 py-2 bg-[#f0b90b] text-black text-sm rounded hover:bg-[#f3ba2f] transition-colors"
            >
              Moneda
            </button>
            <button
              onClick={() => testSound('LEVEL_UP')}
              className="px-3 py-2 bg-[#f0b90b] text-black text-sm rounded hover:bg-[#f3ba2f] transition-colors"
            >
              Nivel
            </button>
          </div>
        </div>
      </div>

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