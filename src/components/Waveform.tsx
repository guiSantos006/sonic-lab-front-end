"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

export interface WaveformProps {
  /** Array of amplitude values (0.0 to 1.0 or 0 to 100), e.g. 100 points from backend */
  data?: number[];
  /** Playback progress from 0.0 to 1.0 */
  progress?: number;
  /** Current time in seconds */
  currentTime?: number;
  /** Total audio duration in seconds */
  duration?: number;
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  /** Callback fired when user seeks via click or drag (returns 0.0 to 1.0) */
  onSeek?: (percentage: number) => void;
  /** Visual height in pixels */
  height?: number;
  /** Width of each waveform bar (default: 3) */
  barWidth?: number;
  /** Gap between waveform bars (default: 2) */
  barGap?: number;
  /** Corner radius of each bar (default: 1.5) */
  barRadius?: number;
  /** Primary played color (defaults to theme adaptive) */
  activeColor?: string;
  /** Unplayed bar color (defaults to theme adaptive) */
  inactiveColor?: string;
  /** Hover seek line and tooltip color */
  hoverColor?: string;
  /** Show hover timestamp tooltip */
  showTimeHover?: boolean;
  /** Enable click and drag scrubbing */
  interactive?: boolean;
  /** Additional container CSS classes */
  className?: string;
  /** Visual density (number of bars to render, default: 60) */
  barsCount?: number;
}

/**
 * Format seconds into mm:ss display
 */
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Default rhythmic sample waveform (60 points) if none provided
 */
const DEFAULT_FALLBACK_WAVEFORM = [
  0.25, 0.45, 0.75, 0.35, 0.85, 0.95, 0.40, 0.65, 0.50, 0.80,
  0.30, 0.90, 0.70, 0.40, 0.60, 0.85, 0.35, 0.55, 0.75, 0.95,
  0.45, 0.30, 0.80, 0.65, 0.50, 0.70, 0.40, 0.90, 0.85, 0.35,
  0.60, 0.75, 0.45, 0.85, 0.95, 0.40, 0.70, 0.55, 0.80, 0.30,
  0.65, 0.90, 0.50, 0.75, 0.40, 0.60, 0.85, 0.35, 0.70, 0.95,
  0.50, 0.30, 0.80, 0.65, 0.45, 0.60, 0.40, 0.75, 0.55, 0.20,
];

