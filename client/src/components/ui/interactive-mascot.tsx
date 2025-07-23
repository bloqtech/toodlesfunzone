import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveMascotProps {
  className?: string;
}

type MascotExpression = 'happy' | 'excited' | 'surprised' | 'sleepy' | 'bouncy' | 'dizzy';
type ScrollState = 'idle' | 'slow' | 'fast' | 'reverse' | 'stopped';

const InteractiveMascot = ({ className = '' }: InteractiveMascotProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [mascotExpression, setMascotExpression] = useState<MascotExpression>('happy');
  const [scrollState, setScrollState] = useState<ScrollState>('idle');
  const [isVisible, setIsVisible] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const prevScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const messageTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let animationFrame: number;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime.current;
      const scrollDiff = Math.abs(currentScrollY - prevScrollY.current);
      
      // Calculate scroll speed (pixels per second)
      const speed = timeDiff > 0 ? (scrollDiff / timeDiff) * 1000 : 0;
      setScrollSpeed(speed);
      setScrollY(currentScrollY);
      setLastInteraction(currentTime);
      
      // Determine scroll direction
      const direction = currentScrollY > prevScrollY.current ? 'down' : 'up';
      setScrollDirection(direction);
      
      // Update scroll state
      if (speed > 2000) {
        setScrollState('fast');
        setMascotExpression('surprised');
      } else if (speed > 500) {
        setScrollState('slow');
        setMascotExpression('excited');
      } else if (speed > 100) {
        setScrollState('slow');
        setMascotExpression('bouncy');
      } else {
        setScrollState('idle');
        setMascotExpression('happy');
      }
      
      // Show motivational messages based on scroll behavior
      if (speed > 1500 && !showMessage) {
        setShowMessage(true);
        clearTimeout(messageTimeout.current);
        messageTimeout.current = setTimeout(() => setShowMessage(false), 2000);
      }
      
      // Hide mascot when user scrolls too far
      setIsVisible(currentScrollY < window.innerHeight * 6);
      
      prevScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
    };

    const throttledScroll = () => {
      animationFrame = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Check for sleeping state
    const sleepTimer = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      if (timeSinceLastInteraction > 8000) { // 8 seconds of inactivity
        setMascotExpression('sleepy');
        setScrollState('stopped');
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearInterval(sleepTimer);
      clearTimeout(messageTimeout.current);
      cancelAnimationFrame(animationFrame);
    };
  }, [lastInteraction, showMessage]);

  // Calculate dynamic positioning
  const dynamicY = Math.min(scrollY * 0.03, 40);
  const rotation = scrollState === 'fast' ? (scrollDirection === 'down' ? 15 : -15) : 0;

  // Get mascot emoji based on expression
  const getMascotEmoji = () => {
    switch (mascotExpression) {
      case 'excited': return '🎉';
      case 'surprised': return '😲';
      case 'sleepy': return '😴';
      case 'bouncy': return '😄';
      case 'dizzy': return '😵‍💫';
      default: return '😊';
    }
  };

  // Get message based on scroll behavior
  const getMessage = () => {
    if (scrollSpeed > 2000) return "Whoa! Slow down!";
    if (scrollSpeed > 1000) return "You're flying!";
    if (scrollY > 3000) return "Amazing explorer!";
    if (scrollY > 1500) return "Keep going!";
    if (scrollY < 100) return "Scroll to discover!";
    return "Hi there!";
  };

  // Animation variants for different states
  const mascotVariants = {
    idle: {
      y: [0, -3, 0],
      scale: [1, 1.02, 1],
      rotate: 0,
    },
    slow: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      rotate: rotation * 0.3,
    },
    fast: {
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      rotate: rotation,
    },
    stopped: {
      y: [0, 2, 0],
      scale: [1, 0.98, 1],
      rotate: [0, -2, 2, 0],
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed right-6 z-50 select-none ${className}`}
      style={{ top: `${100 + dynamicY}px` }}
      initial={{ opacity: 0, scale: 0, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Progress Ring */}
      <div className="absolute inset-0 -m-3">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-600 opacity-30"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-toodles-primary"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: document.documentElement.scrollHeight > window.innerHeight ? 
                Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1) : 0
            }}
            transition={{ duration: 0.1 }}
          />
        </svg>
      </div>

      {/* Message Bubble */}
      <AnimatePresence>
        {(showMessage || scrollY < 150 || mascotExpression === 'sleepy') && (
          <motion.div
            className="absolute -top-14 -left-20 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-xl border-2 border-toodles-primary min-w-max"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="text-sm font-accent font-bold text-toodles-primary text-center">
              {getMessage()}
            </div>
            {/* Speech bubble tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-toodles-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mascot */}
      <motion.div
        className="relative w-14 h-14 bg-gradient-to-br from-toodles-primary to-toodles-secondary rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-700 cursor-pointer"
        variants={mascotVariants}
        animate={scrollState}
        transition={{
          duration: scrollState === 'fast' ? 0.5 : scrollState === 'stopped' ? 4 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setMascotExpression('excited');
          setShowMessage(true);
          setTimeout(() => {
            setMascotExpression('happy');
            setShowMessage(false);
          }, 1500);
        }}
      >
        {/* Mascot Face */}
        <motion.div
          className="text-2xl z-10"
          animate={{
            scale: scrollSpeed > 1000 ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {getMascotEmoji()}
        </motion.div>

        {/* Glow effect for fast scrolling */}
        {scrollSpeed > 1000 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-orange-500/50 rounded-full blur-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Particle Effects */}
      <AnimatePresence>
        {scrollState === 'fast' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-toodles-accent rounded-full"
                style={{
                  top: `${Math.random() * 56}px`,
                  left: `${Math.random() * 56}px`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: scrollDirection === 'down' ? [0, -30] : [0, 30],
                  y: [0, Math.random() * 40 - 20],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Speed indicator */}
      {scrollSpeed > 500 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-3 bg-toodles-primary rounded-full"
                animate={{
                  scaleY: scrollSpeed > (i + 1) * 500 ? [0.5, 1, 0.5] : 0.3,
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scroll hint for new users */}
      {scrollY < 50 && (
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500 dark:text-gray-400 font-accent whitespace-nowrap"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓ Scroll to explore ↓
        </motion.div>
      )}
    </motion.div>
  );
};

export default InteractiveMascot;