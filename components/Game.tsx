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
import Card from '@/components/Card';
import { useSound, SOUND_EFFECTS } from '@/utils/useSound';

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

interface CardType {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
}

type GameState = 'betting' | 'playing' | 'dealer' | 'result';

export default function Game({ currentView, setCurrentView }: GameProps) {
  const { playSound } = useSound();
  const [gameState, setGameState] = useState<GameState>('betting');
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [cardAnimations, setCardAnimations] = useState<{player: boolean[], dealer: boolean[]}>({player: [], dealer: []});
  const [dealingCards, setDealingCards] = useState<{player: CardType[], dealer: CardType[]}>({player: [], dealer: []});
  const [showDealingCard, setShowDealingCard] = useState(false);
  const [dealingCardPosition, setDealingCardPosition] = useState({x: 0, y: 0});
  const [dealerCompleteHand, setDealerCompleteHand] = useState<CardType[]>([]);
  const [flyingCard, setFlyingCard] = useState<{show: boolean, card: CardType | null, target: 'player' | 'dealer'}>({show: false, card: null, target: 'player'});

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

  // Create a standard 52-card deck
  const createDeck = (): CardType[] => {
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: CardType[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    
    return shuffleDeck(deck);
  };

  // Shuffle the deck
  const shuffleDeck = (deck: CardType[]): CardType[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Test function to verify card calculations
  const testCardCalculation = () => {
    console.log('=== TESTING CARD CALCULATIONS ===');
    
    // Test your example
    const testHand1 = [
      { suit: 'hearts' as const, value: '8' },
      { suit: 'diamonds' as const, value: '4' },
      { suit: 'clubs' as const, value: 'A' },
      { suit: 'spades' as const, value: '7' }
    ];
    
    const result1 = calculateHandValue(testHand1);
    console.log('Test hand 1 (8,4,A,7):', result1);
    
    // Test player hand
    const testHand2 = [
      { suit: 'hearts' as const, value: 'K' },
      { suit: 'diamonds' as const, value: 'Q' }
    ];
    
    const result2 = calculateHandValue(testHand2);
    console.log('Test hand 2 (K,Q):', result2);
    
    console.log('=== END TEST ===');
  };

  // Calculate hand value
  const calculateHandValue = (hand: CardType[]): number => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    // Add aces
    for (let i = 0; i < aces; i++) {
      if (value + 11 <= 21) {
        value += 11;
      } else {
        value += 1;
      }
    }

    console.log('Hand:', hand.map(c => c.value), 'Value:', value, 'Aces:', aces);
    return value;
  };

  // Deal initial cards with professional animations
  const dealInitialCards = () => {
    setIsDealing(true);
    triggerHapticFeedback(window);
    
    // Play dealing sound
    playSound(SOUND_EFFECTS.CARD_DEAL, { volume: 0.4 });
    
    // Test card calculations
    testCardCalculation();
    
    const newDeck = createDeck();
    const playerCards = [newDeck[0], newDeck[2]];
    const dealerCards = [newDeck[1], newDeck[3]];
    
    console.log('Dealing cards:');
    console.log('Player cards:', playerCards.map(c => c.value));
    console.log('Dealer cards:', dealerCards.map(c => c.value));
    
    // Clear hands and start fresh
    setPlayerHand([]);
    setDealerHand([]);
    setDealerCompleteHand([]);
    setCardAnimations({player: [false, false], dealer: [false, false]});
    
    // Deal first card to player
    setTimeout(() => {
      setPlayerHand([playerCards[0]]);
      setCardAnimations(prev => ({...prev, player: [true, false]}));
      triggerHapticFeedback(window);
      playSound(SOUND_EFFECTS.CARD_DEAL, { volume: 0.3 });
    }, 200);
    
    // Deal first card to dealer
    setTimeout(() => {
      setDealerHand([dealerCards[0]]);
      setDealerCompleteHand([dealerCards[0]]);
      setCardAnimations(prev => ({...prev, dealer: [true, false]}));
      triggerHapticFeedback(window);
      playSound(SOUND_EFFECTS.CARD_DEAL, { volume: 0.3 });
    }, 500);
    
    // Deal second card to player
    setTimeout(() => {
      setPlayerHand(playerCards);
      setCardAnimations(prev => ({...prev, player: [true, true]}));
      triggerHapticFeedback(window);
      playSound(SOUND_EFFECTS.CARD_DEAL, { volume: 0.3 });
    }, 800);
    
    // Deal second card to dealer (hidden) - add to complete hand but not visible hand
    setTimeout(() => {
      setDealerCompleteHand(dealerCards);
      // Keep dealerHand as only the first card (visible)
      setCardAnimations(prev => ({...prev, dealer: [true, false]}));
      triggerHapticFeedback(window);
      playSound(SOUND_EFFECTS.CARD_DEAL, { volume: 0.3 });
    }, 1100);
    
    // Set final state
    setTimeout(() => {
      setDeck(newDeck.slice(4));
      const playerValue = calculateHandValue(playerCards);
      const dealerValue = calculateHandValue([dealerCards[0]]);
      setPlayerScore(playerValue);
      setDealerScore(dealerValue);
      setIsDealing(false);
      setGameState('playing');
    }, 1400);
  };

  // Hit (draw a card) with animation
  const hit = () => {
    if (gameState !== 'playing' || deck.length === 0) return;
    
    triggerHapticFeedback(window);
    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
    
    const newCard = deck[0];
    const newPlayerHand = [...playerHand, newCard];
    const newDeck = deck.slice(1);
    
    // Show flying card animation
    setFlyingCard({show: true, card: newCard, target: 'player'});
    
    // Animate card dealing
    setCardAnimations(prev => ({
      ...prev, 
      player: [...prev.player, false]
    }));
    
    setTimeout(() => {
      setFlyingCard({show: false, card: null, target: 'player'});
      setPlayerHand(newPlayerHand);
      setDeck(newDeck);
      setCardAnimations(prev => ({
        ...prev, 
        player: [...prev.player.slice(0, -1), true]
      }));
      
      const newScore = calculateHandValue(newPlayerHand);
      setPlayerScore(newScore);
      
      // Check for bust
      if (newScore > 21) {
        setTimeout(() => {
          endGame('lose');
        }, 800);
      }
    }, 600);
  };

  // Stand (end player's turn)
  const stand = () => {
    if (gameState !== 'playing') return;
    
    triggerHapticFeedback(window);
    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
    setGameState('dealer');
    playDealerTurn();
  };

  // Dealer's turn with animations
  const playDealerTurn = () => {
    let currentDealerHand = [...dealerCompleteHand];
    let currentDeck = [...deck];
    
    console.log('Dealer turn starts with:', currentDealerHand.map(c => c.value));
    
    // First, reveal the hidden card with animation
    setTimeout(() => {
      setDealerHand(dealerCompleteHand);
      setCardAnimations(prev => ({
        ...prev,
        dealer: prev.dealer.map(() => true)
      }));
      playSound(SOUND_EFFECTS.CARD_FLIP, { volume: 0.5 });
    }, 500);
    
    const dealerTurn = () => {
      const dealerValue = calculateHandValue(currentDealerHand);
      console.log('Dealer hand:', currentDealerHand.map(c => c.value), 'Value:', dealerValue);
      
      if (dealerValue >= 17) {
        // Dealer stands
        setDealerHand(currentDealerHand);
        setDealerScore(dealerValue);
        console.log('Dealer stands with:', dealerValue);
        setTimeout(() => {
          determineWinner(dealerValue);
        }, 800);
        return;
      }
      
      // Dealer hits with animation
      const newCard = currentDeck[0];
      currentDealerHand = [...currentDealerHand, newCard];
      currentDeck = currentDeck.slice(1);
      
      console.log('Dealer hits, new card:', newCard.value);
      
      // Play dealer hit sound
      playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.3 });
      
      // Show flying card animation for dealer
      setFlyingCard({show: true, card: newCard, target: 'dealer'});
      
      // Animate dealer card dealing
      setCardAnimations(prev => ({
        ...prev, 
        dealer: [...prev.dealer, false]
      }));
      
      setTimeout(() => {
        setFlyingCard({show: false, card: null, target: 'dealer'});
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
        setCardAnimations(prev => ({
          ...prev, 
          dealer: [...prev.dealer.slice(0, -1), true]
        }));
        
        const newDealerValue = calculateHandValue(currentDealerHand);
        setDealerScore(newDealerValue);
        console.log('Dealer new value:', newDealerValue);
        
        if (newDealerValue > 21) {
          // Dealer busts
          console.log('DEALER BUSTS! Player wins!');
          setTimeout(() => {
            endGame('win');
          }, 1200);
          return;
        }
        
        // Continue dealer's turn
        setTimeout(dealerTurn, 1500);
      }, 600);
    };
    
    setTimeout(dealerTurn, 1500);
  };

  // Determine winner
  const determineWinner = (finalDealerScore: number) => {
    console.log('Determining winner:');
    console.log('Player score:', playerScore);
    console.log('Dealer score:', finalDealerScore);
    
    if (playerScore > 21) {
      console.log('Player busts - Dealer wins');
      endGame('lose');
    } else if (finalDealerScore > 21) {
      console.log('Dealer busts - Player wins');
      endGame('win');
    } else if (playerScore > finalDealerScore) {
      console.log('Player wins with higher score');
      endGame('win');
    } else if (playerScore < finalDealerScore) {
      console.log('Dealer wins with higher score');
      endGame('lose');
    } else {
      console.log('Draw - same scores');
      endGame('draw');
    }
  };

  // End game
  const endGame = (result: 'win' | 'lose' | 'draw') => {
    setGameResult(result);
    setShowResult(true);
    setGameState('result');
    
    // Play appropriate sound based on result
    if (result === 'win') {
      playSound(SOUND_EFFECTS.ROULETTE_WIN, { volume: 0.7 });
      playSound(SOUND_EFFECTS.COIN_COLLECT, { volume: 0.6 });
      clickTriggered();
      updateLastClickTimestamp();
    } else if (result === 'lose') {
      playSound(SOUND_EFFECTS.ROULETTE_LOSE, { volume: 0.6 });
    } else {
      // Draw - play a neutral sound
      playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
    }
    
    setTimeout(() => {
      setShowResult(false);
    }, 3000);
  };

  // Play again
  const playAgain = () => {
    triggerHapticFeedback(window);
    playSound(SOUND_EFFECTS.BUTTON_CLICK, { volume: 0.4 });
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setDealerCompleteHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setGameResult(null);
    setShowResult(false);
    setIsDealing(false);
    setCardAnimations({player: [], dealer: []});
    setFlyingCard({show: false, card: null, target: 'player'});
  };

  return (
    <div className="bg-gradient-to-b from-[#0f5132] to-[#90ef89] flex justify-center min-h-screen">
      <div className="w-full text-white font-bold flex flex-col max-w-xl">
        <TopInfoSection isGamePage={true} setCurrentView={setCurrentView} />

        <div className="flex-grow mt-4 bg-gradient-to-r from-[#0f5132] to-[#90ef89] rounded-t-[48px] relative top-glow z-0 shadow-lg">
          <div className="mt-[2px] bg-gradient-to-b from-[#90ef89] to-[#20c997] rounded-t-[46px] overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">

              {/* Points Display */}
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl flex items-center space-x-3 shadow-inner">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#90ef89] text-2xl font-black">₮</span>
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

              {/* Professional Casino Blackjack */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent drop-shadow-lg">
                  USDT Blackjack 21
                </h2>
                
                {/* Dealer Section */}
                <div className="mb-6">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">🎩 Dealer</h3>
                    {gameState !== 'betting' && (
                      <p className="text-sm text-white/80">
                        Score: {gameState === 'playing' ? '?' : dealerScore}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center gap-2">
                    {dealerHand.map((card, index) => (
                      <div key={index} className="transform hover:scale-105 transition-transform">
                        <Card 
                          suit={card.suit} 
                          value={card.value} 
                          isHidden={gameState === 'playing' && index === 1}
                          isAnimating={!cardAnimations.dealer[index]}
                          animationDelay={index * 200}
                        />
                      </div>
                    ))}
                    {/* Show hidden card placeholder during player's turn */}
                    {gameState === 'playing' && dealerCompleteHand.length > 1 && dealerHand.length === 1 && (
                      <div className="transform hover:scale-105 transition-transform">
                        <Card 
                          suit="hearts" 
                          value="A" 
                          isHidden={true}
                          isAnimating={false}
                          animationDelay={0}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Section */}
                <div className="mb-6">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">👤 Your Hand</h3>
                    {gameState !== 'betting' && (
                      <p className="text-sm text-white/80">
                        Score: {playerScore}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center gap-2">
                    {playerHand.map((card, index) => (
                      <div key={index} className="transform hover:scale-105 transition-transform">
                        <Card 
                          suit={card.suit} 
                          value={card.value} 
                          isAnimating={!cardAnimations.player[index]}
                          animationDelay={index * 200}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Controls */}
                {gameState === 'betting' && (
                  <button
                    onClick={dealInitialCards}
                    disabled={isDealing}
                    className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] hover:from-[#f3ba2f] hover:to-[#f0b90b] text-[#0a1f17] shadow-yellow-500/30 transform hover:scale-105 active:scale-95 ${
                      isDealing ? 'animate-pulse' : ''
                    }`}
                  >
                    {isDealing ? '🃏 Dealing...' : '🃏 Deal Cards'}
                  </button>
                )}

                {gameState === 'playing' && (
                  <div className="flex gap-4">
                    <button
                      onClick={hit}
                      className="flex-1 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 bg-gradient-to-r from-[#90ef89] to-[#7dd87d] hover:from-[#7dd87d] hover:to-[#6bc26b] text-white transform hover:scale-105 active:scale-95"
                    >
                      🃏 Hit
                    </button>
                    <button
                      onClick={stand}
                      className="flex-1 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-105 active:scale-95"
                    >
                      ✋ Stand
                    </button>
                  </div>
                )}

                {gameState === 'result' && (
                  <button
                    onClick={playAgain}
                    className="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] hover:from-[#f3ba2f] hover:to-[#f0b90b] text-[#0a1f17] shadow-yellow-500/30 transform hover:scale-105 active:scale-95"
                  >
                    🃏 Play Again
                  </button>
                )}

                {/* Game Result Display */}
                {gameResult && (
                  <div className="mt-4 text-center">
                    {gameResult === 'win' && (
                      <div className="text-[#f0b90b] font-bold text-xl animate-pulse-glow">
                        🎉 You won 1 <span className="text-[#90ef89] font-black text-2xl">₮</span>!
                      </div>
                    )}
                    {gameResult === 'lose' && (
                      <div className="text-red-400 font-bold text-xl animate-pulse">
                        💥 You lost. Try again.
                      </div>
                    )}
                    {gameResult === 'draw' && (
                      <div className="text-blue-400 font-bold text-xl animate-pulse">
                        ⚖️ Draw! No one wins.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Instructions */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent drop-shadow-lg">
                  🎯 How to Play & Win
                </h2>
                <div className="space-y-4 text-white/90">
                  {/* Game Objective */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-[#f0b90b] mb-2">🎯 Objective</h3>
                    <p>Get as close to <span className="text-[#90ef89] font-bold">21</span> as possible without going over. Beat the dealer&apos;s hand to win!</p>
                  </div>

                  {/* Card Values */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-[#f0b90b] mb-2">🃏 Card Values</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• <span className="text-[#90ef89]">2-10:</span> Face value</div>
                      <div>• <span className="text-purple-400">J, Q, K:</span> 10 points</div>
                      <div>• <span className="text-yellow-400">A:</span> 1 or 11 (auto-adjusted)</div>
                    </div>
                  </div>

                  {/* Game Flow */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-[#f0b90b] mb-2">🔄 Game Flow</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-[#90ef89] font-bold">1.</span>
                        <span>Click <span className="text-[#90ef89] font-bold">&quot;Deal Cards&quot;</span> to start</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-[#90ef89] font-bold">2.</span>
                        <span>Choose <span className="text-[#90ef89] font-bold">&quot;Hit&quot;</span> to draw a card or <span className="text-red-400 font-bold">&quot;Stand&quot;</span> to keep your hand</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-[#90ef89] font-bold">3.</span>
                        <span>Dealer plays automatically after you stand</span>
                      </div>
                    </div>
                  </div>

                  {/* How to Win */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-[#f0b90b] mb-2">🏆 How to Win</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-[#90ef89]">✅</span>
                        <span>Your hand is closer to 21 than dealer&apos;s</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-[#90ef89]">✅</span>
                        <span>Dealer busts (goes over 21)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-red-400">❌</span>
                        <span>You bust (go over 21) = You lose</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400">⚖️</span>
                        <span>Same score = Draw (no winner)</span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="bg-gradient-to-r from-[#f0b90b]/20 to-[#f3ba2f]/20 rounded-lg p-4 border border-[#f0b90b]/30">
                    <h3 className="text-lg font-bold text-[#f0b90b] mb-2">💰 Rewards</h3>
                    <p className="text-center text-[#f0b90b] font-bold text-lg">
                      Win = <span className="text-2xl">+1 <span className="text-[#90ef89] font-black text-3xl">₮</span></span> 🎉
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Payouts button */}
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
          {/* Background overlay for better visibility */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          
          {/* Main result container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Emoji animation */}
            <div className={`text-8xl mb-4 ${
              gameResult === 'win' ? 'animate-bounce' : 
              gameResult === 'lose' ? 'animate-shake' : 
              'animate-pulse'
            }`}>
              {gameResult === 'win' ? '🎉' : gameResult === 'lose' ? '💥' : '⚖️'}
            </div>
            
            {/* Text animation */}
            <div className={`text-5xl font-bold text-center ${
              gameResult === 'win' ? 'text-[#f0b90b] animate-float' : 
              gameResult === 'lose' ? 'text-red-400 animate-slide-up' : 
              'text-blue-400 animate-slide-up'
            }`}>
              {gameResult === 'win' ? (
                <div className="flex items-center space-x-2">
                  <span>+1</span>
                  <span className="text-[#90ef89] font-black animate-pulse">₮</span>
                  <span>!</span>
                </div>
              ) : gameResult === 'lose' ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">💥 You Lost!</span>
                  <span className="text-2xl text-white/80">Try Again</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">⚖️ Draw!</span>
                  <span className="text-2xl text-white/80">No Winner</span>
                </div>
              )}
            </div>
            
            {/* Additional effects for lose */}
            {gameResult === 'lose' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-explosion">
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute top-1/4 left-1/4"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute top-1/4 right-1/4"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute bottom-1/4 left-1/4"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute bottom-1/4 right-1/4"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            )}
            
            {/* Additional effects for draw */}
            {gameResult === 'draw' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-balance">
                  <div className="w-6 h-6 bg-blue-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-6 h-6 bg-blue-400 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flying Card Animation */}
      {(isDealing || flyingCard.show) && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className={`w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white shadow-2xl flex items-center justify-center ${
            isDealing ? 'animate-flying-card' : 'animate-flying-card-new'
          }`}>
            {flyingCard.card ? (
              <div className="text-white text-xs font-bold tracking-wider">
                {flyingCard.card.value}
              </div>
            ) : (
              <div className="text-white text-xs font-bold tracking-wider">CASINO</div>
            )}
          </div>
        </div>
      )}

      {/* Flying Card with Real Card Display */}
      {flyingCard.show && flyingCard.card && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-2xl flex flex-col justify-between p-1 animate-flying-card-new">
            {/* Top left corner */}
            <div className="flex flex-col items-start">
              <div className={`text-xs font-bold ${flyingCard.card.suit === 'hearts' || flyingCard.card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                {flyingCard.card.value}
              </div>
              <div className={`text-xs ${flyingCard.card.suit === 'hearts' || flyingCard.card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                {flyingCard.card.suit === 'hearts' ? '♥' : flyingCard.card.suit === 'diamonds' ? '♦' : flyingCard.card.suit === 'clubs' ? '♣' : '♠'}
              </div>
            </div>
            
            {/* Center symbol */}
            <div className="flex items-center justify-center flex-1">
              <div className={`text-2xl ${flyingCard.card.suit === 'hearts' || flyingCard.card.suit === 'diamonds' ? 'text-red-600' : 'text-black'} drop-shadow-sm`}>
                {flyingCard.card.suit === 'hearts' ? '♥' : flyingCard.card.suit === 'diamonds' ? '♦' : flyingCard.card.suit === 'clubs' ? '♣' : '♠'}
              </div>
            </div>
            
            {/* Bottom right corner (rotated) */}
            <div className="flex flex-col items-end transform rotate-180">
              <div className={`text-xs font-bold ${flyingCard.card.suit === 'hearts' || flyingCard.card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                {flyingCard.card.value}
              </div>
              <div className={`text-xs ${flyingCard.card.suit === 'hearts' || flyingCard.card.suit === 'diamonds' ? 'text-red-600' : 'text-black'}`}>
                {flyingCard.card.suit === 'hearts' ? '♥' : flyingCard.card.suit === 'diamonds' ? '♦' : flyingCard.card.suit === 'clubs' ? '♣' : '♠'}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        body {
          background: linear-gradient(to bottom, #0f5132, #90ef89);
          min-height: 100vh;
        }
        
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
        @keyframes card-appear {
          0% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes card-flip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        @keyframes dealer-reveal {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(243, 186, 47, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(243, 186, 47, 0.6);
          }
        }
        @keyframes flying-card {
          0% {
            transform: translateY(-200px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          20% {
            transform: translateY(-100px) scale(0.8) rotate(-90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(0deg);
            opacity: 1;
          }
          80% {
            transform: translateY(-20px) scale(1.1) rotate(0deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes flying-card-new {
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
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(10px);
          }
        }
        
        @keyframes slide-up {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes explosion {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(2) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes balance {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-20px);
          }
          75% {
            transform: translateY(20px);
          }
        }
        
        .animate-float {
          animation: float 2s ease-out forwards;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .animate-card-appear {
          animation: card-appear 0.8s ease-out forwards;
        }
        .animate-card-flip {
          animation: card-flip 0.4s ease-in-out;
        }
        .animate-dealer-reveal {
          animation: dealer-reveal 0.8s ease-in-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-flying-card {
          animation: flying-card 1.2s ease-out forwards;
        }
        .animate-flying-card-new {
          animation: flying-card-new 0.8s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-explosion {
          animation: explosion 1.5s ease-out forwards;
        }
        .animate-balance {
          animation: balance 2s ease-in-out infinite;
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