export default function Waveform({
  data,
  progress = 0,
  currentTime = 0,
  duration = 30,
  isPlaying = false,
  onSeek,
  height = 48,
  barWidth = 3,
  barGap = 2,
  barRadius = 1.5,
  activeColor,
  inactiveColor,
  hoverColor,
  showTimeHover = true,
  interactive = true,
  className = '',
  barsCount = 64,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Normalize data points to exactly barsCount
  const normalizedBars = useMemo(() => {
    const raw = data && data.length > 0 ? data : DEFAULT_FALLBACK_WAVEFORM;

    // Resample to barsCount
    const result: number[] = [];
    for (let i = 0; i < barsCount; i++) {
      const srcIndex = (i / barsCount) * raw.length;
      const lower = Math.floor(srcIndex);
      const upper = Math.min(raw.length - 1, Math.ceil(srcIndex));
      const fraction = srcIndex - lower;

      const v1 = raw[lower] > 1 ? raw[lower] / 100 : raw[lower];
      const v2 = raw[upper] > 1 ? raw[upper] / 100 : raw[upper];
      const val = v1 + (v2 - v1) * fraction;

      // Clamp between 0.08 and 1.0 for aesthetic minimum bar height
      result.push(Math.max(0.08, Math.min(1.0, val)));
    }
    return result;
  }, [data, barsCount]);

  // Render waveform onto HTML5 Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) return;

    // Match device pixel ratio
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Resolve colors based on CSS / DOM theme
    const isDark = document.documentElement.classList.contains('dark');
    const resolvedActive = activeColor || (isDark ? '#FFFFFF' : '#0F172A');
    const resolvedInactive = inactiveColor || (isDark ? '#334155' : '#E2E8F0');
    const resolvedHover = hoverColor || (isDark ? '#38BDF8' : '#0284C7');

    const totalBars = normalizedBars.length;
    // Calculate adaptive bar width to fill available width nicely
    const step = w / totalBars;
    const dynamicBarWidth = Math.max(1.5, Math.min(barWidth, step - barGap));
    const centerY = h / 2;

    const currentPercent = Math.max(0, Math.min(1, progress));

    // Draw bars
    for (let i = 0; i < totalBars; i++) {
      const barFraction = i / totalBars;
      const isPast = barFraction <= currentPercent;
      const isHoveredPast = hoverPosition !== null && barFraction <= hoverPosition;

      // Base height
      let amp = normalizedBars[i];

      // Subtle dynamic flutter when playing
      if (isPlaying && isPast) {
        const timeFactor = (Date.now() / 250) + i;
        const flutter = Math.sin(timeFactor) * 0.08;
        amp = Math.max(0.1, Math.min(1.0, amp + flutter));
      }

      const barHeight = Math.max(4, amp * (h - 8));
      const x = i * step + (step - dynamicBarWidth) / 2;
      const y = centerY - barHeight / 2;

      ctx.fillStyle = isPast
        ? resolvedActive
        : isHoveredPast
        ? resolvedHover
        : resolvedInactive;

      // Draw rounded rectangle for bar
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, dynamicBarWidth, barHeight, barRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, dynamicBarWidth, barHeight);
      }
    }

    // Draw vertical playhead line
    const playheadX = currentPercent * w;
    ctx.fillStyle = resolvedActive;
    ctx.fillRect(playheadX - 1, 0, 2, h);

    // Draw hover cursor line if hovered and interactive
    if (interactive && hoverPosition !== null && !isDragging) {
      const hoverX = hoverPosition * w;
      ctx.fillStyle = resolvedHover;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(hoverX - 0.5, 0, 1, h);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }, [
    normalizedBars,
    progress,
    isPlaying,
    hoverPosition,
    isDragging,
    interactive,
    activeColor,
    inactiveColor,
    hoverColor,
    barWidth,
    barGap,
    barRadius,
  ]);

  // Request Animation Frame loop when playing for smooth fluid playback
  useEffect(() => {
    let animId: number;

    const loop = () => {
      renderCanvas();
      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [renderCanvas, isPlaying]);

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Mouse / Touch interaction handlers
  const handleSeekFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const fraction = clickX / rect.width;

    if (onSeek) {
      onSeek(fraction);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverPosition(x / rect.width);

    if (isDragging) {
      handleSeekFromEvent(e);
    }
  };

  const handleMouseEnter = () => {
    // will update on mouse move
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    setIsDragging(true);
    handleSeekFromEvent(e);

    const onGlobalMouseMove = (ge: MouseEvent) => {
      handleSeekFromEvent(ge);
    };

    const onGlobalMouseUp = () => {
      setIsDragging(false);
      setHoverPosition(null);
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  // Hover target time calculation
  const hoverTimeSeconds = hoverPosition !== null ? hoverPosition * (duration || 30) : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{ height: `${height}px` }}
      className={`relative w-full select-none ${
        interactive ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
      role="slider"
      aria-label="Audio waveform scrubber"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      {/* HTML5 Canvas Surface */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: `${height}px` }}
      />

      {/* Floating Hover Tooltip with Timestamp */}
      {showTimeHover && interactive && hoverPosition !== null && (
        <div
          className="absolute -top-7 pointer-events-none -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] px-2 py-0.5 rounded shadow-lg border border-white/10 whitespace-nowrap z-30 transition-opacity duration-150"
          style={{ left: `${hoverPosition * 100}%` }}
        >
          {formatTime(hoverTimeSeconds)}
        </div>
      )}
    </div>
  );
}
