import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useScrollMascot, getMascotEmoji, getMascotMessage, getMascotColors } from '@/hooks/use-scroll-mascot';
import MascotReactions from './mascot-reactions';

interface FloatingMascotProps {
  className?: string;
}

const FloatingMascot = ({ className = '' }: FloatingMascotProps) => {
  const { 
    scrollY, 
    scrollDirection, 
    scrollSpeed, 
    isScrolling, 
    mascotMood, 
    shouldShowHints 
  } = useScrollMascot();

  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Handle mascot click interaction
  const handleMascotClick = () => {
    setClickCount(prev => prev + 1);
    setShowReaction('click');
  };

  // Trigger reactions based on scroll behavior
  useEffect(() => {
    if (scrollSpeed > 40) {
      setShowReaction('scroll-fast');
    } else if (mascotMood === 'sleeping') {
      setShowReaction('idle');
    }
  }, [scrollSpeed, mascotMood]);

  const colors = getMascotColors(mascotMood);
  const emoji = getMascotEmoji(mascotMood);
  const message = getMascotMessage(mascotMood, scrollY);

  // Calculate visibility based on scroll position
  const isVisible = scrollY < window.innerHeight * 5; // Hide after scrolling 5 screen heights

  // Dynamic positioning based on scroll
  const yOffset = Math.min(scrollY * 0.05, 50);
  const rotation = isScrolling ? (scrollDirection === 'down' ? 3 : -3) : 0;

  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed right-6 z-50 pointer-events-none select-none ${className}`}
      style={{ top: `${80 + yOffset}px` }}
      initial={{ opacity: 0, scale: 0, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0, x: 100 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.6 
      }}
    >
      {/* Message Bubble */}
      {(mascotMood === 'excited' || mascotMood === 'surprised' || shouldShowHints) && (
        <motion.div
          className="absolute -top-12 -left-16 bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-xl border-2 border-current max-w-32"
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 10 }}
          transition={{ delay: 0.3, type: "spring" }}
          style={{ color: colors.border.replace('border-', '') }}
        >
          <div className={`text-xs font-accent font-bold text-center ${colors.text}`}>
            {shouldShowHints && scrollY < 100 ? "Scroll to explore!" : 
             clickCount > 5 ? "You love clicking me! 😄" :
             clickCount > 2 ? "Hi friend! 👋" : 
             message}
          </div>
          {/* Speech bubble tail */}
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent"
            style={{ borderTopColor: 'currentColor' }}
          />
        </motion.div>
      )}

      {/* Main Mascot Body */}
      <motion.div
        className={`relative w-14 h-14 bg-gradient-to-br ${colors.background} rounded-full flex items-center justify-center shadow-lg border-4 ${colors.border} overflow-hidden cursor-pointer pointer-events-auto`}
        onClick={handleMascotClick}
        onMouseEnter={() => setShowReaction('hover')}
        animate={{
          rotate: rotation,
          scale: isScrolling ? [1, 1.1, 1] : mascotMood === 'sleeping' ? [1, 0.95, 1] : 1,
          y: mascotMood === 'excited' ? [0, -8, 0] : mascotMood === 'sleeping' ? [0, 3, 0] : [0, -2, 0],
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          rotate: { duration: 0.3 },
          scale: { 
            duration: mascotMood === 'sleeping' ? 3 : 1,
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: {
            duration: mascotMood === 'excited' ? 0.8 : mascotMood === 'sleeping' ? 4 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {/* Mascot Face */}
        <motion.div
          className="text-xl z-10"
          animate={{
            scale: scrollSpeed > 20 ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {emoji}
        </motion.div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-full" />
        </div>

        {/* Interactive Reactions */}
        <AnimatePresence>
          {showReaction && (
            <MascotReactions
              trigger={showReaction as any}
              onComplete={() => setShowReaction(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scroll Progress Ring */}
      <div className="absolute inset-0 -m-2">
        <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-200 dark:text-gray-600 opacity-30"
          />
          <motion.circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={colors.border.replace('border-', 'text-')}
            style={{
              strokeDasharray: `${2 * Math.PI * 30}`,
              strokeDashoffset: `${2 * Math.PI * 30 * (1 - Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1))}`,
            }}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 30 * (1 - Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1))}`,
            }}
            transition={{ duration: 0.1 }}
          />
        </svg>
      </div>

      {/* Sparkle Effects for Excited State */}
      {mascotMood === 'excited' && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
              style={{
                top: `${-5 - i * 8}px`,
                left: `${15 + i * 6}px`,
              }}
              animate={{
                y: [-20, -35],
                x: [0, Math.random() * 20 - 10],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Speed Lines for Fast Scrolling */}
      {scrollSpeed > 30 && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`speed-line-${i}`}
              className="absolute w-8 h-0.5 bg-current opacity-60 rounded-full"
              style={{
                top: `${20 + i * 4}px`,
                left: scrollDirection === 'down' ? '-20px' : '50px',
              }}
              animate={{
                x: scrollDirection === 'down' ? [-20, 20] : [20, -20],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default FloatingMascot;