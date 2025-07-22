import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

// Fallback to direct file access if API fails
const videoAssets = [
  { id: 1, src: '/attached_assets/1_1753189659952.mp4', alt: 'Toodles kids playing video 1' },
  { id: 2, src: '/attached_assets/2_1753189659952.mp4', alt: 'Toodles kids playing video 2' },
  { id: 3, src: '/attached_assets/3_1753189659952.mp4', alt: 'Toodles kids playing video 3' },
  { id: 4, src: '/attached_assets/4_1753189659951.mp4', alt: 'Toodles kids playing video 4' },
  { id: 5, src: '/attached_assets/5_1753189659951.mp4', alt: 'Toodles kids playing video 5' },
  { id: 6, src: '/attached_assets/6_1753189659951.mp4', alt: 'Toodles kids playing video 6' },
  { id: 7, src: '/attached_assets/7_1753189659950.mp4', alt: 'Toodles kids playing video 7' },
  { id: 8, src: '/attached_assets/8_1753189659950.mp4', alt: 'Toodles kids playing video 8' },
  { id: 9, src: '/attached_assets/9_1753189659950.mp4', alt: 'Toodles kids playing video 9' },
  { id: 10, src: '/attached_assets/10_1753189659949.mp4', alt: 'Toodles kids playing video 10' }
];

interface FallbackVideoPlayerProps {
  className?: string;
  autoAdvance?: boolean;
  advanceInterval?: number; // seconds
}

export function FallbackVideoPlayer({ 
  className = "",
  autoAdvance = true,
  advanceInterval = 8
}: FallbackVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentVideo = videoAssets[currentIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoAdvance && isPlaying && !hasError) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = (prev + 1) % videoAssets.length;
          trackEvent('video_auto_advance', 'media', `video_${videoAssets[next].id}`);
          return next;
        });
      }, advanceInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoAdvance, isPlaying, hasError, advanceInterval]);

  useEffect(() => {
    setHasError(false);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex(prev => {
      const next = (prev + 1) % videoAssets.length;
      trackEvent('video_manual_advance', 'media', `video_${videoAssets[next].id}`);
      return next;
    });
  };

  const handlePlay = () => {
    setIsPlaying(true);
    trackEvent('video_play', 'media', `video_${currentVideo.id}`);
  };

  const handlePause = () => {
    setIsPlaying(false);
    trackEvent('video_pause', 'media', `video_${currentVideo.id}`);
  };

  const handleError = () => {
    console.warn('Error loading video:', currentVideo.src);
    setHasError(true);
    // Auto-advance to next video on error
    setTimeout(handleNext, 2000);
  };

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-toodles-primary/20 to-toodles-secondary/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎬</div>
          <div className="text-gray-600 dark:text-gray-300 text-lg font-accent mb-4">
            Toodles Funzone Videos
          </div>
          <div className="text-sm text-gray-500">
            Coming soon - exciting moments from our play zone!
          </div>
          <Button 
            onClick={handleNext}
            className="mt-4 bg-toodles-primary hover:bg-red-600 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Next Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}>
      <video
        key={currentVideo.id}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop={false}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onEnded={handleNext}
        style={{ minHeight: '200px' }}
      >
        <source src={currentVideo.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
        {!isPlaying ? (
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4"
            onClick={() => {
              const video = document.querySelector('video');
              if (video) video.play();
            }}
          >
            <Play className="h-8 w-8" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4"
            onClick={() => {
              const video = document.querySelector('video');
              if (video) video.pause();
            }}
          >
            <Pause className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4">
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          onClick={handleNext}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Video info */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
        <div className="text-sm font-accent">Toodles Funzone</div>
        <div className="text-xs opacity-75">Video {currentIndex + 1} of {videoAssets.length}</div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div 
          className="h-full bg-toodles-accent transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / videoAssets.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}