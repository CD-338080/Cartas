// components/Mine.tsx

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

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

interface MineProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  referrals: number;
  isCurrentUser: boolean;
}

export default function Mine({ currentView, setCurrentView }: MineProps) {
  const showToast = useToast();

  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        triggerHapticFeedback(window);
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  const {
    userTelegramInitData,
    pointsBalance,
  } = useGameStore();

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!userTelegramInitData) return;
    
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/leaderboard?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      showToast('Failed to load leaderboard', 'error');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [userTelegramInitData, showToast]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-gray-600 to-gray-800';
  };

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
      <div className="w-full text-white font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#2a9d8f] text-2xl font-black">₮</span>
                  </div>
                  <p className="text-4xl text-white" suppressHydrationWarning>{Math.floor(pointsBalance).toLocaleString()}</p>
                </div>
              </div>

              {/* Leaderboard Section */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#f3ba2f] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-2xl text-center">Global Leaderboard</h2>
                </div>
                
                {isLoadingLeaderboard ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f3ba2f]"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        className={`relative p-4 rounded-lg transition-all duration-300 ${
                          entry.isCurrentUser
                            ? 'bg-gradient-to-r from-[#f0b90b]/30 to-[#f3ba2f]/30 border-2 border-[#f3ba2f] shadow-lg'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-r ${getRankColor(entry.rank)}`}>
                              {getRankIcon(entry.rank)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-lg">{entry.name}</span>
                                {entry.isCurrentUser && (
                                  <span className="px-2 py-1 bg-[#f3ba2f] text-[#0a1f17] text-xs rounded-full font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-300">
                                {entry.referrals} referrals
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                            </div>
                            <span className="font-bold text-lg">{formatNumber(entry.points)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => handleViewChange('game')}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full flex items-center space-x-2 hover:bg-white/20 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Back to Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}