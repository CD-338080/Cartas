// components/Game.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { binanceLogo, dailyCipher, dailyCombo, dailyReward, dollarCoin, lightning } from '@/images';
import IceCube from '@/icons/IceCube';
import IceCubes from '@/icons/IceCubes';
import Rocket from '@/icons/Rocket';
import Energy from '@/icons/Energy';
import Link from 'next/link';
import { useGameStore } from '@/utils/game-mechanics';
import Snowflake from '@/icons/Snowflake';
import TopInfoSection from '@/components/TopInfoSection';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import SendMessage from '@/components/popups/SendMessage';
import { useSound, SOUND_EFFECTS } from '@/utils/useSound';
import AudioController from '@/components/AudioController';

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Game({ currentView, setCurrentView }: GameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | null>(null);
  const [result, setResult] = useState<'red' | 'black' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<'red' | 'black' | null>(null);
  const [lastWin, setLastWin] = useState(false);
  const [ballPosition, setBallPosition] = useState(0);
  const [lastBallEndPosition, setLastBallEndPosition] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);

  const {
    points,
    pointsBalance,
    pointsPerClick,
    energy,
    maxEnergy,
    gameLevelIndex,
    clickTriggered,
    updateLastClickTimestamp,
  } = useGameStore();

  const { playSound } = useSound();

  const spinRoulette = async () => {
    if (isSpinning || !selectedColor) return;
    
    setIsSpinning(true);
    triggerHapticFeedback(window);
    
    // Play roulette spin sound
    playSound(SOUND_EFFECTS.ROULETTE_SPIN, { volume: 0.6 });
    
    // Generate final result
    const finalResult = Math.random() > 0.5 ? 'red' : 'black';
    
    // Calculate final positions
    const finalWheelRotation = Math.random() * 360 + 720; // 2-3 full rotations
    const randomOffset = Math.random() * 360;
    const ballSpins = 360 * 5;
    const finalBallPosition = lastBallEndPosition + ballSpins + randomOffset; // Empieza donde terminó la última vez
    
    // Animate wheel and ball
    const startTime = Date.now();
    const duration = 5000; // 5 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Wheel rotation with deceleration
      const currentWheelRotation = finalWheelRotation * easeOut;
      setWheelRotation(currentWheelRotation);
      
      // Ball movement with bouncing effect
      const ballProgress = Math.min(progress * 1.2, 1);
      const ballEaseOut = 1 - Math.pow(1 - ballProgress, 2);
      const currentBallPosition = lastBallEndPosition + (finalBallPosition - lastBallEndPosition) * ballEaseOut;
      setBallPosition(currentBallPosition);
      
      // Play ball bounce sound at certain intervals
      if (progress > 0.3 && progress < 0.8 && Math.floor(progress * 20) % 3 === 0) {
        playSound(SOUND_EFFECTS.ROULETTE_BALL_BOUNCE, { volume: 0.2 });
      }
      
      // Show result during last 500ms
      if (progress > 0.875) {
        setResult(finalResult);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setIsSpinning(false);
        setLastResult(finalResult);
        const isWin = selectedColor === finalResult;
        setLastWin(isWin);
        setShowResult(true);
        
        // Play win/lose sound
        if (isWin) {
          playSound(SOUND_EFFECTS.ROULETTE_WIN, { volume: 0.8 });
          clickTriggered();
          updateLastClickTimestamp();
        } else {
          playSound(SOUND_EFFECTS.ROULETTE_LOSE, { volume: 0.5 });
        }
        
        setTimeout(() => {
          setShowResult(false);
          setSelectedColor(null);
          setResult(null);
          setLastBallEndPosition(finalBallPosition % 360); // Guardar la posición final normalizada
          setWheelRotation(0);
        }, 3000);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Roulette wheel segments (red and black alternating)
  const wheelSegments = [
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'
  ];

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
      <div className="w-full text-white h-screen font-bold flex flex-col max-w-xl">
        <TopInfoSection isGamePage={true} setCurrentView={setCurrentView} />
        
        {/* Audio Controller */}
        <div className="absolute top-4 right-4 z-10">
          <AudioController />
        </div>

        <div className="flex-grow mt-4 bg-gradient-to-r from-[#264653] to-[#2a9d8f] rounded-t-[48px] relative top-glow z-0 shadow-lg">
          <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">

              {/* Points Display */}
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl flex items-center space-x-3 shadow-inner">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#2a9d8f] text-2xl font-black">₮</span>
                  </div>
                  <p className="text-4xl text-white font-extrabold" suppressHydrationWarning>
                    {Math.floor(pointsBalance).toLocaleString()} USDT
                  </p>
                </div>
              </div>

              {/* Level Display */}
              <div className="flex justify-center gap-2 mt-3 bg-white/10 py-2 rounded-full px-4">
                <p className="text-white">{LEVELS[gameLevelIndex].name}</p>
                <p className="text-white/60">&#8226;</p>
                <p>{gameLevelIndex + 1} <span className="text-white/60">/ {LEVELS.length}</span></p>
              </div>

              {/* Professional Casino Roulette */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
                  Casino Roulette
                </h2>
                
                {/* Professional Roulette Wheel */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Outer rim */}
                    <div className="w-64 h-64 rounded-full border-8 border-[#8B4513] bg-gradient-to-br from-[#D2691E] to-[#8B4513] shadow-2xl relative overflow-hidden">
                      
                      {/* Wheel segments */}
                      <div 
                        className="absolute inset-4 rounded-full overflow-hidden"
                        style={{
                          transform: `rotate(${wheelRotation}deg)`,
                          transition: isSpinning ? 'none' : 'transform 0.5s ease-out'
                        }}
                      >
                        {wheelSegments.map((color, index) => {
                          const angle = (360 / wheelSegments.length) * index;
                          const segmentAngle = 360 / wheelSegments.length;
                          const startAngle = angle;
                          const endAngle = angle + segmentAngle;
                          
                          // Calculate polygon points for perfect segments
                          const centerX = 50;
                          const centerY = 50;
                          const innerRadius = 20; // Inner circle
                          const outerRadius = 45; // Outer circle
                          
                          const points = [
                            // Inner point
                            `${centerX + innerRadius * Math.cos((startAngle + segmentAngle/2) * Math.PI / 180)}% ${centerY - innerRadius * Math.sin((startAngle + segmentAngle/2) * Math.PI / 180)}%`,
                            // Outer points
                            `${centerX + outerRadius * Math.cos(startAngle * Math.PI / 180)}% ${centerY - outerRadius * Math.sin(startAngle * Math.PI / 180)}%`,
                            `${centerX + outerRadius * Math.cos(endAngle * Math.PI / 180)}% ${centerY - outerRadius * Math.sin(endAngle * Math.PI / 180)}%`,
                          ].join(', ');
                          
                          return (
                            <div
                              key={index}
                              className="absolute w-full h-full"
                              style={{
                                clipPath: `polygon(${points})`
                              }}
                            >
                              <div 
                                className={`w-full h-full ${
                                  color === 'red' 
                                    ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-800' 
                                    : 'bg-gradient-to-br from-gray-800 via-gray-900 to-black'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Center hub */}
                      <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-4 border-[#8B4513] flex items-center justify-center shadow-inner">
                        <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[#8B4513]"></div>
                        </div>
                      </div>
                      
                      {/* Ball */}
                      <div 
                        className="absolute w-4 h-4 rounded-full bg-white shadow-lg z-10"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${ballPosition}deg) translateY(-110px)`,
                          transition: isSpinning ? 'none' : 'all 0.5s ease-out'
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-200 shadow-inner"></div>
                      </div>
                    </div>
                    
                    {/* Roulette pointer */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-[#FFD700] drop-shadow-lg"></div>
                    
                    {/* Casino table numbers */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#228B22] rounded-lg px-4 py-2 border-2 border-[#FFD700] shadow-lg">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 bg-red-600 rounded text-xs flex items-center justify-center font-bold">0</div>
                        <div className="w-6 h-6 bg-black rounded text-xs flex items-center justify-center font-bold text-white">00</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      if (!isSpinning) {
                        setSelectedColor('red');
                        triggerHapticFeedback(window);
                        playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
                      }
                    }}
                    className={`flex-1 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${
                      selectedColor === 'red'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-105 shadow-red-500/50'
                        : 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white'
                    } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSpinning}
                  >
                    🔴 RED
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!isSpinning) {
                        setSelectedColor('black');
                        triggerHapticFeedback(window);
                        playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
                      }
                    }}
                    className={`flex-1 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${
                      selectedColor === 'black'
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white scale-105 shadow-gray-500/50'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSpinning}
                  >
                    ⚫ BLACK
                  </button>
                </div>

                {/* Spin Button */}
                <button
                  onClick={() => {
                    spinRoulette();
                    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.5 });
                  }}
                  disabled={isSpinning || !selectedColor}
                  className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                    isSpinning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : !selectedColor
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] hover:from-[#f3ba2f] hover:to-[#f0b90b] text-[#0a1f17] shadow-yellow-500/30'
                  }`}
                >
                  {isSpinning ? '🎰 Spinning...' : !selectedColor ? 'Select a color first' : '🎰 Spin Roulette'}
                </button>

                {/* Last Result Display */}
                {lastResult && (
                  <div className="mt-4 text-center">
                    <p className="text-lg">
                      Last result: 
                      <span className={`font-bold ml-2 ${lastResult === 'red' ? 'text-red-400' : 'text-gray-300'}`}>
                        {lastResult === 'red' ? '🔴 RED' : '⚫ BLACK'}
                      </span>
                    </p>
                    {lastWin ? (
                      <p className="text-[#f0b90b] font-bold mt-2 animate-pulse">
                        +1 USDT Won! 🎉
                      </p>
                    ) : (
                      <p className="text-red-400 font-bold mt-2">
                        Try again! 💪
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Game Instructions */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
                  How to Play
                </h2>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">1</span>
                    </div>
                    <p>Choose your lucky color: <span className="text-red-400">Red</span> or <span className="text-gray-300">Black</span></p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">2</span>
                    </div>
                    <p>Watch the ball bounce and land on your color!</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">3</span>
                    </div>
                    <p>Guess correctly to win <span className="text-[#f0b90b] font-bold">+1 USDT</span>!</p>
                  </div>
                </div>
              </div>

              {/* Live Payouts button - Replacing Energy Display */}
              <div className="px-4 mt-6">
                <button
                  onClick={() => {
                    triggerHapticFeedback(window);
                    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
                    setCurrentView('airdrop');
                    localStorage.setItem('scrollToTransactions', 'true');
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#f3ba2f] rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Live Payouts</p>
                        <p className="text-white/60 text-sm">Check your recent transactions</p>
                      </div>
                    </div>
                    <div className="text-[#f3ba2f]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Result Animation */}
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-bounce text-6xl">
            {lastWin ? '🎉' : '💪'}
          </div>
          <div className="absolute text-4xl font-bold text-[#f0b90b] animate-float">
            {lastWin ? '+1 USDT' : 'Try Again!'}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 2s ease-out forwards;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .filter.drop-shadow-glow-yellow {
          filter: drop-shadow(0 0 8px rgba(243, 186, 47, 0.3));
        }
        .top-glow {
          box-shadow: 0 -10px 30px -5px rgba(243, 186, 47, 0.3);
        }
      `}</style>
    </div>
  );
}