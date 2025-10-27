'use client'
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

// Bridge for RN WebView messages
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

interface YouTubePlayerProps {
  videoUrl: string;
  fullScreen?: boolean; // when true, wrapper fills container
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl, fullScreen = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitCover, setFitCover] = useState(false); // false = contain(16:9 letterbox), true = cover (zoom)

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Orientation helpers
  const postToRN = (payload: any) => {
    try { window.ReactNativeWebView?.postMessage(JSON.stringify(payload)); } catch {}
  };
  const lockLandscape = async () => {
    postToRN({ type: "ORIENTATION_LOCK", orientation: "LANDSCAPE" });
    try { if ((screen as any).orientation?.lock) await (screen as any).orientation.lock("landscape"); } catch {}
  };
  const lockPortrait = async () => {
    postToRN({ type: "ORIENTATION_LOCK", orientation: "PORTRAIT" });
    try { if ((screen as any).orientation?.lock) await (screen as any).orientation.lock("portrait"); } catch {}
  };

  // Close volume when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fullscreen handling + orientation sync
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) await containerRef.current.requestFullscreen();
        else if ((containerRef.current as any).webkitRequestFullscreen) (containerRef.current as any).webkitRequestFullscreen();
        else if ((containerRef.current as any).msRequestFullscreen) (containerRef.current as any).msRequestFullscreen();
        await lockLandscape();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
        await lockPortrait();
      }
    } catch {}
  };

  useEffect(() => {
    const onChange = async () => {
      const now = !!document.fullscreenElement;
      setIsFullscreen(now);
      try { if (now) await lockLandscape(); else await lockPortrait(); } catch {}
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange as any);
    document.addEventListener("msfullscreenchange", onChange as any);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange as any);
      document.removeEventListener("msfullscreenchange", onChange as any);
    };
  }, []);

  // Player callbacks
  const onProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds || 0);
  };
  const onDurationCb = (d: number) => setDuration(d || 0);

  const togglePlay = () => setIsPlaying((p) => !p);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const newTime = percent * duration;
    playerRef.current.seekTo(newTime, "seconds");
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => setVolume((v) => (v === 0 ? 0.5 : 0));

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!videoUrl) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const wrapperClass = fullScreen
    ? "w-full h-full mx-auto rounded-none overflow-hidden relative"
    : "w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden relative";

  // Build react-player config and cast to any to satisfy TS across versions
  const playerConfig: any = {
    youtube: {
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
        disablekb: 1,
      },
    },
    file: {
      attributes: {
        controlsList: "nodownload noplaybackrate",
        crossOrigin: "anonymous",
      },
    },
  };

  return (
    <div ref={containerRef} className={wrapperClass}>
      {/* Underlying player – disable native controls & intercepts; our overlay handles interactions */}
      <div className="absolute inset-0">
        <div className={fitCover ? "h-full w-[300%] -ml-[100%]" : "h-full w-full"} style={{ pointerEvents: "none" }}>
          {(() => {
            const AnyPlayer: any = ReactPlayer as any;
            return (
              <AnyPlayer
                ref={playerRef as any}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                volume={volume}
                muted={volume === 0}
                controls={false}
                playsinline
                config={playerConfig}
                onProgress={onProgress as any}
                onDuration={onDurationCb}
              />
            );
          })()}
        </div>
      </div>

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
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
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors p-1">
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <div className="text-white text-sm font-medium">{formatTime(currentTime)} / {formatTime(duration)}</div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Fit/Cover toggle */}
              <button
                onClick={() => setFitCover((v) => !v)}
                className="text-white hover:text-gray-300 transition-colors p-1"
                title={fitCover ? "Fit to screen (contain)" : "Fill screen (cover)"}
              >
                {fitCover ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="6" width="16" height="12" rx="2"/></svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12" rx="2"/></svg>
                )}
              </button>

              {/* Volume */}
              <div ref={volumeRef} className="relative">
                <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors p-1">
                  {volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 9H6c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1.29l3.66 3.66c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 5.05a.996.996 0 00-1.41 0zm13.46 3.72c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41 1.13 1.13 1.04 3.03-.14 4.21-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 1.61-1.61 1.73-4.01.14-5.63zm-2.82-2.82c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41 2.73 2.73 2.73 7.17 0 9.9-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 3.39-3.39 3.39-8.91 0-12.3z"/></svg>
                  ) : volume > 0.5 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                  )}
                </button>
                {showVolume && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-lg p-3 shadow-lg z-50">
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="h-24 w-6 bg-gray-600 rounded-full appearance-none [writing-mode:bt-lr] [-webkit-appearance:slider-vertical] cursor-pointer" />
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors p-1">
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};