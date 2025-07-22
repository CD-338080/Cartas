# Sistema de Audio del Juego

Este documento explica cómo funciona el sistema de audio implementado en el juego y cómo usarlo.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Hook personalizado `useSound`** - Manejo centralizado de audio
2. **Generador de sonidos con Web Audio API** - Sonidos generados programáticamente como fallback
3. **Controlador de audio en tiempo real** - Botones de mute/unmute y control de volumen
4. **Configuración avanzada de audio** - Controles individuales para diferentes tipos de sonido
5. **Persistencia de configuraciones** - Las preferencias se guardan en localStorage
6. **Sistema de fallback** - Si no hay archivos de audio, usa sonidos generados
7. **Compatibilidad con autoplay** - Respeta las políticas de los navegadores

## Componentes del Sistema

### 1. Hook `useSound` (`utils/useSound.ts`)

```typescript
const { playSound, stopSound, stopAllSounds, setVolume, setGlobalVolume } = useSound();

// Reproducir un sonido
playSound('button-click', { volume: 0.5, loop: false });

// Detener un sonido específico
stopSound('background-music');

// Detener todos los sonidos
stopAllSounds();

// Cambiar volumen global
setGlobalVolume(0.7);
```

### 2. Generador de Sonidos (`utils/soundGenerator.ts`)

Crea sonidos usando Web Audio API cuando no hay archivos de audio disponibles:

- `playButtonClick()` - Sonido de clic de botón
- `playRouletteSpin()` - Sonido de ruleta girando
- `playWin()` - Sonido de victoria
- `playLose()` - Sonido de derrota
- `playBallBounce()` - Sonido de pelota rebotando
- `playCoinCollect()` - Sonido de moneda
- `playLevelUp()` - Sonido de subir nivel
- `playBackgroundMusic()` - Música de fondo

### 3. Controlador de Audio (`components/AudioController.tsx`)

Componente compacto con controles básicos:
- Botón de mute/unmute
- Control de volumen
- Botón de música de fondo

### 4. Configuración de Audio (`components/AudioSettings.tsx`)

Componente completo con controles avanzados:
- Volumen principal
- Volumen de efectos de sonido
- Volumen de música
- Toggles individuales
- Botones de prueba de sonidos

## Tipos de Sonidos Disponibles

### Efectos de Sonido (SFX)
```typescript
SOUND_EFFECTS.BUTTON_CLICK      // Clic de botón
SOUND_EFFECTS.ROULETTE_SPIN     // Ruleta girando
SOUND_EFFECTS.ROULETTE_WIN      // Victoria en ruleta
SOUND_EFFECTS.ROULETTE_LOSE     // Derrota en ruleta
SOUND_EFFECTS.ROULETTE_BALL_BOUNCE // Pelota rebotando
SOUND_EFFECTS.COIN_COLLECT      // Recolectar moneda
SOUND_EFFECTS.LEVEL_UP          // Subir de nivel
SOUND_EFFECTS.ENERGY_REFILL     // Recargar energía
```

### Sonidos de UI
```typescript
SOUND_EFFECTS.BUTTON_HOVER      // Hover en botón
SOUND_EFFECTS.POPUP_OPEN        // Abrir popup
SOUND_EFFECTS.POPUP_CLOSE       // Cerrar popup
```

### Música de Fondo
```typescript
SOUND_EFFECTS.BACKGROUND_MUSIC  // Música principal
SOUND_EFFECTS.CASINO_AMBIENCE   // Ambiente de casino
```

## Cómo Usar el Sistema

### 1. En un Componente React

```typescript
import { useSound, SOUND_EFFECTS } from '@/utils/useSound';

function MyComponent() {
  const { playSound } = useSound();

  const handleClick = () => {
    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.5 });
    // Tu lógica aquí
  };

  return (
    <button onClick={handleClick}>
      Hacer Clic
    </button>
  );
}
```

### 2. Agregar Controlador de Audio

