import React from "react";

interface YouTubePlayerProps {
  videoUrl: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
  // Extract video ID from URL
  const videoIdMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) return <div>Invalid YouTube URL</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=0&fs=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      ></iframe>
    </div>
  );
};
