import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MascotReactionsProps {
  trigger: 'click' | 'hover' | 'scroll-fast' | 'idle';
  onComplete?: () => void;
}

const MascotReactions = ({ trigger, onComplete }: MascotReactionsProps) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  const getReactionElements = () => {
    switch (trigger) {
      case 'click':
        return (
          <>
            {/* Hearts */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-red-500 text-lg"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0, 
                  scale: 0 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 60, 
                  y: -40 - i * 10, 
                  opacity: [0, 1, 0], 
                  scale: [0, 1.2, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                ❤️
              </motion.div>
            ))}
          </>
        );

      case 'hover':
        return (
          <>
            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.cos((i * Math.PI * 2) / 8) * 25 + 25}px`,
                  top: `${Math.sin((i * Math.PI * 2) / 8) * 25 + 25}px`,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        );

      case 'scroll-fast':
        return (
          <>
            {/* Speed streaks */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`streak-${i}`}
                className="absolute w-12 h-1 bg-blue-400 rounded-full opacity-70"
                style={{
                  top: `${20 + i * 3}px`,
                  left: '-30px',
                }}
                animate={{
                  x: [0, 40],
                  opacity: [0, 0.8, 0],
                  scaleX: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        );

      case 'idle':
        return (
          <>
            {/* Floating Z's */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`z-${i}`}
                className="absolute text-blue-400 text-lg font-bold"
                style={{
                  left: `${30 + i * 8}px`,
                  top: `${-10 - i * 8}px`,
                }}
                animate={{
                  y: [-20, -40],
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                z
              </motion.div>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {getReactionElements()}
        </div>
      )}
    </AnimatePresence>
  );
};

export default MascotReactions;