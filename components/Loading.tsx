// components/Loading.tsx

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

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { botUrlQr } from '@/images';
import IceCube from '@/icons/IceCube';
import { calculateEnergyLimit, calculateLevelIndex, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechanics';
import WebApp from '@twa-dev/sdk';
import UAParser from 'ua-parser-js';
import { ALLOW_ALL_DEVICES } from '@/utils/consts';

interface LoadingProps {
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

// Card component for loading animations
const LoadingCard = ({ suit, value, isHidden = false, delay = 0, position = 'center' }: {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  isHidden?: boolean;
  delay?: number;
  position?: 'left' | 'center' | 'right';
}) => {
  if (isHidden) {
    return (
      <div
        className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white shadow-lg flex items-center justify-center relative overflow-hidden transform hover:scale-105 transition-all duration-500 ease-out"
        style={{
          animationDelay: `${delay}ms`,
          transform: position === 'left' ? 'rotate(-15deg)' : position === 'right' ? 'rotate(15deg)' : 'rotate(0deg)',
          zIndex: position === 'center' ? 20 : 10
        }}
      >
        <div className="text-white text-xs font-bold tracking-wider">USDT</div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col justify-between p-1 transform hover:scale-105 transition-all duration-500 ease-out"
      style={{
        animationDelay: `${delay}ms`,
        transform: position === 'left' ? 'rotate(-15deg)' : position === 'right' ? 'rotate(15deg)' : 'rotate(0deg)',
        zIndex: position === 'center' ? 20 : 10
      }}
    >
      {/* Top left corner */}
      <div className="flex flex-col items-start">
        <div className={`text-xs font-bold ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
          {value}
        </div>
        <div className={`text-xs ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
          {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
        </div>
      </div>
      
      {/* Center symbol */}
      <div className="flex items-center justify-center flex-1">
        <div className={`text-2xl ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'} drop-shadow-sm`}>
          {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
        </div>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className="flex flex-col items-end transform rotate-180">
        <div className={`text-xs font-bold ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
          {value}
        </div>
        <div className={`text-xs ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
          {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
        </div>
      </div>
    </div>
  );
};

export default function Loading({ setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const [isAppropriateDevice, setIsAppropriateDevice] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [dealingPhase, setDealingPhase] = useState(0);
  const welcomeMessageSentRef = useRef(false);

  const sendWelcomeMessage = async (telegramId: string, telegramName: string) => {
    try {
      // Only send message if we're not in development mode
      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH !== 'true') {
        const response = await fetch('/api/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            telegramName
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send welcome message');
        }
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
      // We don't show an error to the user as this doesn't affect the main functionality
    }
  };

  const fetchOrCreateUser = useCallback(async () => {
    try {
      let initData, telegramId, username, telegramName, startParam;

      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.bottomBarColor = "#0A2E20";
        WebApp.headerColor = "#051510";
        WebApp.enableVerticalSwipes();
        WebApp.expand();
        initData = WebApp.initData;
        telegramId = WebApp.initDataUnsafe.user?.id.toString();
        username = WebApp.initDataUnsafe.user?.username || 'Unknown User';
        telegramName = WebApp.initDataUnsafe.user?.first_name || 'Unknown User';

        startParam = WebApp.initDataUnsafe.start_param;
      }

      const referrerTelegramId = startParam ? startParam.replace('kentId', '') : null;

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        initData = "temp";
        telegramId = "123456789"; // Temporary ID for testing
        telegramName = "Test User"; // Temporary name for testing
      }
      
      // Start card dealing animation
      setShowCards(true);
      
      // Simulate loading progress with card dealing phases
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(loadingInterval);
            return prev;
          }
          return prev + Math.random() * 8 + 2;
        });
        
        // Update dealing phase based on progress
        setDealingPhase(prev => {
          if (loadingProgress < 25) return 1;
          if (loadingProgress < 50) return 2;
          if (loadingProgress < 75) return 3;
          return 4;
        });
      }, 200);
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramInitData: initData,
          referrerTelegramId,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch or create user');
      }
      const userData = await response.json();

      console.log("user data: ", userData);

      // Check if initData and telegramName are defined
      if (!initData) {
        throw new Error('initData is undefined');
      }
      if (!telegramName) {
        throw new Error('telegramName is undefined');
      }

      // Create the game store with fetched data
      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        lastClickTimestamp: userData.lastPointsUpdateTimestamp,
        gameLevelIndex: calculateLevelIndex(userData.points),
        points: userData.points,
        pointsBalance: userData.pointsBalance,
        unsynchronizedPoints: 0,
        multitapLevelIndex: userData.multitapLevelIndex,
        pointsPerClick: calculatePointsPerClick(userData.multitapLevelIndex),
        energy: userData.energy,
        maxEnergy: calculateEnergyLimit(userData.energyLimitLevelIndex),
        energyRefillsLeft: userData.energyRefillsLeft,
        energyLimitLevelIndex: userData.energyLimitLevelIndex,
        lastEnergyRefillTimestamp: userData.lastEnergyRefillsTimestamp,
        mineLevelIndex: userData.mineLevelIndex,
        profitPerHour: calculateProfitPerHour(userData.mineLevelIndex),
        tonWalletAddress: userData?.tonWalletAddress,
      };

      console.log("Initial state: ", initialState);

      initializeState(initialState);

      // Send welcome message if we have the Telegram ID and haven't sent it yet
      if (telegramId && !welcomeMessageSentRef.current) {
        welcomeMessageSentRef.current = true;
        await sendWelcomeMessage(telegramId, telegramName);
      }
      
      // Complete the loading progress
      setLoadingProgress(100);
      setDealingPhase(5);
      
      // Set data as loaded
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error (e.g., show error message to user)
    }
  }, [initializeState]);

  useEffect(() => {
    const parser = new UAParser();
    const device = parser.getDevice();
    const isAppropriate = ALLOW_ALL_DEVICES || device.type === 'mobile' || device.type === 'tablet';
    setIsAppropriateDevice(isAppropriate);

    if (isAppropriate) {
      fetchOrCreateUser();
    }
  }, [fetchOrCreateUser]);

  useEffect(() => {
    if (isDataLoaded) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - openTimestampRef.current;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      const timer = setTimeout(() => {
        setCurrentView('game');
        setIsInitialized(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, setIsInitialized, setCurrentView]);

  if (!isAppropriateDevice) {
    return (
      <div className="bg-[#1d2025] flex justify-center items-center h-screen">
        <div className="w-full max-w-xl text-white flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Play on your mobile</h1>
          <Image
            className="bg-white p-2 rounded-xl"
            src={botUrlQr}
            alt="QR Code"
            width={200}
            height={200}
          />
          <p className="mt-4">@{process.env.NEXT_PUBLIC_BOT_USERNAME}</p>
          <p className="mt-2">Developed by Nikandr Surkov</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#0f5132] to-[#90ef89] flex justify-center items-center h-screen overflow-hidden">
      <div className="w-full max-w-xl text-white flex flex-col items-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                backgroundColor: i % 3 === 0 ? '#90ef89' : i % 3 === 1 ? '#0f5132' : '#f0b90b',
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            />
          ))}
        </div>

        {/* Main Character */}
        <div className="w-48 h-48 rounded-full p-4 mb-6 relative z-10">
          <div 
            className="w-full h-full rounded-full overflow-hidden relative border-4 border-white/20"
            style={{
              boxShadow: `0 0 30px #f0b90b80`,
              animation: "pulse 2s infinite"
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#90ef89] to-[#0f5132] opacity-80"
              style={{
                animation: "rotate 4s linear infinite"
              }}
            />
            {/* Tether USDT Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#f0b90b]">
                <div className="text-center">
                  <div className="text-[#90ef89] text-6xl font-black mb-2">₮</div>
                  <div className="text-[#0f5132] text-sm font-bold">USDT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-4xl font-bold mb-6 text-center relative z-10">
          <span className="text-white">USDT</span> <span className="text-[#f0b90b]">BLACKJACK</span> <span className="text-white">21</span>
        </h1>

        {/* Card Dealing Animation */}
        <div className="relative mb-8 z-20">
          {/* Dealer Cards */}
          <div className="flex justify-center gap-2 mb-4">
            {dealingPhase >= 1 && (
              <div className="animate-card-deal-1">
                <LoadingCard suit="hearts" value="A" delay={0} position="left" />
              </div>
            )}
            {dealingPhase >= 2 && (
              <div className="animate-card-deal-2">
                <LoadingCard suit="hearts" value="A" isHidden={true} delay={300} position="center" />
              </div>
            )}
          </div>

          {/* Player Cards */}
          <div className="flex justify-center gap-2">
            {dealingPhase >= 3 && (
              <div className="animate-card-deal-3">
                <LoadingCard suit="diamonds" value="K" delay={600} position="left" />
              </div>
            )}
            {dealingPhase >= 4 && (
              <div className="animate-card-deal-4">
                <LoadingCard suit="clubs" value="Q" delay={900} position="right" />
              </div>
            )}
          </div>

          {/* Flying Card Animation */}
          {dealingPhase >= 5 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-flying-card-final">
                <LoadingCard suit="spades" value="J" delay={0} position="center" />
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-80 h-3 bg-white/20 backdrop-blur-sm rounded-full mb-6 overflow-hidden relative z-10 border border-white/30">
          <div 
            className="h-full bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-full shadow-lg"
            style={{ 
              width: `${loadingProgress}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>

        {/* Loading Text */}
        <div className="text-center relative z-10">
          <p className="text-lg font-semibold mb-2">
            {loadingProgress < 25 && "🃏 Shuffling deck..."}
            {loadingProgress >= 25 && loadingProgress < 50 && "🎯 Dealing cards..."}
            {loadingProgress >= 50 && loadingProgress < 75 && "⚡ Calculating odds..."}
            {loadingProgress >= 75 && loadingProgress < 100 && "🎰 Preparing game..."}
            {loadingProgress >= 100 && "🎉 Ready to play!"}
          </p>
          <p className="text-sm text-white/70">
            Loading... {Math.round(loadingProgress)}%
          </p>
        </div>

        {/* USDT Logo */}
        <div className="flex items-center space-x-4 mt-6 relative z-10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-bounce">
            <span className="text-[#90ef89] text-xl font-black">₮</span>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">USDT Rewards</p>
            <p className="text-white/70 text-sm">Win real prizes</p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 15px #f0b90b40;
          }
          50% {
            box-shadow: 0 0 30px #f0b90b80;
          }
          100% {
            box-shadow: 0 0 15px #f0b90b40;
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0.1;
          }
        }
        
        @keyframes card-deal-1 {
          0% {
            transform: translateY(-200px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(-90deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1) rotate(-15deg);
            opacity: 1;
          }
        }
        
        @keyframes card-deal-2 {
          0% {
            transform: translateY(-200px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(-90deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes card-deal-3 {
          0% {
            transform: translateY(-200px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(-90deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1) rotate(-15deg);
            opacity: 1;
          }
        }
        
        @keyframes card-deal-4 {
          0% {
            transform: translateY(-200px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(-90deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1) rotate(15deg);
            opacity: 1;
          }
        }
        
        @keyframes flying-card-final {
          0% {
            transform: translateY(-300px) scale(0.2) rotate(-360deg);
            opacity: 0;
          }
          25% {
            transform: translateY(-150px) scale(0.6) rotate(-180deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-50px) scale(1.3) rotate(0deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-10px) scale(1.1) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
        }
        
        .animate-card-deal-1 {
          animation: card-deal-1 1s ease-out forwards;
        }
        
        .animate-card-deal-2 {
          animation: card-deal-2 1s ease-out forwards;
        }
        
        .animate-card-deal-3 {
          animation: card-deal-3 1s ease-out forwards;
        }
        
        .animate-card-deal-4 {
          animation: card-deal-4 1s ease-out forwards;
        }
        
        .animate-flying-card-final {
          animation: flying-card-final 1.5s ease-out forwards;
        }
        
        .filter.drop-shadow-glow-yellow {
          filter: drop-shadow(0 0 8px rgba(243, 186, 47, 0.3));
        }
      `}</style>
    </div>
  );
}