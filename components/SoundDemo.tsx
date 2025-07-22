'use client'

import { useSound, SOUND_EFFECTS } from '@/utils/useSound';

export default function SoundDemo() {
  const { playSound } = useSound();

  const soundButtons = [
    { name: 'Botón Clic', sound: SOUND_EFFECTS.BUTTON_CLICK, volume: 0.4 },
    { name: 'Ruleta Girando', sound: SOUND_EFFECTS.ROULETTE_SPIN, volume: 0.6 },
    { name: 'Victoria', sound: SOUND_EFFECTS.ROULETTE_WIN, volume: 0.8 },
    { name: 'Derrota', sound: SOUND_EFFECTS.ROULETTE_LOSE, volume: 0.5 },
    { name: 'Pelota Rebotando', sound: SOUND_EFFECTS.ROULETTE_BALL_BOUNCE, volume: 0.3 },
    { name: 'Moneda', sound: SOUND_EFFECTS.COIN_COLLECT, volume: 0.5 },
    { name: 'Subir Nivel', sound: SOUND_EFFECTS.LEVEL_UP, volume: 0.6 },
    { name: 'Recargar Energía', sound: SOUND_EFFECTS.ENERGY_REFILL, volume: 0.5 },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
        Demostración de Sonidos
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {soundButtons.map((button) => (
          <button
            key={button.sound}
            onClick={() => playSound(button.sound, { volume: button.volume })}
            className="px-4 py-3 bg-[#f0b90b] text-black font-semibold rounded-lg hover:bg-[#f3ba2f] transition-colors shadow-lg"
          >
            🔊 {button.name}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Información:</h3>
        <ul className="text-white/80 text-sm space-y-1">
          <li>• Todos los sonidos son generados usando Web Audio API</li>
          <li>• No se requieren archivos de audio externos</li>
          <li>• Los sonidos se reproducen inmediatamente</li>
          <li>• Compatible con todas las políticas de autoplay</li>
        </ul>
      </div>
    </div>
  );
} 