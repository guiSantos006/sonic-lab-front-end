import React from 'react';

interface VinylRecordProps {
  isPlaying: boolean;
  onTogglePlay?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  coverImage?: string;
  title?: string;
  showTonearm?: boolean;
  className?: string;
}

export default function VinylRecord({
  isPlaying,
  onTogglePlay,
  size = 'md',
  coverImage,
  title = 'SONIC_LAB',
  showTonearm = true,
  className = '',
}: VinylRecordProps) {
  // Dimensions map
  const sizeMap = {
    sm: {
      container: 'w-24 h-24 sm:w-28 sm:h-28',
      disc: 'w-24 h-24 sm:w-28 sm:h-28',
      label: 'w-8 h-8 sm:w-9 sm:h-9',
      spindle: 'w-2 h-2',
      tonearmScale: 0.65,
    },
    md: {
      container: 'w-36 h-36 sm:w-44 sm:h-44',
      disc: 'w-36 h-36 sm:w-44 sm:h-44',
      label: 'w-12 h-12 sm:w-14 sm:h-14',
      spindle: 'w-3 h-3',
      tonearmScale: 0.9,
    },
    lg: {
      container: 'w-56 h-56 sm:w-72 sm:h-72',
      disc: 'w-56 h-56 sm:w-72 sm:h-72',
      label: 'w-18 h-18 sm:w-24 sm:h-24',
      spindle: 'w-4 h-4',
      tonearmScale: 1.25,
    },
  }[size];

  return (
    <div
      onClick={onTogglePlay}
      className={`relative select-none flex items-center justify-center ${sizeMap.container} ${className} ${
        onTogglePlay ? 'cursor-pointer group' : ''
      }`}
      title={isPlaying ? 'Pausar prévia' : 'Ouvir prévia no vinil'}
    >
      {/* Vinyl Disc Body with microgrooves and specular sheen */}
      <div
        className={`relative rounded-full aspect-square ${sizeMap.disc} flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-transform duration-700 ease-out bg-[#0c0d10] overflow-hidden ${
          isPlaying ? 'animate-[spin_2.8s_linear_infinite]' : 'rotate-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 50% 50%, #15161a 0%, #0d0e12 28%, #17181f 30%, #0e0f13 32%, #14151a 45%, #0b0c0f 50%, #181920 54%, #0d0e12 65%, #191b22 75%, #0a0b0e 92%, #050507 100%)
          `,
        }}
      >
        {/* Subtle Conic Reflection (Sheen across vinyl grooves) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background: `conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.2) 0deg, transparent 40deg, rgba(255,255,255,0.15) 90deg, transparent 130deg, rgba(255,255,255,0.2) 180deg, transparent 220deg, rgba(255,255,255,0.15) 270deg, transparent 310deg, rgba(255,255,255,0.2) 360deg)`,
          }}
        />

        {/* Concentric Vinyl Grooves (Silky texture lines) */}
        <div className="absolute inset-[10%] rounded-full border border-white/[0.07] pointer-events-none" />
        <div className="absolute inset-[18%] rounded-full border border-white/[0.05] pointer-events-none" />
        <div className="absolute inset-[26%] rounded-full border border-white/[0.08] pointer-events-none" />
        <div className="absolute inset-[34%] rounded-full border border-white/[0.05] pointer-events-none" />
        <div className="absolute inset-[42%] rounded-full border border-white/[0.07] pointer-events-none" />

        {/* Center Record Label */}
        <div
          className={`relative rounded-full aspect-square ${sizeMap.label} flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.3)] bg-gradient-to-br from-neutral-800 via-neutral-900 to-black z-10 overflow-hidden`}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-65 grayscale hover:grayscale-0 transition-all"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-900" />
          )}

          {/* Label Rim and Text */}
          <div className="relative z-10 flex flex-col items-center justify-center p-0.5">
            <span className="font-mono text-[7px] text-white/90 font-bold uppercase tracking-tighter truncate max-w-[80%] leading-none drop-shadow-sm">
              {title.slice(0, 8)}
            </span>
            <span className="font-mono text-[5px] text-white/60 tracking-widest leading-none mt-0.5">
              33 RPM
            </span>
          </div>

          {/* Spindle center hole */}
          <div
            className={`absolute rounded-full aspect-square ${sizeMap.spindle} bg-[#000000] border border-white/40 shadow-inner z-20`}
          />
        </div>
      </div>

      {/* Minimalist Tonearm (Turntable Needle) as requested in user sketch */}
      {showTonearm && (
        <div
          className="absolute -top-1 -right-1 pointer-events-none z-20 transition-transform duration-700 ease-in-out origin-top-right"
          style={{
            transform: `scale(${sizeMap.tonearmScale}) rotate(${isPlaying ? '24deg' : '0deg'})`,
          }}
        >
          {/* Base Pivot / Gimbal */}
          <div className="w-5 h-5 rounded-full bg-neutral-800 dark:bg-neutral-700 border border-neutral-600 dark:border-neutral-500 shadow-md flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-200" />
            <div className="absolute -top-1 w-2.5 h-1.5 bg-neutral-900 rounded-xs border border-white/20" />
          </div>

          {/* Arm Rod (Metallic needle arm) */}
          <div className="relative left-2 w-[2px] h-14 sm:h-18 bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-500 dark:from-neutral-200 dark:via-neutral-300 dark:to-neutral-400 shadow-sm origin-top">
            {/* Headshell / Stylus Cartridge */}
            <div className="absolute -bottom-2 -left-1.5 w-3.5 h-5 bg-neutral-900 border border-neutral-500 rounded-[1px] rotate-[15deg] shadow flex items-center justify-center">
              <div className="w-1 h-2 bg-neutral-400 rounded-full" />
              {/* Needle tip dot */}
              <div
                className={`absolute -bottom-0.5 left-1 w-1 h-1 rounded-full ${
                  isPlaying ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-neutral-400'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Play/Pause Pulse indicator overlay when hovered */}
      {onTogglePlay && (
        <div
          className={`absolute inset-0 rounded-full bg-black/25 flex items-center justify-center transition-opacity duration-200 z-30 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-black/80 dark:bg-white/90 text-white dark:text-black flex items-center justify-center shadow-lg backdrop-blur-xs border border-white/20">
            {isPlaying ? (
              <div className="w-2.5 h-2.5 flex gap-0.5 justify-center items-center">
                <span className="w-0.5 h-2.5 bg-current" />
                <span className="w-0.5 h-2.5 bg-current" />
              </div>
            ) : (
              <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-current ml-0.5" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
