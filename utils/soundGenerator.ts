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

  // Música de fondo simple (loop)
  playBackgroundMusic(volume: number = 0.2) {
    const context = this.ensureAudioContext();
    
    // Crear una melodía de casino más elaborada
    const melody = [
      { freq: 261, duration: 0.8 }, // C
      { freq: 329, duration: 0.4 }, // E
      { freq: 392, duration: 0.8 }, // G
      { freq: 523, duration: 0.4 }, // C (octava superior)
      { freq: 392, duration: 0.8 }, // G
      { freq: 329, duration: 0.4 }, // E
      { freq: 261, duration: 0.8 }, // C
      { freq: 196, duration: 0.4 }, // G (octava inferior)
    ];

    let currentTime = context.currentTime;
    
    const playMelody = () => {
      melody.forEach((note, index) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);

        // Configurar filtro para sonido más suave
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, context.currentTime);

        oscillator.frequency.setValueAtTime(note.freq, context.currentTime);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.2, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + note.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);

        currentTime += note.duration;
      });

      // Programar la siguiente repetición
      setTimeout(() => {
        currentTime = context.currentTime;
        playMelody();
      }, (melody.reduce((sum, note) => sum + note.duration, 0)) * 1000);
    };

    playMelody();
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
}

// Instancia global del generador de sonidos
export const soundGenerator = new SoundGenerator(); 