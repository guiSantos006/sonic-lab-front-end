import { Kit } from '../types';
import { Play, Pause, Search, FilterX, SlidersHorizontal, ArrowUpDown, Tag, Sparkles } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import VinylRecord from './VinylRecord';
import { audioPlayer } from '../utils/audioPlayer';
import { apiGetSoundKitTags } from '../utils/soundKitService';
import { useLanguage } from '../context/LanguageContext';

interface CatalogViewProps {
  kits: Kit[];
  onSelectKit: (id: string) => void;
  onAddToCart: (kit: Kit) => void;
  initialCategory?: 'drum_kit' | 'sample_pack' | 'preset_bank' | 'all';
  initialTag?: string | null;
}

export default function CatalogView({
  kits,
  onSelectKit,
  onAddToCart,
  initialCategory = 'all',
  initialTag = null,
}: CatalogViewProps) {
  const { t } = useLanguage();
  // Audio playback state
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubPlay = audioPlayer.on('play', () => {
      setPlayingId(audioPlayer.getPlayingKitId());
    });

    const unsubPause = audioPlayer.on('pause', () => {
      if (!audioPlayer.isPlayingNow()) {
        setPlayingId(null);
      }
    });

    const unsubStop = audioPlayer.on('stop', () => {
      setPlayingId(null);
    });

    const unsubEnd = audioPlayer.on('ended', () => {
      setPlayingId(null);
    });

    return () => {
      unsubPlay();
      unsubPause();
      unsubStop();
      unsubEnd();
    };
  }, []);

  const handlePlayToggle = (e: React.MouseEvent, kit: Kit) => {
    e.stopPropagation();
    if (playingId === kit.id && audioPlayer.isPlayingNow()) {
      audioPlayer.pause();
      setPlayingId(null);
    } else {
      setPlayingId(kit.id);
      audioPlayer.playKit(kit);
    }
  };

  // Filter States
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState({
    drum_kit: initialCategory === 'all' || initialCategory === 'drum_kit',
    sample_pack: initialCategory === 'all' || initialCategory === 'sample_pack',
    preset_bank: initialCategory === 'all' || initialCategory === 'preset_bank',
  });

  // Keep categories in sync if initialCategory prop changes
  useEffect(() => {
    if (initialCategory === 'all') {
      setCategories({ drum_kit: true, sample_pack: true, preset_bank: true });
    } else {
      setCategories({
        drum_kit: initialCategory === 'drum_kit',
        sample_pack: initialCategory === 'sample_pack',
        preset_bank: initialCategory === 'preset_bank',
      });
    }
  }, [initialCategory]);

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'title'>('default');
  const [visibleCount, setVisibleCount] = useState(6);

  // Mobile filters accordion toggle
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Dynamic tags from backend API and actual kits loaded
  const [backendTags, setBackendTags] = useState<string[]>([]);
  // Multi-select active tags from soundkits (Item 2: substituir os gêneros pelas tags dos soundkits)
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    return initialTag ? [initialTag.toUpperCase()] : [];
  });

  useEffect(() => {
    if (initialTag) {
      setSelectedTags([initialTag.toUpperCase()]);
    }
  }, [initialTag]);

  useEffect(() => {
    apiGetSoundKitTags()
      .then((tags) => {
        if (tags && tags.length > 0) setBackendTags(tags);
      })
      .catch(() => {});
  }, []);

  // Compute all unique tags available across current sound kits and backend
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    kits.forEach((k) => {
      (k.tags || []).forEach((t) => {
        if (t && typeof t === 'string') {
          tagSet.add(t.trim().toUpperCase());
        }
      });
    });
    backendTags.forEach((t) => {
      if (t) tagSet.add(t.trim().toUpperCase());
    });
    return Array.from(tagSet).sort();
  }, [kits, backendTags]);

  // Toggle handlers
  const handleCategoryToggle = (cat: 'drum_kit' | 'sample_pack' | 'preset_bank') => {
    setCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleTagToggle = (tagUpper: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagUpper) ? prev.filter((t) => t !== tagUpper) : [...prev, tagUpper]
    );
  };

  // Clear filters
  const resetFilters = () => {
    setSearch('');
    setCategories({ drum_kit: true, sample_pack: true, preset_bank: true });
    setSelectedTags([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  };

  // Filter & Sort Logic
  const filteredKits = useMemo(() => {
    return kits
      .filter((kit) => {
        // Tag chip filter: match any of the selected soundkit tags if user picked any
        if (selectedTags.length > 0) {
          const kitTagsUpper = (kit.tags || []).map((t) => t.toUpperCase());
          const hasMatchingTag = selectedTags.some((selected) => kitTagsUpper.includes(selected));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search filter matching title, creator or tags
        const q = search.toLowerCase();
        if (search) {
          const titleMatches = kit.title.toLowerCase().includes(q);
          const creatorMatches = kit.creator.toLowerCase().includes(q);
          const tagMatches = (kit.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!titleMatches && !creatorMatches && !tagMatches) return false;
        }

        // Category filter
        const hasSelectedCategory = categories.drum_kit || categories.sample_pack || categories.preset_bank;
        if (hasSelectedCategory) {
          if (kit.category === 'drum_kit' && !categories.drum_kit) return false;
          if (kit.category === 'sample_pack' && !categories.sample_pack) return false;
          if (kit.category === 'preset_bank' && !categories.preset_bank) return false;
        }

        // Price boundaries limit
        const minVal = parseFloat(minPrice);
        const maxVal = parseFloat(maxPrice);
        if (!isNaN(minVal) && kit.price < minVal) return false;
        if (!isNaN(maxVal) && kit.price > maxVal) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0; // Default
      });
  }, [kits, search, categories, selectedTags, minPrice, maxPrice, sortBy]);

  const displayedKits = filteredKits.slice(0, visibleCount);

  return (
    <div className="w-full max-w-[1440px] mx-auto animate-fade-in py-2">
      {/* Acrylic Glass Frame - strictly on the catalog page */}
      <div
        id="catalog-acrylic-panel"
        className="w-full rounded-xl sm:rounded-2xl md:rounded-[28px] p-4 sm:p-6 md:p-8 lg:p-10 border border-white/30 dark:border-white/10 bg-white/45 dark:bg-white/[0.035] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.4)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12"
      >
        {/* Sidebar Filters */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4 md:gap-8">
        
        {/* Decorative desktop heading */}
        <div className="hidden md:block">
          <h1 className="font-sans text-5xl font-extrabold tracking-tighter mb-1 text-primary uppercase">
            {t.catalog.title}
          </h1>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest leading-none">
            {t.catalog.allCategories}
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder={t.catalog.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 pl-10 pr-3 py-2.5 font-sans text-xs transition-all outline-none"
          />
        </div>

        {/* Mobile Filter Toggle Button (< md screens) */}
        <div className="flex md:hidden items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex-1 py-2.5 px-3 border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.catalog.filters}</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-bold">
              {isMobileFiltersOpen ? '▲' : '▼'}
            </span>
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="py-2.5 px-3 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            title={t.catalog.clearFilters}
          >
            <FilterX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Sections (collapsible on mobile, always visible on desktop) */}
        <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col gap-6 md:gap-8 pt-2 md:pt-0 border-t border-neutral-200 dark:border-neutral-800 md:border-t-0`}>

        {/* Categorias Block */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-200 dark:border-neutral-800">
            {t.catalog.category}
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.drum_kit}
                onChange={() => handleCategoryToggle('drum_kit')}
                className="w-4 h-4 rounded-none border-black dark:border-neutral-500 text-black dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                Drum Kit
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.sample_pack}
                onChange={() => handleCategoryToggle('sample_pack')}
                className="w-4 h-4 rounded-none border-black dark:border-neutral-500 text-black dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                Sample Pack
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.preset_bank}
                onChange={() => handleCategoryToggle('preset_bank')}
                className="w-4 h-4 rounded-none border-black dark:border-neutral-500 text-black dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                Preset Bank
              </span>
            </label>
          </div>
        </section>

        {/* Price filter limits */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-200 dark:border-neutral-800">
            Price Range
          </h3>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-[10px] text-neutral-400">$</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 pl-5 pr-2 py-2 font-mono text-xs outline-none"
              />
            </div>
            <span className="text-neutral-300 dark:text-neutral-600 font-mono text-xs">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-[10px] text-neutral-400">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 pl-5 pr-2 py-2 font-mono text-xs outline-none"
              />
            </div>
          </div>
        </section>

        {/* SoundKit Tags filter (Replacing static genres with actual soundkit tags) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags dos SoundKits</span>
            </h3>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="font-mono text-[9px] uppercase text-neutral-500 hover:text-primary underline cursor-pointer"
              >
                Limpar ({selectedTags.length})
              </button>
            )}
          </div>

          {allAvailableTags.length === 0 ? (
            <p className="font-mono text-[11px] text-neutral-400">
              Nenhuma tag disponível no momento.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {allAvailableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/80 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Sorting drop container */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Ordenar Por</span>
          </h3>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-black dark:focus:border-white p-2 font-mono text-xs outline-none cursor-pointer"
          >
            <option value="default">Padrão (Recomendados)</option>
            <option value="priceAsc">Menor Preço</option>
            <option value="priceDesc">Maior Preço</option>
            <option value="title">Ordem Alfabética</option>
          </select>
        </section>

        {/* Reset Filter Button */}
        <button
          onClick={resetFilters}
          className="w-full py-2 border border-black dark:border-white/30 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors uppercase tracking-wider font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FilterX className="w-3.5 h-3.5" />
          Clear filters
        </button>
        </div>
      </aside>

      {/* Main product catalog grids */}
      <section className="w-full md:w-3/4 flex flex-col gap-6">
        
        {/* Mobile responsive search / result statistics headers */}
        <div className="flex md:hidden justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="font-sans text-3xl font-extrabold tracking-tighter text-primary uppercase">
            Catalog
          </h1>
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1">
            {filteredKits.length} results
          </span>
        </div>

        {/* Sorting metadata readouts for desktop */}
        <div className="hidden md:flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 font-mono pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <span>
            Showing {displayedKits.length} of {filteredKits.length} corresponding sonic assets
          </span>
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Grid Layout Active</span>
          </div>
        </div>

        {/* Active Filters Pill Bar (Categories and SoundKit Tags) */}
        {(selectedTags.length > 0 || !categories.drum_kit || !categories.sample_pack || !categories.preset_bank || search) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mr-1">
              Filtros ativos:
            </span>

            {/* Category filter pills if filtered */}
            {!(categories.drum_kit && categories.sample_pack && categories.preset_bank) && (
              <>
                {categories.drum_kit && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-black dark:bg-white text-white dark:text-black">
                    Drum Kits
                  </span>
                )}
                {categories.sample_pack && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-black dark:bg-white text-white dark:text-black">
                    Sample Packs
                  </span>
                )}
                {categories.preset_bank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-black dark:bg-white text-white dark:text-black">
                    Preset Banks
                  </span>
                )}
              </>
            )}

            {/* Selected Tag Pills */}
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase border border-neutral-300 dark:border-neutral-600 hover:border-red-500 hover:text-red-500 bg-white dark:bg-neutral-900 transition-colors cursor-pointer"
                title={`Remover tag ${tag}`}
              >
                <span>#{tag}</span>
                <span className="text-xs">&times;</span>
              </button>
            ))}

            {/* Search Pill */}
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase border border-neutral-300 dark:border-neutral-600 hover:border-red-500 hover:text-red-500 bg-white dark:bg-neutral-900 transition-colors cursor-pointer"
              >
                <span>"{search}"</span>
                <span className="text-xs">&times;</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-mono uppercase underline text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer ml-1"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Empty Search Handler */}
        {displayedKits.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-3">
            <FilterX className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
            <h4 className="font-sans text-sm font-bold uppercase tracking-tight text-neutral-600 dark:text-neutral-300">
              No audio files found
            </h4>
            <p className="font-sans text-xs text-neutral-400 max-w-[280px]">
              We couldn't match your search criteria. Try modifying your tags or clearing active price ranges.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-xs font-mono font-bold underline hover:text-black dark:hover:text-white cursor-pointer text-neutral-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedKits.map((item) => {
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectKit(item.id)}
                  className="group flex flex-col gap-3 border border-transparent hover:border-neutral-200 dark:hover:border-white/15 p-3 transition-all duration-300 cursor-pointer relative bg-transparent hover:bg-white dark:hover:bg-white/[0.04] rounded-xs"
                >
                  {/* Visual Cover with sliding Vinyl Record */}
                  <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xs">
                    {/* Minimalist Vinyl Record */}
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
                        onTogglePlay={(e) => handlePlayToggle(e, item)}
                      />
                    </div>

                    {/* Album Cover */}
                    <div
                      className={`relative z-20 h-full bg-neutral-100 dark:bg-neutral-900 border-r border-black/10 dark:border-white/10 shadow-[6px_0_18px_rgba(0,0,0,0.35)] transition-all duration-500 overflow-hidden ${
                        isPlaying ? 'w-[58%]' : 'w-full group-hover:w-[70%]'
                      }`}
                    >
                      <img
                        alt={item.title}
                        src={item.coverImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Play/Pause Button Cue */}
                      <button
                        onClick={(e) => handlePlayToggle(e, item)}
                        className={`absolute bottom-2.5 left-2.5 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                          isPlaying
                            ? 'bg-black text-white dark:bg-white dark:text-black scale-105'
                            : 'bg-black/80 text-white dark:bg-white/90 dark:text-black opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110'
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

                  {/* Info Text readouts */}
                  <div className="flex flex-col gap-1.5 mt-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-sans text-xs font-bold leading-tight uppercase group-hover:underline truncate text-black dark:text-white flex-1">
                        {item.title}
                      </h4>
                      <span className="font-mono text-xs font-extrabold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white">
                        ${item.price}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 capitalize tracking-wide leading-none">
                      By {item.creator.toLowerCase()}
                    </p>
                    
                    {/* Taxonomy Tags chips */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 font-mono text-[9px] text-neutral-500 dark:text-neutral-400 uppercase rounded-none bg-neutral-50 dark:bg-neutral-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button element layout */}
        {filteredKits.length > displayedKits.length && (
          <div className="w-full flex justify-center mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="bg-transparent border border-black dark:border-white text-black dark:text-white font-sans text-xs font-extrabold px-8 py-3 rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
