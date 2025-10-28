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
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const videoIdMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  // Click outside to close volume
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load YouTube API & initialize player
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const createPlayer = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playlist: videoId,
          playsinline: 1,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          // HIDE SHARE BUTTON & YOUTUBE LOGO
          origin: window.location.origin,
          widget_referrer: window.location.href,
        },
      });
    };

    window.onYouTubeIframeAPIReady = createPlayer;
    if (window.YT && window.YT.Player) createPlayer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
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
    }
  };

  const startProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        if (duration === 0) {
          const newDuration = playerRef.current.getDuration();
          if (newDuration > 0) setDuration(newDuration);
        }
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
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
    playerRef.current?.setVolume(newVolume * 100);
    if (newVolume > 0 && playerRef.current?.isMuted?.()) playerRef.current.unMute();
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (volume === 0) {
      const newVolume = 0.5;
      setVolume(newVolume);
      playerRef.current.setVolume(newVolume * 100);
      playerRef.current.unMute();
    } else {
      setVolume(0);
      playerRef.current.setVolume(0);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) await containerRef.current.requestFullscreen();
        else if ((containerRef.current as any).webkitRequestFullscreen) await (containerRef.current as any).webkitRequestFullscreen();
        else if ((containerRef.current as any).msRequestFullscreen) await (containerRef.current as any).msRequestFullscreen();
        if ((screen.orientation as any)?.lock) await (screen.orientation as any).lock("landscape");
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
        screen.orientation?.unlock?.();
      }
    } catch (error) {
      console.warn("Fullscreen or orientation lock failed:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!videoId) return <div>Invalid YouTube URL</div>;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden relative bg-black">
      {/* YouTube Player */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          id="youtube-player"
          className="w-full h-full object-contain"
          style={{
            pointerEvents: "none",
            // CSS hack to hide YouTube branding & top bar
            filter: "brightness(1) saturate(1)",
          }}
        ></div>
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-200 relative"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors p-1">
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div ref={volumeRef} className="relative">
                <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors p-1">
                  {volume === 0 ? "🔇" : "🔊"}
                </button>
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

              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors p-1">
                {isFullscreen ? "⤫" : "⤢"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
