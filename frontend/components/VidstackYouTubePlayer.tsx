"use client";

import React, { useEffect, useRef } from "react";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import * as vidstackIcons from "@vidstack/react/icons";

import {
  FullscreenButton,
  Gesture,
  GoogleCastButton,
  isHLSProvider,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPauseEvent,
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
  type MediaTimeUpdateEvent,
  Menu,
  MuteButton,
  PIPButton,
  PlayButton,
  Poster,
  Time,
  TimeSlider,
  Track,
  useMediaState,
  useMediaStore,
  useVideoQualityOptions,
  VolumeSlider,
} from "@vidstack/react";

import {
  ChromecastIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PictureInPictureExitIcon,
  PictureInPictureIcon,
  PlayIcon,
  SettingsIcon,
  VolumeHighIcon,
  VolumeLowIcon,
} from "@vidstack/react/icons";

type TrackDef = {
  src: string;
  kind?: "subtitles" | "captions" | "chapters" | "descriptions" | "metadata";
  srclang?: string;
  label?: string;
  default?: boolean;
};

export interface DefaultPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  thumbnails?: string;
  tracks?: TrackDef[];
  className?: string;
  customUI?: boolean;
}

export default function DefaultPlayer(props: DefaultPlayerProps): JSX.Element {
  const {
    src,
    title = "Video",
    poster,
    thumbnails,
    tracks = [],
    className = "w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden",
    customUI = false,
  } = props;

  const playerRef = useRef<MediaPlayerInstance | null>(null);

  const normalizedSrc = React.useMemo(() => {
    if (!src) return src;
    if (src.startsWith("youtube/")) return src;
    const ytMatch = src.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{6,})/);
    if (ytMatch?.[1]) return `youtube/${ytMatch[1]}`;
    return src;
  }, [src]);

  // ✅ Automatically rotate to landscape when entering fullscreen
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen = document.fullscreenElement !== null;
      try {
        if (isFullscreen) {
          await (screen.orientation as any).lock("landscape");
        } else {
          await screen.orientation.unlock();
        }
      } catch (e) {
        console.warn("Screen orientation lock/unlock not supported:", e);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className={className}>
      <MediaPlayer
        ref={playerRef}
        src={normalizedSrc}
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        crossOrigin
        playsInline
        title={title}
        poster={poster}
      >
        <MediaProvider />
        {poster ? <Poster className="vds-poster" alt={""} /> : null}
        {tracks.map((t) => (
          <Track
            key={t.src}
            src={t.src}
            kind={t.kind ?? "subtitles"}
            lang={t.srclang}
            label={t.label}
            default={t.default}
          />
        ))}

        {customUI ? (
          <div className="absolute inset-x-0 bottom-0 flex w-full flex-col gap-2 bg-black/50 px-4 py-3 text-white">
            <TimeSlider.Root className="group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none items-center outline-none select-none aria-hidden:hidden">
              <TimeSlider.Track className="relative z-0 h-[5px] w-full rounded-sm bg-white/30 ring-sky-400 group-data-[focus]:ring-[3px]">
                <TimeSlider.TrackFill className="bg-primary absolute z-20 h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]" />
              </TimeSlider.Track>
              <TimeSlider.Thumb className="absolute top-1/2 left-[var(--slider-fill)] z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-[active]:opacity-100 group-data-[dragging]:ring-4" />
            </TimeSlider.Root>

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <PlayButton className="group ring-primary/10 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                  <PlayIcon className="hidden h-8 w-8 group-data-[paused]:block" />
                  <PauseIcon className="h-8 w-8 group-data-[paused]:hidden" />
                </PlayButton>
                <div className="flex w-[150px] items-center">
                  <MuteButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                    <MuteIcon className="hidden h-8 w-8 group-data-[state='muted']:block" />
                    <VolumeLowIcon className="hidden h-8 w-8 group-data-[state='low']:block" />
                    <VolumeHighIcon className="hidden h-8 w-8 group-data-[state='high']:block" />
                  </MuteButton>
                  <VolumeSlider.Root className="group relative mx-[7.5px] inline-flex h-10 w-full max-w-[100px] cursor-pointer touch-none items-center outline-none select-none aria-hidden:hidden">
                    <VolumeSlider.Track className="relative z-0 h-[5px] w-full rounded-sm bg-white/30 ring-sky-400 group-data-[focus]:ring-[3px]">
                      <VolumeSlider.TrackFill className="bg-primary absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                    </VolumeSlider.Track>
                    <VolumeSlider.Thumb className="absolute top-1/2 left-[var(--slider-fill)] z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-[active]:opacity-100 group-data-[dragging]:ring-4" />
                  </VolumeSlider.Root>
                </div>
                <Time className="text-sm" type="current" /> /
                <Time className="text-sm" type="duration" />
              </div>

              <div className="flex items-center gap-3">
                <Menu.Root>
                  <Menu.Button
                    className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4"
                    aria-label="Settings"
                  >
                    <SettingsIcon className="h-8 w-8 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90" />
                  </Menu.Button>
                  <Menu.Items
                    className="animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex h-[var(--menu-height)] max-h-[400px] min-w-[260px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-[15px] font-medium backdrop-blur-sm transition-[height] duration-300 will-change-[height] outline-none data-[resizing]:overflow-hidden"
                    placement="top"
                    offset={0}
                  ></Menu.Items>
                </Menu.Root>

                <PIPButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4">
                  <PictureInPictureIcon className="h-8 w-8 group-data-[active]:hidden" />
                  <PictureInPictureExitIcon className="hidden h-8 w-8 group-data-[active]:block" />
                </PIPButton>

                <GoogleCastButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                  <ChromecastIcon className="h-8 w-8" />
                </GoogleCastButton>

                <FullscreenButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4">
                  <FullscreenIcon className="h-8 w-8 group-data-[active]:hidden" />
                  <FullscreenExitIcon className="hidden h-8 w-8 group-data-[active]:block" />
                </FullscreenButton>
              </div>
            </div>
          </div>
        ) : (
          // ✅ Default production-ready layout with icons
          <DefaultVideoLayout
          thumbnails={thumbnails}
          noScrubGesture={false}
          icons={defaultLayoutIcons}
        />
        )}
      </MediaPlayer>
    </div>
  );
}
