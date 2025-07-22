import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

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

interface RandomVideoPlayerProps {
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export function RandomVideoPlayer({ 
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false
}: RandomVideoPlayerProps) {
  const [currentVideo, setCurrentVideo] = useState<typeof videoAssets[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Select a random video on component mount
    const randomIndex = Math.floor(Math.random() * videoAssets.length);
    const selectedVideo = videoAssets[randomIndex];
    setCurrentVideo(selectedVideo);
    
    // Track video selection
    trackEvent('video_displayed', 'media', `video_${selectedVideo.id}`);
  }, []);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    console.warn('Error loading video:', currentVideo?.src);
  };

  const handleVideoPlay = () => {
    if (currentVideo) {
      trackEvent('video_play', 'media', `video_${currentVideo.id}`);
    }
  };

  const handleVideoPause = () => {
    if (currentVideo) {
      trackEvent('video_pause', 'media', `video_${currentVideo.id}`);
    }
  };

  if (!currentVideo) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">Loading video...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-toodles-pink/20 to-toodles-blue/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎥</div>
          <div className="text-gray-600 dark:text-gray-300">
            Video showcase coming soon!
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
        src={currentVideo.src}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
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
      
      {/* Optional video overlay */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Toodles Funzone
      </div>
    </div>
  );
}

// Hook for getting a random video asset
export function useRandomVideo() {
  const [video, setVideo] = useState<typeof videoAssets[0] | null>(null);
  
  const selectRandomVideo = () => {
    const randomIndex = Math.floor(Math.random() * videoAssets.length);
    const selectedVideo = videoAssets[randomIndex];
    setVideo(selectedVideo);
    trackEvent('video_changed', 'media', `video_${selectedVideo.id}`);
    return selectedVideo;
  };

  useEffect(() => {
    selectRandomVideo();
  }, []);

  return { video, selectRandomVideo, videoCount: videoAssets.length };
}