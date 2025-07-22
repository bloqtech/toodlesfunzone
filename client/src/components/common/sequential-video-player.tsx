import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const videoAssets = [
  { id: 1, src: '/api/video/1_1753189659952.mp4' },
  { id: 2, src: '/api/video/2_1753189659952.mp4' },
  { id: 3, src: '/api/video/3_1753189659952.mp4' },
  { id: 4, src: '/api/video/4_1753189659951.mp4' },
  { id: 5, src: '/api/video/5_1753189659951.mp4' },
  { id: 6, src: '/api/video/6_1753189659951.mp4' },
  { id: 7, src: '/api/video/7_1753189659950.mp4' },
  { id: 8, src: '/api/video/8_1753189659950.mp4' },
  { id: 9, src: '/api/video/9_1753189659950.mp4' },
  { id: 10, src: '/api/video/10_1753189659949.mp4' }
];

interface SequentialVideoPlayerProps {
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  playbackSpeed?: number; // seconds per video
}

export function SequentialVideoPlayer({ 
  className = "",
  autoPlay = true,
  muted = true,
  showControls = true,
  playbackSpeed = 10 // 10 seconds per video
}: SequentialVideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videoAssets[currentVideoIndex];

  // Auto-advance to next video
  useEffect(() => {
    if (isPlaying && !hasError) {
      intervalRef.current = setInterval(() => {
        setCurrentVideoIndex((prev) => {
          const nextIndex = (prev + 1) % videoAssets.length;
          trackEvent('video_auto_advance', 'media', `video_${videoAssets[nextIndex].id}`);
          return nextIndex;
        });
      }, playbackSpeed * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, hasError, playbackSpeed]);

  // Reset loading state when video changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [currentVideoIndex]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(console.warn);
    }
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    console.warn('Error loading video:', currentVideo?.src);
    
    // Try next video after error
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoAssets.length);
    }, 2000);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    trackEvent('video_play', 'media', `video_${currentVideo.id}`);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    trackEvent('video_pause', 'media', `video_${currentVideo.id}`);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => {
      const nextIndex = (prev + 1) % videoAssets.length;
      trackEvent('video_manual_advance', 'media', `video_${videoAssets[nextIndex].id}`);
      return nextIndex;
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    trackEvent('video_mute_toggle', 'media', isMuted ? 'unmute' : 'mute');
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  if (!currentVideo) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">Loading videos...</div>
        </div>
      </div>
    );
  }

  if (hasError && isLoading) {
    return (
      <div className={`bg-gradient-to-br from-toodles-pink/20 to-toodles-blue/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎥</div>
          <div className="text-gray-600 dark:text-gray-300">
            Video showcase loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-500 dark:text-gray-400">Loading video...</div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={currentVideo.src}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={isMuted}
        loop={false}
        playsInline
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        style={{ 
          display: isLoading ? 'none' : 'block',
          minHeight: '200px'
        }}
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Video controls */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={handleNextVideo}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={togglePlay}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </Button>
        </div>
      )}
      
      {/* Video information overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
        <div className="text-sm font-accent">This video was shot at Toodles</div>
      </div>
      
      {/* Video progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div 
          className="h-full bg-white/80 transition-all duration-1000 ease-linear"
          style={{
            width: `${((currentVideoIndex + 1) / videoAssets.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}