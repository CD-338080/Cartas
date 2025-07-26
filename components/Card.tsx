// components/Card.tsx

interface CardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  isHidden?: boolean;
  isDealer?: boolean;
  isAnimating?: boolean;
  animationDelay?: number;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};

export default function Card({ suit, value, isHidden = false, isDealer = false, isAnimating = false, animationDelay = 0 }: CardProps) {
  if (isHidden) {
    return (
      <div 
        className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white shadow-lg flex items-center justify-center relative overflow-hidden transform hover:scale-105 transition-all duration-500 ease-out"
        style={{
          transform: isAnimating ? 'translateY(-100px) scale(0.5)' : 'translateY(0) scale(1)',
          opacity: isAnimating ? 0 : 1,
          transitionDelay: `${animationDelay}ms`
        }}
      >
        {/* Card back pattern */}
        <div className="absolute inset-1 bg-white/10 rounded-md"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md opacity-20"></div>
        <div className="absolute inset-3 border border-white/20 rounded-md"></div>
        <div className="text-white text-xs font-bold tracking-wider">CASINO</div>
        {/* Decorative pattern */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    );
  }

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const cardColor = isRed ? 'text-red-600' : 'text-black';

  return (
    <div 
      className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col justify-between p-1 relative transform hover:scale-105 transition-all duration-500 ease-out hover:shadow-xl"
      style={{
        transform: isAnimating ? 'translateY(-100px) scale(0.5)' : 'translateY(0) scale(1)',
        opacity: isAnimating ? 0 : 1,
        transitionDelay: `${animationDelay}ms`
      }}
    >
      {/* Top left corner */}
      <div className="flex flex-col items-start">
        <div className={`text-xs font-bold ${cardColor}`}>{value}</div>
        <div className={`text-xs ${cardColor}`}>{suitSymbols[suit]}</div>
      </div>
      
      {/* Center symbol */}
      <div className="flex items-center justify-center flex-1">
        <div className={`text-2xl ${cardColor} drop-shadow-sm`}>{suitSymbols[suit]}</div>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className="flex flex-col items-end transform rotate-180">
        <div className={`text-xs font-bold ${cardColor}`}>{value}</div>
        <div className={`text-xs ${cardColor}`}>{suitSymbols[suit]}</div>
      </div>
      
      {/* Subtle glow effect for special cards */}
      {value === 'A' && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400/10 to-orange-400/10 pointer-events-none"></div>
      )}
      {(value === 'K' || value === 'Q' || value === 'J') && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-400/10 to-blue-400/10 pointer-events-none"></div>
      )}
    </div>
  );
} 