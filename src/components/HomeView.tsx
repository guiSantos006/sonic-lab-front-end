import { Kit } from '../types';
import { Play, Pause, ChevronRight, Volume2, Sparkles, Plus, Headphones } from 'lucide-react';
import React, { useState, useEffect } from 'react';

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
            return { ...prev, [playingId]: 0 };
          }
          return { ...prev, [playingId]: current + 5 };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playingId]);

  const handlePlayDemo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      if (!(playProgress[id] > 0)) {
        setPlayProgress((prev) => ({ ...prev, [id]: 0 }));
      }
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
        <div className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 transition-colors px-3 py-1 mb-6 border border-neutral-200">
          <Sparkles className="w-4.5 h-4.5 text-black" />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-neutral-800">
            Version 2.4 Modular Release
          </span>
        </div>
        <h1 className="font-sans text-5xl md:text-7xl font-extrabold max-w-[900px] mb-8 text-primary tracking-tighter uppercase leading-none">
          Your arsenal for <br />
          <span className="bg-gradient-to-r from-black to-neutral-500 bg-clip-text text-transparent">
            music production.
          </span>
        </h1>
        <p className="font-sans text-base md:text-lg text-neutral-500 max-w-[600px] mb-10 leading-relaxed font-normal">
          The largest portal for Drum Kits, Samples and Presets. Essential sounds curated to elevate your musical production tracks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('catalog')}
            className="w-full sm:w-auto bg-black text-white px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
          >
            Explore Kits
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('sell')}
            className="w-full sm:w-auto bg-white text-black border border-black px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Sell your Kit
          </button>
        </div>
      </header>

      {/* Section: Drum Kits */}
      <section className="max-w-[1440px] mx-auto w-full px-4 animate-slide-up">
        <div className="flex justify-between items-end mb-8 border-b border-neutral-100 pb-4">
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
            className="font-mono text-xs uppercase text-neutral-500 hover:text-black hover:underline tracking-wider cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Horizontal Scroll Layout */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
          {drumKits.map((item, idx) => (
            <article
              key={item.id}
              onClick={() => onSelectKit(item.id)}
              className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start group cursor-pointer flex flex-col gap-4 border border-transparent hover:border-neutral-200 hover:bg-white p-3 transition-all duration-300"
            >
              {/* Cover block */}
              <div className="aspect-square bg-neutral-100 relative overflow-hidden border border-neutral-100">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                {idx === 0 && (
                  <div className="absolute top-3 left-3 bg-black text-white px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide">
                    New
                  </div>
                )}
                {/* Visual listen cue overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-black text-white p-3 rounded-none">
                    <Headphones className="w-5 h-5" />
                  </div>
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
                <span className="font-mono text-[10px] border border-neutral-200 px-2 py-1 text-neutral-600 whitespace-nowrap bg-neutral-50">
                  {item.fileCount ? `${item.fileCount} Files` : '80 Files'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section: Sample Packs */}
      <section className="max-w-[1440px] mx-auto w-full px-4">
        <div className="flex justify-between items-end mb-8 border-b border-neutral-200 pb-4">
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
              className="p-2 border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="p-2 border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
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
                className="group border border-neutral-200 p-5 hover:border-black transition-all duration-300 cursor-pointer bg-white flex flex-col md:flex-row gap-5"
              >
                {/* Cover art bento block */}
                <div className="w-full md:w-1/3 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0 relative border border-neutral-100">
                  <img
                    alt={item.title}
                    src={item.coverImage}
                    className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
                  <div>
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 block">
                      {item.tags[0] || 'Analog Textures'}
                    </span>
                    <h3 className="font-sans text-base font-extrabold text-primary mb-1 group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    {/* Play demo button */}
                    <button
                      onClick={(e) => handlePlayDemo(e, item.id)}
                      className="w-10 h-10 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer shadow-sm flex-shrink-0 focus:outline-none"
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
                                isPlayed ? 'bg-black' : 'bg-neutral-200'
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-l border-neutral-200">
          {/* Preset Item 1 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 p-6 hover:bg-neutral-50 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black transition-colors">
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
              <span className="font-mono text-[9px] border border-black px-2.5 py-1 uppercase tracking-wider bg-white font-bold inline-block hover:bg-black hover:text-white transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 2 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 p-6 hover:bg-neutral-50 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black transition-colors">
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
              <span className="font-mono text-[9px] border border-black px-2.5 py-1 uppercase tracking-wider bg-white font-bold inline-block hover:bg-black hover:text-white transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 3 */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 p-6 hover:bg-neutral-50 transition-colors group cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-lg text-neutral-500 group-hover:text-black transition-colors">
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
              <span className="font-mono text-[9px] border border-black px-2.5 py-1 uppercase tracking-wider bg-white font-bold inline-block hover:bg-black hover:text-white transition-colors">
                Details
              </span>
            </div>
          </div>

          {/* Preset Item 4 - Black Box Catalyst block */}
          <div
            onClick={() => onNavigate('catalog')}
            className="border-b border-r border-neutral-200 p-6 bg-black text-white group cursor-pointer flex flex-col justify-center items-center text-center min-h-[220px] hover:bg-neutral-900 transition-colors"
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
