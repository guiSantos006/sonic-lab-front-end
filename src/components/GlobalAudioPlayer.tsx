"use client";

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Repeat,
  ShoppingBag,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { Kit } from '../types';
import { audioPlayer } from '../utils/audioPlayer';
import Waveform from './Waveform';
import VinylRecord from './VinylRecord';

interface GlobalAudioPlayerProps {
  activeKit: Kit | null;
  isPlaying: boolean;
  onTogglePlay: (kit: Kit) => void;
  onClose: () => void;
  onViewDetails: (kitId: string) => void;
  onAddToCart: (kit: Kit) => void;
  isKitInCart: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function GlobalAudioPlayer({
  activeKit,
  isPlaying,
  onTogglePlay,
  onClose,
  onViewDetails,
  onAddToCart,
  isKitInCart,
}: GlobalAudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const unsubTime = audioPlayer.on('timeupdate', () => {
      setCurrentTime(audioPlayer.getCurrentTime());
      setDuration(audioPlayer.getDuration());
    });

    const unsubVol = audioPlayer.on('volumechange', () => {
      setVolume(audioPlayer.getVolume());
      setIsMuted(audioPlayer.getIsMuted());
    });

    const unsubEnd = audioPlayer.on('ended', () => {
      setCurrentTime(0);
    });

    return () => {
      unsubTime();
      unsubVol();
      unsubEnd();
    };
  }, []);

  if (!activeKit) return null;

  const progress = duration > 0 ? currentTime / duration : 0;
  const waveformPoints = activeKit.audioDemo?.waveformData || [];

  const handleSeek = (percentage: number) => {
    audioPlayer.seekPercent(percentage);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioPlayer.setVolume(val);
    setVolume(val);
  };

  const handleToggleMute = () => {
    audioPlayer.toggleMute();
    setIsMuted(audioPlayer.getIsMuted());
  };

  const handleToggleLoop = () => {
    audioPlayer.toggleLoop();
    setIsLoop(audioPlayer.getIsLoop());
  };

  const handleSkip = (seconds: number) => {
    audioPlayer.skip(seconds);
  };

  return (
    <div
      id="global-audio-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center gap-3 md:gap-6">
        
        {/* Left: Kit metadata & mini vinyl sleeve */}
        <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[260px] md:max-w-[320px] shrink-0">
          <div className="relative w-11 h-11 rounded shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
            <img
              src={activeKit.coverImage}
              alt={activeKit.title}
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
            {/* Spinning mini vinyl dot when playing */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <VinylRecord
                  isPlaying={isPlaying}
                  size="sm"
                  className="scale-[0.35] origin-center"
                  showTonearm={false}
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase px-1 py-0.2 border border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold">
                {activeKit.category.replace('_', ' ')}
              </span>
              <button
                onClick={() => onViewDetails(activeKit.id)}
                className="font-mono text-[9px] text-neutral-400 hover:text-black dark:hover:text-white uppercase flex items-center gap-0.5 hover:underline cursor-pointer"
                title="Ver kit completo"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <h4
              onClick={() => onViewDetails(activeKit.id)}
              className="font-sans text-xs sm:text-sm font-extrabold text-black dark:text-white truncate cursor-pointer hover:underline"
            >
              {activeKit.title}
            </h4>
            <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide truncate">
              {activeKit.creator}
            </p>
          </div>

          {/* Quick Cart / Buy action */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onAddToCart(activeKit)}
              className={`p-2 border text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                isKitInCart
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                  : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:opacity-90'
              }`}
              title={isKitInCart ? 'No carrinho' : `Adicionar por $${activeKit.price}`}
            >
              {isKitInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">No Carrinho</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="font-bold text-[10px]">${activeKit.price}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Waveform */}
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-4 flex-1 w-full min-w-0">
          
          {/* Action transport buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Voltar 10s"
              aria-label="Voltar 10 segundos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onTogglePlay(activeKit)}
              className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 cursor-pointer shadow-sm"
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Avançar 10s"
              aria-label="Avançar 10 segundos"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleLoop}
              className={`p-1.5 transition-colors cursor-pointer ${
                isLoop
                  ? 'text-black dark:text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
              title={isLoop ? 'Loop Ativado' : 'Ativar Loop'}
              aria-label="Alternar Loop"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time display & Interactive Waveform Canvas */}
          <div className="flex items-center gap-2 w-full min-w-0 flex-1">
            <span className="font-mono text-[10px] text-neutral-500 w-9 text-right shrink-0">
              {formatTime(currentTime)}
            </span>

            {/* High-Fidelity Waveform Visualizer */}
            <div className="flex-1 min-w-0 h-9 flex items-center bg-neutral-100/70 dark:bg-neutral-800/60 rounded px-1.5 border border-neutral-200 dark:border-neutral-700/60">
              <Waveform
                data={waveformPoints}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                height={30}
                barWidth={2.5}
                barGap={1.5}
                barRadius={1}
                barsCount={64}
                showTimeHover={true}
                className="w-full"
              />
            </div>

            <span className="font-mono text-[10px] text-neutral-400 w-9 shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Dismiss */}
        <div className="flex items-center gap-2 shrink-0 justify-end w-full md:w-auto">
          {/* Volume control with popover/slider */}
          <div className="relative flex items-center">
            <button
              onClick={handleToggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Compact Volume slider on hover or mobile */}
            <div
              className={`flex items-center transition-all ${
                showVolumeSlider ? 'opacity-100 w-20' : 'opacity-70 w-16 hover:opacity-100'
              }`}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-neutral-300 dark:bg-neutral-700 rounded-none accent-black dark:accent-white cursor-pointer"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>
          </div>

          {/* Close / Dismiss player */}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-1"
            title="Fechar reprodutor"
            aria-label="Fechar reprodutor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
