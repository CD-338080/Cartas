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
import { botUrlQr, mainCharacter } from '@/images';
import IceCube from '@/icons/IceCube';
import { calculateEnergyLimit, calculateLevelIndex, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechanics';
import WebApp from '@twa-dev/sdk';
import UAParser from 'ua-parser-js';
import { ALLOW_ALL_DEVICES } from '@/utils/consts';

interface LoadingProps {
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

export default function Loading({ setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const [isAppropriateDevice, setIsAppropriateDevice] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rouletteSpins, setRouletteSpins] = useState(0);
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [slotSymbols, setSlotSymbols] = useState(['$', '₮', '7']);
  const [showJackpot, setShowJackpot] = useState(false);

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
      
      // Enhanced loading progress with casino effects
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 70) {
            clearInterval(loadingInterval);
            return prev;
          }
          const increment = Math.random() * 8 + 2;
          return Math.min(prev + increment, 70);
        });
      }, 200);

      // Roulette spinning animation
      const rouletteInterval = setInterval(() => {
        setRouletteSpins(prev => prev + 1);
      }, 100);

      // Dice rolling animation
      const diceInterval = setInterval(() => {
        setDiceValues([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]);
      }, 300);

      // Slot machine animation
      const slotInterval = setInterval(() => {
        const symbols = ['$', '₮', '7', '★', '♦', '♠', '♥', '♣'];
        setSlotSymbols([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ]);
      }, 150);
      
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
        lastBonusClaimTimestamp: userData.lastBonusClaimTimestamp || 0,
        nextBonusAvailableTimestamp: userData.nextBonusAvailableTimestamp || 0,
      };

      console.log("Initial state: ", initialState);

      initializeState(initialState);

      // Send welcome message if we have the Telegram ID
      if (telegramId) {
        await sendWelcomeMessage(telegramId, telegramName);
      }
      
      // Clear intervals
      clearInterval(rouletteInterval);
      clearInterval(diceInterval);
      clearInterval(slotInterval);
      
      // Final loading animation
      setLoadingProgress(100);
      setShowJackpot(true);
      
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

  // USDT TRC-20 color palette
  const usdtGreen = "#26A17B";
  const usdtDarkGreen = "#1E8A6B";
  const usdtLightGreen = "#2ECC71";
  const usdtAccentGreen = "#00D4AA";
  const usdtGold = "#F7931A";
  const usdtDark = "#1a1a1a";

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] via-[#1E8A6B] to-[#26A17B] flex justify-center items-center h-screen overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              backgroundColor: [usdtGreen, usdtLightGreen, usdtAccentGreen, usdtGold, usdtDarkGreen][i % 5],
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `casinoFloat ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="w-full max-w-4xl text-white flex flex-col items-center relative z-10">
        
        {/* Casino Roulette Wheel */}
        <div className="relative mb-8">
          <div className="w-80 h-80 relative">
            {/* Outer ring */}
            <div 
              className="absolute inset-0 rounded-full border-8 border-[#26A17B]"
              style={{
                boxShadow: `0 0 40px ${usdtGreen}80, inset 0 0 40px ${usdtGreen}40`,
                animation: "rouletteSpin 3s linear infinite"
              }}
            />
            
            {/* Inner ring with numbers */}
            <div 
              className="absolute inset-8 rounded-full border-4 border-[#2ECC71]"
              style={{
                boxShadow: `0 0 30px ${usdtLightGreen}60`,
                animation: "rouletteSpin 2.5s linear infinite reverse"
              }}
            />
            
            {/* Center circle */}
            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#26A17B] to-[#2ECC71] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#1E8A6B] flex items-center justify-center border-4 border-[#26A17B]">
                <Image
                  src={mainCharacter}
                  alt="Main Character"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Roulette numbers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: i % 2 === 0 ? usdtLightGreen : usdtDark,
                  color: i % 2 === 0 ? 'white' : usdtGreen,
                  left: `${50 + 35 * Math.cos((i * 30 - 90) * Math.PI / 180)}%`,
                  top: `${50 + 35 * Math.sin((i * 30 - 90) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: "rouletteSpin 2s linear infinite",
                  animationDelay: `${i * 0.1}s`
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Title with slot machine effect */}
        <div className="text-4xl font-bold mb-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#26A17B] animate-slot-machine">USDT</span>
            <span className="text-[#2ECC71] animate-slot-machine-delay-1">ROLL</span>
            <span className="text-[#00D4AA] animate-slot-machine-delay-2">ROULETTE</span>
          </div>
        </div>

        {/* Slot Machine Display */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-b from-[#26A17B] to-[#1E8A6B] rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-[#26A17B] shadow-lg">
            {slotSymbols[0]}
          </div>
          <div className="w-16 h-16 bg-gradient-to-b from-[#2ECC71] to-[#27AE60] rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-[#2ECC71] shadow-lg">
            {slotSymbols[1]}
          </div>
          <div className="w-16 h-16 bg-gradient-to-b from-[#00D4AA] to-[#00B894] rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-[#00D4AA] shadow-lg">
            {slotSymbols[2]}
          </div>
        </div>

        {/* Dice Animation */}
        <div className="flex items-center space-x-6 mb-6">
          {diceValues.map((value, index) => (
            <div 
              key={index}
              className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#1a1a1a] font-bold text-lg border-2 border-[#26A17B] shadow-lg"
              style={{
                animation: "diceBounce 0.6s ease-in-out infinite",
                animationDelay: `${index * 0.1}s`
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {/* Progress bar with USDT style */}
        <div className="w-80 h-4 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden border-2 border-[#26A17B] shadow-lg">
          <div 
            className="h-full bg-gradient-to-r from-[#26A17B] via-[#2ECC71] to-[#00D4AA] rounded-full relative"
            style={{ 
              width: `${loadingProgress}%`,
              transition: 'width 0.3s ease-out'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Jackpot effect */}
        {showJackpot && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl font-bold text-[#26A17B] animate-jackpot">
              JACKPOT!
            </div>
          </div>
        )}

        {/* Loading text */}
        <div className="text-lg text-[#26A17B] font-semibold animate-pulse">
          Loading USDT Experience...
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes rouletteSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes casinoFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes slotMachine {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        @keyframes diceBounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes jackpot {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        .animate-slot-machine {
          animation: slotMachine 0.8s ease-in-out infinite;
        }
        
        .animate-slot-machine-delay-1 {
          animation: slotMachine 0.8s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .animate-slot-machine-delay-2 {
          animation: slotMachine 0.8s ease-in-out infinite;
          animation-delay: 0.4s;
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        
        .animate-jackpot {
          animation: jackpot 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}