```typescript
import AudioController from '@/components/AudioController';

function GamePage() {
  return (
    <div>
      <AudioController className="absolute top-4 right-4" />
      {/* Resto del contenido */}
    </div>
  );
}
```

### 3. Agregar Configuración Completa

```typescript
import AudioSettings from '@/components/AudioSettings';

function SettingsPage() {
  return (
    <div>
      <AudioSettings />
      {/* Otras configuraciones */}
    </div>
  );
}
```

## Configuración de Archivos de Audio

### Estructura de Carpetas
```
public/
  sounds/
    button-click.mp3
    roulette-spin.mp3
    roulette-win.mp3
    roulette-lose.mp3
    roulette-ball-bounce.mp3
    coin-collect.mp3
    level-up.mp3
    background-music.mp3
    casino-ambience.mp3
    README.md
```

### Especificaciones Recomendadas

- **Formato**: MP3
- **Calidad**: 128kbps o 192kbps
- **Frecuencia**: 44.1kHz
- **Duración**: 0.5-2 segundos para SFX, 30-60 segundos para música (loop)
- **Tamaño**: Menos de 100KB por archivo

## Configuración de Volumen

### Niveles Recomendados

```typescript
// Efectos de sonido
playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
playSound(SOUND_EFFECTS.ROULETTE_SPIN, { volume: 0.6 });
playSound(SOUND_EFFECTS.ROULETTE_WIN, { volume: 0.8 });
playSound(SOUND_EFFECTS.ROULETTE_LOSE, { volume: 0.5 });

// Música de fondo
playSound(SOUND_EFFECTS.BACKGROUND_MUSIC, { 
  volume: 0.3, 
  loop: true 
});
```

## Persistencia de Configuraciones

El sistema guarda automáticamente las configuraciones en localStorage:

```javascript
// Configuraciones guardadas
localStorage.getItem('audioMuted')        // boolean
localStorage.getItem('audioVolume')       // number (0-1)
localStorage.getItem('audioSettings')     // object completo
```

## Políticas de Autoplay

El sistema respeta las políticas de autoplay de los navegadores:

1. **Primera interacción**: Los sonidos se cargan pero no se reproducen automáticamente
2. **Después de interacción**: Los sonidos funcionan normalmente
3. **Fallback**: Si el autoplay está bloqueado, usa sonidos generados

## Solución de Problemas

### Sonidos no se reproducen
1. Verificar que el usuario haya interactuado con la página
2. Revisar la consola para errores de carga de archivos
3. Verificar que los archivos de audio existan en `/public/sounds/`

### Volumen muy bajo/alto
1. Ajustar el volumen en la configuración de audio
2. Verificar el volumen del sistema operativo
3. Revisar la configuración del navegador

### Sonidos generados en lugar de archivos
1. Verificar que los archivos MP3 estén en la carpeta correcta
2. Revisar que los nombres de archivo coincidan exactamente
3. Verificar que los archivos no estén corruptos

## Personalización

### Agregar Nuevos Tipos de Sonido

1. Agregar la constante en `SOUND_EFFECTS`:
```typescript
export const SOUND_EFFECTS = {
  // ... sonidos existentes
  NEW_SOUND: 'new-sound',
} as const;
```

2. Agregar el fallback en `playGeneratedSound`:
```typescript
case SOUND_EFFECTS.NEW_SOUND:
  soundGenerator.playNewSound(volume);
  break;
```

3. Crear el método en `SoundGenerator`:
```typescript
playNewSound(volume: number = 0.5) {
  // Implementación del sonido
}
```

### Modificar Sonidos Generados

Edita los métodos en `utils/soundGenerator.ts` para cambiar:
- Frecuencias
- Duración
- Tipo de onda
- Efectos de filtro

## Recursos Útiles

### Sitios para Descargar Sonidos Gratuitos
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [SoundBible](http://soundbible.com/)

### Herramientas de Conversión
- [Online Audio Converter](https://online-audio-converter.com/)
- [Convertio](https://convertio.co/)

### Documentación Web Audio API
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Tutorial](https://web.dev/web-audio-api/) 