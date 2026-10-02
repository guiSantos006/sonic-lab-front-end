import { Kit } from '../types';
import { Play, Pause, ShoppingCart, CreditCard, ChevronLeft, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import VinylRecord from './VinylRecord';
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
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState('0:00 / 1:45');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      audioPlayer.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Contents default fallback
  const contents = kit.contents || {
    'Snares / Claps': 45,
    'Kicks': 50,
    'Hi-Hats': 60,
    'Percussion loops': 30,
    'Bass One-Shots': 25,
    'Atmospheres': 15
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1.25;
          if (next >= 100) {
            setIsPlaying(false);
            audioPlayer.stop();
            clearInterval(timerRef.current);
            return 0;
          }
          // Format visual clock
          const elapsedSecs = Math.floor((next / 100) * 105);
          const minutes = Math.floor(elapsedSecs / 60);
          const seconds = elapsedSecs % 60;
          setTime(`${minutes}:${seconds.toString().padStart(2, '0')} / 1:45`);
          return next;
        });
      }, 150);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioPlayer.play(kit.id, kit.bpm || 120, kit.category, () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = (clickX / rect.width) * 100;
    setProgress(clickPercent);

    const elapsedSecs = Math.floor((clickPercent / 100) * 105);
    const minutes = Math.floor(elapsedSecs / 60);
    const seconds = elapsedSecs % 60;
    setTime(`${minutes}:${seconds.toString().padStart(2, '0')} / 1:45`);

    if (!isPlaying) {
      handlePlayToggle();
    }
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
        {/* LEFT: Cover and minimalist vinyl turntable */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 dark:to-white/[0.02]" />

            {/* Minimalist Vinyl Record Turntable */}
            <div
              className={`relative z-10 transition-all duration-700 ease-out flex items-center justify-center ${
                isPlaying
                  ? 'scale-105'
                  : 'scale-95 group-hover:scale-100 opacity-90 group-hover:opacity-100'
              }`}
            >
              <VinylRecord
                size="lg"
                isPlaying={isPlaying}
                title={kit.title}
                coverImage={kit.coverImage}
                showTonearm={true}
                onTogglePlay={handlePlayToggle}
              />
            </div>

            {/* Minimalist status badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 bg-white/70 dark:bg-black/60 px-2.5 py-1 border border-neutral-200 dark:border-white/10 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
              {isPlaying ? '33 RPM PLAYING' : 'VINYL READY'}
            </div>
          </div>

          {/* Specs Metas */}
          <div className="flex flex-wrap gap-2">
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.sampleRate || 'WAV 24-BIT'}
            </span>
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.royaltyFree ? 'ROYALTY FREE' : 'PERSONAL LICENSE'}
            </span>
            <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
              {kit.fileSize || '980 MB'}
            </span>
            {kit.bpm && (
              <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
                {kit.bpm} BPM
              </span>
            )}
            {kit.key && (
              <span className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-bold tracking-wider">
                KEY: {kit.key}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Meta info headers, Simulated player and actions */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-start gap-8 lg:pl-6 lg:border-l lg:border-neutral-200 dark:lg:border-neutral-800">
          
          {/* Header titles */}
          <div>
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-2">
              BY {kit.creator}
            </span>
            <h1 className="font-sans text-3xl md:text-4xl font-extrabold text-primary tracking-tighter leading-none mb-4 uppercase">
              {kit.title}
            </h1>
            <div className="font-mono text-2xl font-extrabold text-black dark:text-white bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-4 py-2 inline-block">
              ${kit.price.toFixed(2)}
            </div>
          </div>

          {/* Audio Player */}
          <div className="border border-black dark:border-neutral-700 p-5 flex flex-col gap-4 bg-white dark:bg-neutral-900/90 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-black dark:text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Demo Preview
              </span>
              <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 font-medium" id="time-display">
                {time}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayToggle}
                className="w-12 h-12 flex-shrink-0 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 flex items-center justify-center transition-opacity focus:outline-none cursor-pointer rounded-none"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                id="play-btn"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current text-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current text-current translate-x-0.5" />
                )}
              </button>

              {/* Progress Bar Waveform simulation background */}
              <div
                onClick={handleWaveformClick}
                className="relative w-full h-10 bg-neutral-100 dark:bg-neutral-800 cursor-pointer overflow-hidden border border-neutral-200 dark:border-neutral-700 flex items-center gap-[3px] px-2"
                id="waveform-container"
              >
                {/* Simulated dynamic bars */}
                {Array.from({ length: 48 }).map((_, idx) => {
                  const barProgressThresh = (idx / 48) * 100;
                  const isActive = progress > barProgressThresh;
                  const randomHeight = [60, 40, 80, 50, 95, 30, 90, 70, 45, 60, 25, 100, 30, 75, 45, 90, 20, 85, 35, 65, 55, 10, 80, 95, 20, 85, 45][idx % 27];

                  return (
                    <div
                      key={idx}
                      style={{ height: `${randomHeight}%` }}
                      className={`w-[4px] min-w-[2px] transition-all duration-150 ${
                        isActive ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Content Accordeon Layout (Wireframe table list) */}
          <div className="space-y-4">
            <h2 className="font-mono text-xs font-bold text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 uppercase tracking-widest">
              Contents Breakdown
            </h2>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6 font-sans text-xs">
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
