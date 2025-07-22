import { useState, useEffect } from 'react';
import { RandomVideoPlayer } from './random-video-player';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface VideoShowcaseProps {
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  rotateInterval?: number; // in milliseconds
}

export function VideoShowcase({ 
  className = "",
  showControls = true,
  autoRotate = false,
  rotateInterval = 30000 // 30 seconds
}: VideoShowcaseProps) {
  const [videoKey, setVideoKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (autoRotate) {
      const interval = setInterval(() => {
        setVideoKey(prev => prev + 1);
        trackEvent('video_auto_rotate', 'media', 'auto_change');
      }, rotateInterval);

      return () => clearInterval(interval);
    }
  }, [autoRotate, rotateInterval]);

  const handleNextVideo = () => {
    setVideoKey(prev => prev + 1);
    trackEvent('video_manual_rotate', 'media', 'manual_change');
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    trackEvent('video_mute_toggle', 'media', isMuted ? 'unmute' : 'mute');
  };

  return (
    <div className={`relative ${className}`}>
      <RandomVideoPlayer 
        key={videoKey}
        className="w-full h-full"
        autoPlay={true}
        muted={isMuted}
        loop={true}
        controls={false}
      />
      
      {showControls && (
        <div className="absolute top-4 right-4 space-x-2">
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
        </div>
      )}
      
      {/* Video information overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
        <div className="text-sm font-accent">Toodles Funzone</div>
        <div className="text-xs opacity-75">Fun moments captured</div>
      </div>
    </div>
  );
}