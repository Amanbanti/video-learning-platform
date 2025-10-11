import React, { useState, useRef, useEffect } from "react";

// Extend the Window interface to include the YT property
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoUrl: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7); // Start with 70% volume
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Extract video ID
  const videoIdMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  // Close volume when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Create player once API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          // REMOVED: mute: 1 - This was muting the audio
          loop: 1,
          controls: 0, // This hides all YouTube controls
          rel: 0,
          modestbranding: 1,
          playlist: videoId, // For loop to work
          playsinline: 1,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    // If API is already loaded, create player immediately
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          // REMOVED: mute: 1 - This was muting the audio
          loop: 1,
          controls: 0, // This hides all YouTube controls
          rel: 0,
          modestbranding: 1,
          playlist: videoId,
          playsinline: 1,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
    // Set initial volume when player is ready
    event.target.setVolume(volume * 100);
    startProgressTimer();
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    
    switch (state) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        startProgressTimer();
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        setCurrentTime(0);
        break;
      default:
        break;
    }
  };

  const startProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        // Update duration in case it wasn't available initially
        if (duration === 0) {
          const newDuration = playerRef.current.getDuration();
          if (newDuration > 0) {
            setDuration(newDuration);
          }
        }
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume * 100);
      
      // If volume was 0 and now increasing, unmute the video
      if (newVolume > 0 && playerRef.current.isMuted && playerRef.current.isMuted()) {
        playerRef.current.unMute();
      }
    }
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    
    if (volume === 0) {
      // Unmute - set volume to 50%
      const newVolume = 0.5;
      setVolume(newVolume);
      playerRef.current.setVolume(newVolume * 100);
      playerRef.current.unMute();
    } else {
      // Mute - set volume to 0
      setVolume(0);
      playerRef.current.setVolume(0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!videoId) return <div>Invalid YouTube URL</div>;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden relative">
      {/* YouTube Player Container - Using your exact structure */}
      <div
        className="absolute top-0 left-0 w-[300%] h-full -ml-[100%] pointer-events-none"
        style={{ transformOrigin: "top left" }}
      >
        {/* This div will contain the YouTube player created by the API */}
        <div id="youtube-player" className="w-full h-full"></div>
      </div>

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-200 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Time Display */}
              <div className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Volume Control */}
              <div ref={volumeRef} className="relative">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors p-1"
                >
                  {volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 9H6c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1.29l3.66 3.66c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 5.05a.996.996 0 00-1.41 0zm13.46 3.72c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41 1.13 1.13 1.04 3.03-.14 4.21-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 1.61-1.61 1.73-4.01.14-5.63zm-2.82-2.82c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41 2.73 2.73 2.73 7.17 0 9.9-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 3.39-3.39 3.39-8.91 0-12.3z"/>
                    </svg>
                  ) : volume > 0.5 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                    </svg>
                  )}
                </button>

                {/* Volume Slider - Now stays open until clicked outside */}
                {showVolume && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 rounded-lg p-3 shadow-lg z-50">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="h-24 w-6 bg-gray-600 rounded-full appearance-none [writing-mode:bt-lr] [-webkit-appearance:slider-vertical] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};