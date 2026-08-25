import { Kit } from '../types';
import { Play, Search, FilterX, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';

interface CatalogViewProps {
  kits: Kit[];
  onSelectKit: (id: string) => void;
  onAddToCart: (kit: Kit) => void;
}

export default function CatalogView({
  kits,
  onSelectKit,
  onAddToCart
}: CatalogViewProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState({
    drum_kit: true,
    sample_pack: true,
    preset_bank: false
  });
  const [styles, setStyles] = useState({
    trap: false,
    lofi: false,
    techno: true
  });
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'title'>('default');
  const [visibleCount, setVisibleCount] = useState(6);

  // Toggle handlers
  const handleCategoryToggle = (cat: 'drum_kit' | 'sample_pack' | 'preset_bank') => {
    setCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleStyleToggle = (style: 'trap' | 'lofi' | 'techno') => {
    setStyles((prev) => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  // Clear filters
  const resetFilters = () => {
    setSearch('');
    setCategories({ drum_kit: true, sample_pack: true, preset_bank: true });
    setStyles({ trap: false, lofi: false, techno: false });
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  };

  // Filter & Sort Logic
  const filteredKits = useMemo(() => {
    return kits
      .filter((kit) => {
        // Search filter matching title, creator or tags
        const q = search.toLowerCase();
        if (search) {
          const titleMatches = kit.title.toLowerCase().includes(q);
          const creatorMatches = kit.creator.toLowerCase().includes(q);
          const tagMatches = kit.tags.some((t) => t.toLowerCase().includes(q));
          if (!titleMatches && !creatorMatches && !tagMatches) return false;
        }

        // Category filter
        const hasSelectedCategory = categories.drum_kit || categories.sample_pack || categories.preset_bank;
        if (hasSelectedCategory) {
          if (kit.category === 'drum_kit' && !categories.drum_kit) return false;
          if (kit.category === 'sample_pack' && !categories.sample_pack) return false;
          if (kit.category === 'preset_bank' && !categories.preset_bank) return false;
        }

        // Style taxonomy Filter (Techno, Lo-fi, Trap)
        const hasSelectedStyle = styles.trap || styles.lofi || styles.techno;
        if (hasSelectedStyle) {
          const kitTagsUpper = kit.tags.map((t) => t.toUpperCase());
          if (styles.trap && !kitTagsUpper.includes('TRAP')) return false;
          if (styles.lofi && !kitTagsUpper.includes('LO-FI') && !kitTagsUpper.includes('LOFI')) return false;
          if (styles.techno && !kitTagsUpper.includes('TECHNO')) return false;
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
  }, [kits, search, categories, styles, minPrice, maxPrice, sortBy]);

  const displayedKits = filteredKits.slice(0, visibleCount);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row gap-10 animate-fade-in">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-1/4 flex flex-col gap-8">
        
        {/* Decorative desktop heading */}
        <div className="hidden md:block">
          <h1 className="font-sans text-5xl font-extrabold tracking-tighter mb-1 text-black uppercase">
            Catalog
          </h1>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest leading-none">
            Filter all modular sound packages
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Search audio stamps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-100 border border-neutral-200 focus:border-black focus:bg-white pl-10 pr-3 py-2.5 font-sans text-xs transition-all outline-none"
          />
        </div>

        {/* Categorias Block */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">
            Category
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.drum_kit}
                onChange={() => handleCategoryToggle('drum_kit')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Drum Kit
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.sample_pack}
                onChange={() => handleCategoryToggle('sample_pack')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Sample Pack
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={categories.preset_bank}
                onChange={() => handleCategoryToggle('preset_bank')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Preset Bank
              </span>
            </label>
          </div>
        </section>

        {/* Price filter limits */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">
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
                className="w-full bg-neutral-100 border border-neutral-200 focus:border-black focus:bg-white pl-5 pr-2 py-2 font-mono text-xs outline-none"
              />
            </div>
            <span className="text-neutral-300 font-mono text-xs">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-[10px] text-neutral-400">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-neutral-100 border border-neutral-200 focus:border-black focus:bg-white pl-5 pr-2 py-2 font-mono text-xs outline-none"
              />
            </div>
          </div>
        </section>

        {/* Style selection checkboxes */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">
            Style / Genre
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={styles.trap}
                onChange={() => handleStyleToggle('trap')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Trap
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={styles.lofi}
                onChange={() => handleStyleToggle('lofi')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Lo-Fi
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={styles.techno}
                onChange={() => handleStyleToggle('techno')}
                className="w-4 h-4 rounded-none border-black text-black focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-sans text-xs text-neutral-700 group-hover:text-black transition-colors">
                Techno
              </span>
            </label>
          </div>
        </section>

        {/* Sorting drop container */}
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">
            Sort By
          </h3>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full bg-neutral-100 border border-neutral-200 focus:border-black p-2 font-mono text-xs outline-none cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="title">Alphabetical</option>
          </select>
        </section>

        {/* Reset Filter Button */}
        <button
          onClick={resetFilters}
          className="w-full py-2 border border-black hover:bg-neutral-100 transition-colors uppercase tracking-wider font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FilterX className="w-3.5 h-3.5" />
          Clear filters
        </button>
      </aside>

      {/* Main product catalog grids */}
      <section className="w-full md:w-3/4 flex flex-col gap-6">
        
        {/* Mobile responsive search / result statistics headers */}
        <div className="flex md:hidden justify-between items-center pb-4 border-b border-neutral-200">
          <h1 className="font-sans text-3xl font-extrabold tracking-tighter text-black uppercase">
            Catalog
          </h1>
          <span className="font-mono text-[10px] text-neutral-500 bg-neutral-100 px-2.5 py-1">
            {filteredKits.length} results
          </span>
        </div>

        {/* Sorting metadata readouts for desktop */}
        <div className="hidden md:flex justify-between items-center text-xs text-neutral-500 font-mono pb-2 border-b border-neutral-100">
          <span>
            Showing {displayedKits.length} of {filteredKits.length} corresponding sonic assets
          </span>
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Grid Layout Active</span>
          </div>
        </div>

        {/* Empty Search Handler */}
        {displayedKits.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3">
            <FilterX className="w-10 h-10 text-neutral-300" />
            <h4 className="font-sans text-sm font-bold uppercase tracking-tight text-neutral-600">
              No audio files found
            </h4>
            <p className="font-sans text-xs text-neutral-400 max-w-[280px]">
              We couldn't match your search criteria. Try modifying your tags or clearing active price ranges.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-xs font-mono font-bold underline hover:text-black cursor-pointer text-neutral-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedKits.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectKit(item.id)}
                className="group flex flex-col gap-3 border border-transparent hover:border-neutral-200 p-3 -m-3 transition-colors duration-200 cursor-pointer relative bg-white/50 hover:bg-white"
              >
                {/* Visual Cover */}
                <div className="w-full aspect-square bg-neutral-100 relative overflow-hidden flex items-center justify-center border border-neutral-100">
                  <img
                    alt={item.title}
                    src={item.coverImage}
                    className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-colors duration-200 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info Text readouts */}
                <div className="flex flex-col gap-1.5 mt-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-sans text-xs font-bold leading-tight uppercase group-hover:underline truncate text-black flex-1">
                      {item.title}
                    </h4>
                    <span className="font-mono text-xs font-extrabold bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 text-black">
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
                        className="px-2 py-0.5 border border-neutral-200 font-mono text-[9px] text-neutral-500 uppercase rounded-none bg-neutral-50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button element layout */}
        {filteredKits.length > displayedKits.length && (
          <div className="w-full flex justify-center mt-8 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="bg-transparent border border-black text-black font-sans text-xs font-extrabold px-8 py-3 rounded-none hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
