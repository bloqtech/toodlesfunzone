import { useState, useEffect, useRef } from 'react';

export interface ScrollMascotState {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  scrollSpeed: number;
  isScrolling: boolean;
  mascotMood: 'happy' | 'excited' | 'sleeping' | 'surprised';
  shouldShowHints: boolean;
}

interface UseScrollMascotOptions {
  idleTimeout?: number;
  excitementThreshold?: number;
  speedThreshold?: number;
}

export const useScrollMascot = (options: UseScrollMascotOptions = {}) => {
  const {
    idleTimeout = 5000,
    excitementThreshold = 2000,
    speedThreshold = 10,
  } = options;

  const [state, setState] = useState<ScrollMascotState>({
    scrollY: 0,
    scrollDirection: 'down',
    scrollSpeed: 0,
    isScrolling: false,
    mascotMood: 'happy',
    shouldShowHints: true,
  });

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      
      // Calculate scroll metrics
      const timeDiff = currentTime - lastScrollTime.current;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      const scrollSpeed = timeDiff > 0 ? scrollDiff / timeDiff * 1000 : 0;
      
      const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
      
      // Determine mascot mood based on scroll behavior
      let mascotMood: ScrollMascotState['mascotMood'] = 'happy';
      
      if (scrollSpeed > speedThreshold * 2) {
        mascotMood = 'surprised';
      } else if (currentScrollY > excitementThreshold) {
        mascotMood = 'excited';
      } else if (scrollSpeed > speedThreshold) {
        mascotMood = 'happy';
      }

      setState(prev => ({
        ...prev,
        scrollY: currentScrollY,
        scrollDirection,
        scrollSpeed,
        isScrolling: true,
        mascotMood,
        shouldShowHints: currentScrollY < 200,
      }));

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set timeout for idle state
      scrollTimeout.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isScrolling: false,
          mascotMood: 'sleeping',
          scrollSpeed: 0,
        }));
      }, idleTimeout);

      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
    };

    // Throttled scroll handler
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [idleTimeout, excitementThreshold, speedThreshold]);

  return state;
};

// Helper functions for mascot animations
export const getMascotEmoji = (mood: ScrollMascotState['mascotMood']) => {
  switch (mood) {
    case 'excited':
      return '🎉';
    case 'surprised':
      return '😲';
    case 'sleeping':
      return '😴';
    default:
      return '😊';
  }
};

export const getMascotMessage = (mood: ScrollMascotState['mascotMood'], scrollY: number) => {
  switch (mood) {
    case 'excited':
      return scrollY > 3000 ? "You're exploring everything!" : "Keep going!";
    case 'surprised':
      return "Whoa, slow down!";
    case 'sleeping':
      return "Zzz...";
    default:
      return "Hi there!";
  }
};

export const getMascotColors = (mood: ScrollMascotState['mascotMood']) => {
  switch (mood) {
    case 'excited':
      return {
        background: 'from-yellow-400 to-orange-500',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
      };
    case 'surprised':
      return {
        background: 'from-red-400 to-pink-500',
        border: 'border-red-300',
        text: 'text-red-900',
      };
    case 'sleeping':
      return {
        background: 'from-blue-400 to-indigo-500',
        border: 'border-blue-300',
        text: 'text-blue-900',
      };
    default:
      return {
        background: 'from-toodles-primary to-toodles-secondary',
        border: 'border-toodles-primary',
        text: 'text-white',
      };
  }
};