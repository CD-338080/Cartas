// Generador de sonidos usando Web Audio API
// Esto crea sonidos básicos para el juego sin necesidad de archivos externos

export class SoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext solo cuando sea necesario
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Sonido de clic de botón
  playButtonClick(volume: number = 0.3) {
    const context = this.ensureAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    // Configurar filtro para sonido más natural
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, context.currentTime + 0.1);

    oscillator.frequency.setValueAtTime(1200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }

  // Sonido de ruleta girando
  playRouletteSpin(volume: number = 0.4) {
    const context = this.ensureAudioContext();
    
    // Crear múltiples osciladores para un sonido más rico
    for (let i = 0; i < 3; i++) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido mecánico
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500 + i * 200, context.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100 + i * 50, context.currentTime + 2);

      oscillator.frequency.setValueAtTime(80 + i * 20, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40 + i * 10, context.currentTime + 2);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(volume * (0.7 - i * 0.2), context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 2);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 2);
    }
  }

  // Sonido de victoria
  playWin(volume: number = 0.6) {
    const context = this.ensureAudioContext();
    
    // Crear secuencia de tonos ascendentes más elaborada
    const frequencies = [523, 659, 784, 1047, 1319]; // C, E, G, C, E
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido más brillante
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, context.currentTime);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);

      oscillator.start(context.currentTime + index * 0.08);
      oscillator.stop(context.currentTime + index * 0.08 + 0.4);
    });

    // Agregar un "ding" final
    setTimeout(() => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(1047, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2093, context.currentTime + 0.2);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume * 0.6, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);
    }, 400);
  }

  // Sonido de derrota
  playLose(volume: number = 0.4) {
    const context = this.ensureAudioContext();
    
    // Crear secuencia de tonos descendentes
    const frequencies = [400, 350, 300, 250, 200];
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido más suave
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, context.currentTime);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime + index * 0.06);
      oscillator.stop(context.currentTime + index * 0.06 + 0.3);
    });
  }

  // Sonido de pelota rebotando
  playBallBounce(volume: number = 0.3) {
    const context = this.ensureAudioContext();
    
    // Crear múltiples rebotes con diferentes frecuencias
    for (let i = 0; i < 2; i++) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido de rebote
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400 + i * 100, context.currentTime);
      filter.Q.setValueAtTime(2, context.currentTime);

      oscillator.frequency.setValueAtTime(250 + i * 50, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(120 + i * 30, context.currentTime + 0.15);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * (0.8 - i * 0.3), context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

      oscillator.start(context.currentTime + i * 0.05);
      oscillator.stop(context.currentTime + i * 0.05 + 0.15);
    }
  }

  // Sonido de moneda
  playCoinCollect(volume: number = 0.5) {
    const context = this.ensureAudioContext();
    
    // Crear secuencia de "dings" de moneda
    const frequencies = [800, 1000, 1200, 1000];
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido metálico
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(600, context.currentTime);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.08);

      oscillator.start(context.currentTime + index * 0.04);
      oscillator.stop(context.currentTime + index * 0.04 + 0.08);
    });
  }

  // Sonido de nivel subido
  playLevelUp(volume: number = 0.6) {
    const context = this.ensureAudioContext();
    
    // Crear secuencia de tonos ascendentes más elaborada
    const frequencies = [523, 659, 784, 1047, 1319, 1568]; // C, E, G, C, E, G
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido brillante
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(300, context.currentTime);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime + index * 0.06);
      oscillator.stop(context.currentTime + index * 0.06 + 0.5);
    });

    // Agregar un "fanfare" final
    setTimeout(() => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(1047, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2093, context.currentTime + 0.3);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume * 0.8, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    }, 500);
  }

  // Música de fondo estilo casino (loop animado)
  playBackgroundMusic(volume: number = 0.2) {
    const context = this.ensureAudioContext();
    
    // Melodía principal (arpegio mayor y séptima)
    const melody = [
      { freq: 392, duration: 0.25 }, // G
      { freq: 523, duration: 0.25 }, // C (octava)
      { freq: 659, duration: 0.25 }, // E
      { freq: 784, duration: 0.25 }, // G (octava)
      { freq: 698, duration: 0.25 }, // F
      { freq: 880, duration: 0.25 }, // A
      { freq: 1047, duration: 0.25 }, // C (más agudo)
      { freq: 784, duration: 0.25 }, // G
    ];

    // Walking bass (bajo animado)
    const bass = [
      { freq: 98, duration: 0.5 }, // G2
      { freq: 130, duration: 0.5 }, // C3
      { freq: 146, duration: 0.5 }, // D3
      { freq: 130, duration: 0.5 }, // C3
    ];

    // Percusión sintética (hi-hat y bombo)
    const percussion = [
      { type: 'kick', time: 0 },
      { type: 'hihat', time: 0.25 },
      { type: 'kick', time: 0.5 },
      { type: 'hihat', time: 0.75 },
      { type: 'kick', time: 1.0 },
      { type: 'hihat', time: 1.25 },
      { type: 'kick', time: 1.5 },
      { type: 'hihat', time: 1.75 },
    ];

    let currentTime = context.currentTime;
    const melodyDuration = melody.reduce((sum, note) => sum + note.duration, 0);
    const bassDuration = bass.reduce((sum, note) => sum + note.duration, 0);
    const loopDuration = Math.max(melodyDuration, bassDuration, 2);

    const playLoop = () => {
      // Melodía principal (arpegio)
      let melodyTime = currentTime;
      melody.forEach((note, i) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, melodyTime);
        osc.frequency.setValueAtTime(note.freq, melodyTime);
        osc.type = i % 2 === 0 ? 'triangle' : 'square';
        gain.gain.setValueAtTime(0, melodyTime);
        gain.gain.linearRampToValueAtTime(volume * 0.18, melodyTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, melodyTime + note.duration);
        osc.start(melodyTime);
        osc.stop(melodyTime + note.duration);
        melodyTime += note.duration;
      });

      // Bajo animado
      let bassTime = currentTime;
      bass.forEach((note, i) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, bassTime);
        gain.gain.setValueAtTime(0, bassTime);
        gain.gain.linearRampToValueAtTime(volume * 0.13, bassTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, bassTime + note.duration);
        osc.start(bassTime);
        osc.stop(bassTime + note.duration);
        bassTime += note.duration;
      });

      // Percusión sintética
      percussion.forEach((hit) => {
        const t = currentTime + hit.time;
        if (hit.type === 'kick') {
          // Bombo
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(context.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
          gain.gain.setValueAtTime(volume * 0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.start(t);
          osc.stop(t + 0.12);
        } else if (hit.type === 'hihat') {
          // Hi-hat
          const bufferSize = 128;
          const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = context.createBufferSource();
          noise.buffer = buffer;
          const gain = context.createGain();
          gain.gain.setValueAtTime(volume * 0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
          noise.connect(gain);
          gain.connect(context.destination);
          noise.start(t);
          noise.stop(t + 0.04);
        }
      });

      // Loop
      setTimeout(() => {
        currentTime = context.currentTime;
        playLoop();
      }, loopDuration * 1000);
    };

    playLoop();
  }

  // Sonido de recarga de energía
  playEnergyRefill(volume: number = 0.5) {
    const context = this.ensureAudioContext();
    
    // Crear secuencia de "power-up"
    const frequencies = [200, 300, 400, 500, 600];
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido de energía
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(150, context.currentTime);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

      oscillator.start(context.currentTime + index * 0.08);
      oscillator.stop(context.currentTime + index * 0.08 + 0.2);
    });
  }

  // Sonido de repartir carta
  playCardDeal(volume: number = 0.4) {
    const context = this.ensureAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    // Configurar filtro para sonido de carta
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.2);

    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.2);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  }

  // Sonido de voltear carta
  playCardFlip(volume: number = 0.5) {
    const context = this.ensureAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    // Configurar filtro para sonido de volteo
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
    filter.Q.setValueAtTime(5, context.currentTime);

    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }

  // Sonido de ficha de casino
  playChipSound(volume: number = 0.6) {
    const context = this.ensureAudioContext();
    
    // Crear múltiples osciladores para sonido de ficha
    for (let i = 0; i < 2; i++) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      // Configurar filtro para sonido de ficha
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000 + i * 500, context.currentTime);
      filter.frequency.exponentialRampToValueAtTime(500 + i * 100, context.currentTime + 0.3);

      oscillator.frequency.setValueAtTime(300 + i * 100, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200 + i * 50, context.currentTime + 0.3);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * (0.9 - i * 0.3), context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime + i * 0.05);
      oscillator.stop(context.currentTime + 0.3 + i * 0.05);
    }
  }
}

// Instancia global del generador de sonidos
export const soundGenerator = new SoundGenerator(); 