import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotScrollAnimationProps {
  className?: string;
}

type MascotState = 'idle' | 'scrolling' | 'excited' | 'sleeping';

const MascotScrollAnimation = ({ className = '' }: MascotScrollAnimationProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let ticking = false;
    let lastKnownScrollPosition = 0;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      
      // Determine scroll direction
      if (currentScrollY > lastKnownScrollPosition) {
        setScrollDirection('down');
      } else if (currentScrollY < lastKnownScrollPosition) {
        setScrollDirection('up');
      }

      setScrollY(currentScrollY);
      setLastScrollTime(currentTime);
      lastKnownScrollPosition = currentScrollY;

      // Update mascot state based on scroll behavior
      if (Math.abs(currentScrollY - scrollY) > 50) {
        setMascotState('scrolling');
      } else if (currentScrollY > window.innerHeight * 2) {
        setMascotState('excited');
      } else {
        setMascotState('idle');
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    // Set up scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check for idle/sleeping state
    const idleTimer = setInterval(() => {
      const timeSinceLastScroll = Date.now() - lastScrollTime;
      if (timeSinceLastScroll > 5000) { // 5 seconds of no scrolling
        setMascotState('sleeping');
      }
    }, 1000);

    // Hide mascot when scrolled far down
    const visibilityTimer = setInterval(() => {
      const shouldBeVisible = window.scrollY < window.innerHeight * 4;
      setIsVisible(shouldBeVisible);
    }, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(idleTimer);
      clearInterval(visibilityTimer);
    };
  }, [scrollY, lastScrollTime]);

  // Calculate mascot position based on scroll
  const mascotY = Math.min(scrollY * 0.1, 100);
  const mascotRotation = scrollDirection === 'down' ? 5 : -5;

  // Mascot expressions and animations based on state
  const getMascotExpression = () => {
    switch (mascotState) {
      case 'scrolling':
        return '😄'; // Happy while scrolling
      case 'excited':
        return '🎉'; // Excited when deep in page
      case 'sleeping':
        return '😴'; // Sleeping when idle
      default:
        return '😊'; // Default happy
    }
  };

  const getMascotAnimation = () => {
    switch (mascotState) {
      case 'scrolling':
        return {
          y: [0, -10, 0],
          rotate: [0, mascotRotation, 0],
          scale: [1, 1.1, 1],
        };
      case 'excited':
        return {
          y: [0, -20, 0],
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        };
      case 'sleeping':
        return {
          y: [0, 5, 0],
          rotate: [0, -5, 5, 0],
          scale: [1, 0.9, 1],
        };
      default:
        return {
          y: [0, -5, 0],
          scale: [1, 1.05, 1],
        };
    }
  };

  const getAnimationDuration = () => {
    switch (mascotState) {
      case 'scrolling':
        return 0.5;
      case 'excited':
        return 1;
      case 'sleeping':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed right-4 z-50 pointer-events-none select-none ${className}`}
          style={{
            top: `${20 + mascotY}px`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mascot Container */}
          <div className="relative">
            {/* Speech Bubble */}
            {mascotState === 'excited' && (
              <motion.div
                className="absolute -top-16 -left-20 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border-2 border-toodles-primary"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-sm font-accent text-toodles-primary font-bold">
                  Keep exploring!
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-toodles-primary"></div>
              </motion.div>
            )}

            {/* Mascot Character */}
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-toodles-primary to-toodles-secondary rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700"
              animate={getMascotAnimation()}
              transition={{
                duration: getAnimationDuration(),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Mascot Face */}
              <motion.div
                className="text-2xl"
                animate={{
                  scale: mascotState === 'scrolling' ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                  repeat: mascotState === 'scrolling' ? Infinity : 0,
                }}
              >
                {getMascotExpression()}
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            {mascotState === 'excited' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-toodles-accent rounded-full"
                    style={{
                      top: `${-10 - i * 5}px`,
                      left: `${20 + i * 8}px`,
                    }}
                    animate={{
                      y: [-20, -40],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </>
            )}

            {/* Progress Ring */}
            <div className="absolute inset-0 -m-1">
              <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-200 dark:text-gray-600"
                />
                <motion.circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-toodles-primary"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1) 
                  }}
                  transition={{ duration: 0.1 }}
                />
              </svg>
            </div>
          </div>

          {/* Scroll Hint for New Users */}
          {scrollY < 100 && (
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500 dark:text-gray-400 font-accent"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Scroll to see more!
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotScrollAnimation;