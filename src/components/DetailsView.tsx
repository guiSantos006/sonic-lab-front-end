import { Kit } from '../types';
import { Play, Pause, ShoppingCart, CreditCard, ChevronLeft, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import VinylRecord from './VinylRecord';
import Waveform from './Waveform';
import { audioPlayer } from '../utils/audioPlayer';

interface DetailsViewProps {
  kit: Kit;
  onBack: () => void;
  onAddToCart: (kit: Kit) => void;
  onBuyNow: (kit: Kit) => void;
  isInCart: boolean;
}

export default function DetailsView({
  kit,
  onBack,
  onAddToCart,
  onBuyNow,
  isInCart
}: DetailsViewProps) {
  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(kit.audioDemo?.durationInSeconds || 30);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if this kit is currently playing in global player
    if (audioPlayer.getPlayingKitId() === kit.id) {
      setIsPlaying(audioPlayer.isPlayingNow());
      setCurrentTime(audioPlayer.getCurrentTime());
      setDuration(audioPlayer.getDuration());
    }

    const unsubPlay = audioPlayer.on('play', () => {
      if (audioPlayer.getPlayingKitId() === kit.id) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    });

    const unsubPause = audioPlayer.on('pause', () => {
      if (audioPlayer.getPlayingKitId() === kit.id) {
        setIsPlaying(false);
      }
    });

    const unsubStop = audioPlayer.on('stop', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    const unsubTime = audioPlayer.on('timeupdate', () => {
      if (audioPlayer.getPlayingKitId() === kit.id) {
        setCurrentTime(audioPlayer.getCurrentTime());
        setDuration(audioPlayer.getDuration());
      }
    });

    const unsubEnd = audioPlayer.on('ended', () => {
      if (audioPlayer.getPlayingKitId() === kit.id) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    return () => {
      unsubPlay();
      unsubPause();
      unsubStop();
      unsubTime();
      unsubEnd();
    };
  }, [kit.id]);

  const handlePlayToggle = () => {
    if (isPlaying && audioPlayer.getPlayingKitId() === kit.id) {
      audioPlayer.pause();
    } else {
      audioPlayer.playKit(kit);
    }
  };

  const handleSeek = (percentage: number) => {
    if (audioPlayer.getPlayingKitId() !== kit.id) {
      audioPlayer.playKit(kit).then(() => {
        audioPlayer.seekPercent(percentage);
      });
    } else {
      audioPlayer.seekPercent(percentage);
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Resolve contents strictly according to the specific sound kit's own data
  const resolveKitContents = (): Record<string, number | string> => {
    // 1. Direct kit.contents if defined
    if (kit.contents && Object.keys(kit.contents).length > 0) {
      return kit.contents;
    }
    // 2. Parse from specifications.contentsJson if available
    if (kit.specifications?.contentsJson) {
      try {
        const parsed = JSON.parse(kit.specifications.contentsJson);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    // 3. Category-specific breakdown matching this sound kit
    const total = kit.fileCount || 100;
    switch (kit.category) {
      case 'preset_bank':
        return {
          'Main Presets (.fxp)': Math.round(total * 0.55),
          'Lead & Pluck Presets': Math.round(total * 0.25),
          'Dystopian / Sub Basses': Math.round(total * 0.15),
          'Custom Wavetables': Math.max(5, Math.round(total * 0.05)),
        };
      case 'midi_kit':
        return {
          'Melody Progressions': Math.round(total * 0.4),
          'Chord Progressions': Math.round(total * 0.35),
          'Bassline MIDIs': Math.round(total * 0.15),
          'Hi-Hat & Drum MIDIs': Math.round(total * 0.1),
        };
      case 'sample_pack':
        return {
          'Melody Loops & Stems': Math.round(total * 0.35),
          'Drum & Percussion Loops': Math.round(total * 0.3),
          'One-Shots & Chops': Math.round(total * 0.2),
          'Ambient Textures & FX': Math.round(total * 0.15),
        };
      case 'drum_kit':
      default:
        return {
          'Kicks': Math.round(total * 0.25),
          'Snares / Claps': Math.round(total * 0.22),
          'Hi-Hats': Math.round(total * 0.28),
          'Percussion & Metallic Loops': Math.round(total * 0.15),
          'Sub 808s': Math.max(5, Math.round(total * 0.1)),
        };
    }
  };

  const contents = resolveKitContents();

  // Format mm:ss
  const formatClock = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 animate-fade-in flex flex-col gap-6">
      
      {/* Back button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs text-neutral-500 hover:text-black dark:hover:text-white hover:underline cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to list
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12">
        {/* LEFT: Cover and interactive 3-state vinyl turntable sleeve */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div
            className="w-full aspect-square bg-neutral-950 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group select-none cursor-pointer rounded-none md:rounded-xs shadow-2xl transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handlePlayToggle}
            title={isPlaying ? 'Pausar reprodução' : 'Clique para reproduzir prévia'}
          >
            {/* 1. Base Album Artwork Cover (Visible alone on initial state; blurs to background on play) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-950">
              <img
                src={kit.coverImage}
                alt={kit.title}
                className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isPlaying
                    ? 'filter blur-md scale-105 brightness-[0.42] contrast-125'
                    : isHovered
                    ? 'filter blur-0 scale-[1.02] brightness-95'
                    : 'filter blur-0 scale-100 brightness-100'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Dark subtle overlay when playing */}
              <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-700 pointer-events-none ${
                  isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Album sleeve gloss highlight sheen */}
              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </div>

            {/* 2. Vinyl Disc Sliding Container (3-State Choreography) */}
            {/*
              State 1 (Idle): translate-y-[115%] (completely out of view at bottom, only cover image visible)
              State 2 (Hover): translate-y-[50%] (top half of disc smoothly emerges from bottom)
              State 3 (Playing): translate-y-0 (full disc centered, adjusts size, spins smoothly)
            */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${
                isPlaying
                  ? 'translate-y-0'
                  : isHovered
                  ? 'translate-y-[50%]'
                  : 'translate-y-[115%]'
              }`}
            >
              <div
                className={`w-[78%] sm:w-[80%] md:w-[82%] max-w-[420px] aspect-square transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
                  isPlaying
                    ? 'scale-100 opacity-100 drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]'
                    : isHovered
                    ? 'scale-[0.98] opacity-100 drop-shadow-[0_-12px_28px_rgba(0,0,0,0.7)]'
                    : 'scale-90 opacity-0'
                }`}
              >
                <VinylRecord
                  size="full"
                  isPlaying={isPlaying}
                  title={kit.title}
                  coverImage={kit.coverImage}
                  showTonearm={false}
                />
              </div>
            </div>

            {/* 3. Status Badge in Top-Left */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 font-mono text-[9px] sm:text-[10px] uppercase font-bold text-neutral-300 bg-black/80 px-2.5 py-1 border border-white/15 backdrop-blur-md shadow-md">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isPlaying
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                    : isHovered
                    ? 'bg-amber-400'
                    : 'bg-neutral-500'
                }`}
              />
              <span>
                {isPlaying
                  ? '33 RPM PLAYING'
                  : isHovered
                  ? 'CLIQUE PARA OUVIR'
                  : 'SOUND KIT'}
              </span>
            </div>

            {/* 4. Center Play/Pause Overlay Cue */}
            <div
              className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                isHovered || isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* When hovered and not playing: show floating pill */}
              {!isPlaying && isHovered && (
                <div className="bg-black/85 text-white backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 font-mono text-xs uppercase tracking-wider transform -translate-y-8 animate-fade-in">
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Ouvir Prévia</span>
                </div>
              )}

              {/* When playing: show pause button on hover */}
              {isPlaying && isHovered && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center animate-fade-in">
                  <Pause className="w-6 h-6 fill-current" />
                </div>
              )}
            </div>
          </div>

          {/* Specs Metas */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.sampleRate || 'WAV 24-BIT'}
            </span>
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.royaltyFree ? 'ROYALTY FREE' : 'PERSONAL LICENSE'}
            </span>
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.fileSize || '980 MB'}
            </span>
            {kit.bpm && (
              <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
                {kit.bpm} BPM
              </span>
            )}
            {kit.key && (
              <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
                KEY: {kit.key}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Meta info headers, Simulated player and actions */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-start gap-6 sm:gap-8 lg:pl-6 lg:border-l lg:border-neutral-200 dark:lg:border-neutral-800">
          
          {/* Header titles */}
          <div>
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-2">
              BY {kit.creator}
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tighter leading-tight mb-3 sm:mb-4 uppercase">
              {kit.title}
            </h1>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-black dark:text-white bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3.5 sm:px-4 py-1.5 sm:py-2 inline-block">
              ${kit.price.toFixed(2)}
            </div>
          </div>

          {/* Audio Player with Interactive Waveform */}
          <div className="border border-black dark:border-neutral-700 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 bg-white dark:bg-neutral-900/90 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-black dark:text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Demo Preview
              </span>
              <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 font-medium tabular-nums" id="time-display">
                {formatClock(currentTime)} / {formatClock(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handlePlayToggle}
                className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 flex items-center justify-center transition-opacity focus:outline-none cursor-pointer rounded-none shadow-sm"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                id="play-btn"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-current translate-x-0.5" />
                )}
              </button>

              {/* High-Fidelity Waveform Visualizer */}
              <div
                className="relative w-full h-11 sm:h-12 bg-neutral-100 dark:bg-neutral-800/80 cursor-pointer overflow-hidden border border-neutral-200 dark:border-neutral-700 flex items-center px-1.5 sm:px-2 py-1"
                id="waveform-container"
              >
                <Waveform
                  data={kit.audioDemo?.waveformData}
                  progress={progress}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onSeek={handleSeek}
                  height={36}
                  barWidth={2.5}
                  barGap={1.5}
                  barRadius={1.5}
                  barsCount={56}
                  showTimeHover={true}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Detailed Content Accordeon Layout (Wireframe table list) */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h2 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Contents Breakdown
              </h2>
              {kit.fileCount && (
                <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">
                  {kit.fileCount} Total Files
                </span>
              )}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-6 font-sans text-xs">
              {Object.entries(contents).map(([key, val]) => (
                <li
                  key={key}
                  className="flex justify-between items-end border-b border-neutral-100 dark:border-neutral-800/80 pb-1"
                >
                  <span className="text-neutral-500 dark:text-neutral-400 font-sans">{key}</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{val}</span>
                </li>
              ))}
            </ul>
            <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-4">
              {kit.description || 'A beautifully designed electronic catalog essential package. Contains pristine modular sounds optimized with sufficient width and volume ranges for instant drop-in integration.'}
            </p>
          </div>

          {/* Action Button Triggers */}
          <div className="flex flex-col gap-3 mt-auto pt-4">
            <button
              onClick={() => onAddToCart(kit)}
              className={`w-full py-3.5 px-6 font-sans text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer border ${
                isInCart
                  ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 border-black dark:border-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCart ? 'In Shopping Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={() => onBuyNow(kit)}
              className="w-full border border-black dark:border-white/30 text-black dark:text-white bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-white/10 py-3.5 px-6 font-sans text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Buy Now (Express)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
