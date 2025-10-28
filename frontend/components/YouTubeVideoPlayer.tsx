import React, { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    ReactNativeWebView?: { postMessage: (msg: string) => void }
  }
}

interface YouTubePlayerProps {
  videoUrl: string
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const videoIdMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  )
  const videoId = videoIdMatch ? videoIdMatch[1] : null

  const isInWebView = () => typeof window !== "undefined" && !!window.ReactNativeWebView
  const postToWebView = (type: string, payload?: any) => {
    try {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ source: "YouTubePlayer", type, payload })
      )
    } catch (e) {
      // no-op
    }
  }

  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        createPlayer()
      } else {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        document.body.appendChild(tag)
        window.onYouTubeIframeAPIReady = createPlayer
      }
    }

    const createPlayer = () => {
      playerRef.current = new window.YT.Player(`youtube-${videoId}`, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0, // disable YouTube native fullscreen button; we control it
          iv_load_policy: 3,
          showinfo: 0,
          disablekb: 1,
        },
        events: {
          onStateChange: (e: any) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    initPlayer()

    // Sync with browser Fullscreen API
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement
      setIsFullscreen(isFs)
      if (isInWebView()) {
        postToWebView("FULLSCREEN_CHANGE", { fullscreen: isFs })
      }
    }
    document.addEventListener("fullscreenchange", onFsChange)

    // Listen to messages from React Native WebView (optional protocol)
    const onMessage = (event: MessageEvent) => {
      const data = (() => {
        try {
          return typeof event.data === "string" ? JSON.parse(event.data) : event.data
        } catch {
          return null
        }
      })()
      if (!data || data?.source === "YouTubePlayer") return
      if (data?.type === "SET_FULLSCREEN") {
        const desired = !!data.payload?.fullscreen
        setIsFullscreen(desired)
      }
      if (data?.type === "PLAYER_COMMAND") {
        if (data.payload?.command === "play") playerRef.current?.playVideo?.()
        if (data.payload?.command === "pause") playerRef.current?.pauseVideo?.()
      }
    }
    window.addEventListener("message", onMessage)

    return () => {
      playerRef.current?.destroy()
      document.removeEventListener("fullscreenchange", onFsChange)
      window.removeEventListener("message", onMessage)
    }
  }, [videoId])

  const toggleFullscreen = async () => {
    const newState = !isFullscreen

    if (isInWebView()) {
      // In Expo WebView: simulate fullscreen by CSS and notify parent app
      setIsFullscreen(newState)
      postToWebView("TOGGLE_FULLSCREEN", { fullscreen: newState })
      return
    }

    // In browsers: use the Fullscreen API
    try {
      if (newState) {
        await containerRef.current?.requestFullscreen?.()
      } else if (document.fullscreenElement) {
        await document.exitFullscreen?.()
      }
    } catch {
      // Fallback: just toggle CSS if API fails
      setIsFullscreen(newState)
    }
  }

  if (!videoId)
    return <div className="text-red-600 p-4">Invalid YouTube URL</div>

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full aspect-video"
      }`}
    >
      {/* YouTube iframe */}
      <div
        id={`youtube-${videoId}`}
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-3 z-10">
        {/* Play/Pause */}
        <button
          onClick={() =>
            isPlaying
              ? playerRef.current?.pauseVideo()
              : playerRef.current?.playVideo()
          }
          className="bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition"
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? "🡽" : "⛶"}
        </button>
      </div>

      {/* Hide overlays visually */}
      <style jsx>{`
        iframe {
          pointer-events: auto;
          border: none;
        }

        /* Hide YouTube overlays */
        .ytp-chrome-top,
        .ytp-show-cards-title,
        .ytp-pause-overlay,
        .ytp-gradient-top,
        .ytp-watermark,
        .ytp-title-text,
        .ytp-endscreen-content,
        .ytp-share-button,
        .ytp-watch-later-button {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Prevent “More Videos” overlay */
        .ytp-endscreen-content,
        .ytp-ce-element,
        .ytp-ce-covering-overlay {
          display: none !important;
        }

        /* Prevent video from overflowing the container */
        iframe,
        .html5-video-player {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
      `}</style>
    </div>
  )
}

export default YouTubePlayer
