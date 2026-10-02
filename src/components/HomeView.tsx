import { Kit } from '../types';
import { Play, Pause, ChevronRight, Volume2, Plus, Headphones } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import VinylRecord from './VinylRecord';
import MorphingText from './MorphingText';
import { audioPlayer } from '../utils/audioPlayer';

interface HomeViewProps {
  kits: Kit[];
  onSelectKit: (id: string) => void;
  onNavigate: (view: any) => void;
  onAddToCart: (kit: Kit) => void;
}

export default function HomeView({
  kits,
  onSelectKit,
  onNavigate,
  onAddToCart
}: HomeViewProps) {
  // Simulator state for sample demo preview inside Bento Cards
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let interval: any;
    if (playingId) {
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          const current = prev[playingId] || 0;
          if (current >= 100) {
            setPlayingId(null);
            audioPlayer.stop();
            return { ...prev, [playingId]: 0 };
          }
          return { ...prev, [playingId]: current + 5 };
        });
      }, 100);
    } else {
      audioPlayer.stop();
    }
    return () => {
      clearInterval(interval);
      audioPlayer.stop();
    };
  }, [playingId]);

  const handlePlayDemo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (playingId === id) {
      audioPlayer.stop();
      setPlayingId(null);
    } else {
      const kit = kits.find((k) => k.id === id);
      setPlayingId(id);
      setPlayProgress((prev) => ({ ...prev, [id]: 0 }));
      audioPlayer.play(id, kit?.bpm || 120, kit?.category || 'drum_kit', () => {
        setPlayingId(null);
      });
    }
  };

  // Curate Drum Kits
  const drumKits = kits.filter((k) => k.category === 'drum_kit');
  
  // Curate Sample Packs
  const samplePacks = kits.filter((k) => k.category === 'sample_pack');

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24">
      {/* Hero Header */}
      <header className="w-full py-16 md:py-24 max-w-[1440px] mx-auto flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <h1 className="font-sans text-4xl sm:text-5xl md:text-7xl font-extrabold max-w-[950px] mb-8 text-primary tracking-tighter uppercase leading-tight flex flex-col items-center">
          <span className="block mb-1 sm:mb-2">Your arsenal for</span>
          <MorphingText
            texts={[
              'music production.',
              'drum kits.',
              'sample packs.',
              'serum presets.',
              'sound design.',
            ]}
            morphTime={1.5}
            cooldownTime={0.8}
            className="h-12 sm:h-16 md:h-20 w-full max-w-[900px] text-4xl sm:text-5xl md:text-7xl text-neutral-500 dark:text-neutral-400 font-extrabold tracking-tighter uppercase text-center"
          />
        </h1>
        <p className="font-sans text-base md:text-lg text-neutral-500 dark:text-neutral-400 max-w-[600px] mb-10 leading-relaxed font-normal">
          The largest portal for Drum Kits, Samples and Presets. Essential sounds curated to elevate your musical production tracks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('catalog')}
            className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
          >
            Explore Kits
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('sell')}
            className="w-full sm:w-auto bg-white dark:bg-transparent text-black dark:text-white border border-black dark:border-white/25 px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Sell your Kit
          </button>
        </div>
      </header>

      {/* Section: Drum Kits */}
      <section className="max-w-[1440px] mx-auto w-full px-4 animate-slide-up">
        <div className="flex justify-between items-end mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary uppercase tracking-tight">
              Drum Kits
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
              Engineered percussion packs
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="font-mono text-xs uppercase text-neutral-500 hover:text-black dark:hover:text-white hover:underline tracking-wider cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Horizontal Scroll Layout */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
          {drumKits.map((item, idx) => {
            const isPlaying = playingId === item.id;

            return (
              <article
                key={item.id}
                onClick={() => onSelectKit(item.id)}
                className="min-w-[290px] md:min-w-[320px] max-w-[320px] snap-start group cursor-pointer flex flex-col gap-4 border border-transparent hover:border-neutral-200 dark:hover:border-white/15 hover:bg-white dark:hover:bg-white/[0.04] p-3 transition-all duration-300 relative"
              >
                {/* Cover & Vinyl sleeve block */}
                <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xs">
                  {/* Minimalist Vinyl Record that slides out and rotates */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10 ${
                      isPlaying
                        ? 'right-2 scale-100 opacity-100'
                        : 'right-[-25%] group-hover:right-[-6%] scale-95 opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <VinylRecord
                      size="sm"
                      isPlaying={isPlaying}
                      title={item.title}
                      coverImage={item.coverImage}
                      showTonearm={true}
                      onTogglePlay={(e) => handlePlayDemo(e, item.id)}
                    />
                  </div>

                  {/* Album Cover Jacket (slid open when playing or on hover) */}
                  <div
                    className={`relative z-20 h-full bg-neutral-100 dark:bg-neutral-900 border-r border-black/10 dark:border-white/10 shadow-[6px_0_18px_rgba(0,0,0,0.35)] transition-all duration-500 overflow-hidden ${
                      isPlaying ? 'w-[58%]' : 'w-full group-hover:w-[70%]'
                    }`}
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale opacity-95 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <div className="absolute top-2.5 left-2.5 bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide z-30">
                        New
                      </div>
                    )}

                    {/* Play/Pause listening button cue */}
                    <button
                      onClick={(e) => handlePlayDemo(e, item.id)}
                      className={`absolute bottom-2.5 left-2.5 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                        isPlaying
                          ? 'bg-black text-white dark:bg-white dark:text-black scale-105'
                          : 'bg-black/80 text-white dark:bg-white/90 dark:text-black opacity-0 group-hover:opacity-100 hover:scale-110'
                      }`}
                      title={isPlaying ? 'Pausar prévia' : 'Ouvir no vinil'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 translate-x-0.5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-sans text-sm font-extrabold text-primary mb-1 group-hover:underline truncate">
                      {item.title}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide truncate">
                      {item.tags.join(' / ')}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-neutral-600 dark:text-neutral-400 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900">
                    {item.fileCount ? `${item.fileCount} Files` : '80 Files'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section: Sample Packs */}
      <section className="max-w-[1440px] mx-auto w-full px-4">
        <div className="flex justify-between items-end mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary uppercase tracking-tight">
              Sample Packs
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
              Melodics, vocal chops & SFX loops
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('catalog')}
              className="p-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="p-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {samplePacks.slice(0, 2).map((item) => {
            const isPlaying = playingId === item.id;
            const progress = playProgress[item.id] || 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectKit(item.id)}
                className="group border border-neutral-200 dark:border-neutral-800 p-5 hover:border-black dark:hover:border-white/40 transition-all duration-300 cursor-pointer bg-white dark:bg-neutral-900/90 flex flex-col md:flex-row gap-5"
              >
                {/* Cover art bento block with vinyl sleeve */}
                <div className="w-full md:w-2/5 aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 relative border border-neutral-100 dark:border-neutral-800 rounded-xs">
                  {/* Sliding Vinyl Record */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10 ${
                      isPlaying
                        ? 'right-2 scale-100 opacity-100'
                        : 'right-[-25%] group-hover:right-[-6%] scale-95 opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <VinylRecord
                      size="sm"
                      isPlaying={isPlaying}
                      title={item.title}
                      coverImage={item.coverImage}
                      showTonearm={true}
                      onTogglePlay={(e) => handlePlayDemo(e, item.id)}
                    />
                  </div>

                  {/* Album Cover */}
                  <div
                    className={`relative z-20 h-full bg-neutral-100 dark:bg-neutral-800 border-r border-black/10 dark:border-white/10 shadow-[6px_0_18px_rgba(0,0,0,0.35)] transition-all duration-500 overflow-hidden ${
                      isPlaying ? 'w-[58%]' : 'w-full group-hover:w-[70%]'
                    }`}
                  >
                    <img
                      alt={item.title}
                      src={item.coverImage}
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors" />
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
                  <div>
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 block">
                      {item.tags[0] || 'Analog Textures'}
                    </span>
                    <h3 className="font-sans text-base font-extrabold text-primary mb-1 group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    {/* Play demo button */}
                    <button
                      onClick={(e) => handlePlayDemo(e, item.id)}
                      className="w-10 h-10 rounded-full border border-black dark:border-white/40 text-black dark:text-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer shadow-sm flex-shrink-0 focus:outline-none"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-current filled" />
                      ) : (
                        <Play className="w-4 h-4 translate-x-0.5 text-current" />
                      )}
                    </button>

                    {/* Progress Waveform Simulation */}
                    <div className="flex-1 h-6 flex items-center gap-[2px] overflow-hidden opacity-85">
                      {[100, 60, 80, 40, 95, 30, 90, 50, 70, 20, 85, 45, 60, 25, 100, 30].map(
                        (height, index, arr) => {
                          const barProgressThresh = (index / arr.length) * 100;
                          const isPlayed = progress > barProgressThresh;

                          return (
                            <div
                              key={index}
                              style={{ height: `${height}%` }}
                              className={`w-[3px] transition-all duration-300 ${
                                isPlayed ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'
                              }`}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Serum Banks (Preset List matching graphic wireframe) */}
      <section className="max-w-[1440px] mx-auto w-full px-4 mb-8">
        <div className="flex flex-col mb-8 text-left">
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary uppercase tracking-tight">
            Serum Banks
          </h2>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
            Wavetables and presets for modern synthesizers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-l border-neutral-200 dark:border-neutral-800">
          {/* Preset Item 1 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 dark:border-neutral-800 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                  01
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  50 Presets
                </span>
              </div>
              <h3 className="font-sans text-sm font-extrabold text-primary mb-1 group-hover:underline">
                Neuro Bass
              </h3>
              <p className="font-mono text-[10px] text-neutral-500 uppercase">
                Dubstep / Bass
              </p>
            </div>
            <div className="mt-6">
              <span className="font-mono text-[9px] border border-black dark:border-white/20 px-2.5 py-1 uppercase tracking-wider bg-white dark:bg-neutral-800 text-black dark:text-white font-bold inline-block hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 2 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 dark:border-neutral-800 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                  02
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  85 Presets
                </span>
              </div>
              <h3 className="font-sans text-sm font-extrabold text-primary mb-1 group-hover:underline">
                Lush Pads
              </h3>
              <p className="font-mono text-[10px] text-neutral-500 uppercase font-medium">
                Ambient / Chill
              </p>
            </div>
            <div className="mt-6">
              <span className="font-mono text-[9px] border border-black dark:border-white/20 px-2.5 py-1 uppercase tracking-wider bg-white dark:bg-neutral-800 text-black dark:text-white font-bold inline-block hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 3 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 dark:border-neutral-800 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                  03
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  64 Presets
                </span>
              </div>
              <h3 className="font-sans text-sm font-extrabold text-primary mb-1 group-hover:underline">
                Tech House Plucks
              </h3>
              <p className="font-mono text-[10px] text-neutral-500 uppercase">
                Tech House
              </p>
            </div>
            <div className="mt-6">
              <span className="font-mono text-[9px] border border-black dark:border-white/20 px-2.5 py-1 uppercase tracking-wider bg-white dark:bg-neutral-800 text-black dark:text-white font-bold inline-block hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 4 - Catalyst block */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 dark:border-neutral-800 p-6 bg-black dark:bg-white/10 text-white dark:border-white/10 group cursor-pointer flex flex-col justify-center items-center text-center min-h-[220px] hover:bg-neutral-900 dark:hover:bg-white/15 transition-colors"
          >
            <Plus className="w-8 h-8 mb-3 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-extrabold">
              View Catalog
            </span>
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mt-1">
              Explore preset expansion packs
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
