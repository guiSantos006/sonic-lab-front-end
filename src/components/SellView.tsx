import { Kit } from '../types';
import { Image, Upload, CheckCircle, FileAudio, FileArchive, Plus, X, Tag } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface SellViewProps {
  onPublish: (kit: Kit) => void;
  onNavigate: (view: any) => void;
}

export default function SellView({ onPublish, onNavigate }: SellViewProps) {
  // Form fields state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'drum_kit' | 'sample_pack' | 'preset_bank'>('drum_kit');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['TECHNO', 'ANALOG']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Asset uploaded simulation files
  const [coverFileName, setCoverFileName] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [demoFileName, setDemoFileName] = useState('');
  const [zipFileName, setZipFileName] = useState('');

  const [dragOver, setDragOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // File Inputs references
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Suggested preset tags list
  const AVAILABLE_TAGS = ['TECHNO', 'TRAP', 'LO-FI', 'ANALOG', 'AMBIENT', 'VOCALS', 'DUBSTEP', 'BOOM BAP', 'SYNTHWAVE', 'INDUSTRIAL', 'HOUSE', 'MINIMAL'];

  const handleTagToggle = (tag: string) => {
    const formatted = tag.toUpperCase();
    if (tags.includes(formatted)) {
      setTags(tags.filter((t) => t !== formatted));
    } else {
      setTags([...tags, formatted]);
    }
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formatted = customTagInput.trim().toUpperCase();
    if (!formatted) return;
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Cover uploading handlers
  const handleCoverSelect = (file: File) => {
    if (!file) return;
    setCoverFileName(file.name);
    
    // Create preview URL to make the app incredibly responsive
    const localUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(localUrl);
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeaveHandler = () => {
    setDragOver(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleCoverSelect(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      alert('Please fill in the Kit Title, Price, and Description fields.');
      return;
    }

    // Default brutalist abstract artwork if none is chosen
    const resolvedCover = coverPreviewUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400';

    const newKit: Kit = {
      id: `custom-kit-${Date.now()}`,
      title: title,
      creator: 'ALEXANDER_VOID', // Current logged in profile
      category: category,
      price: parseFloat(price) || 29.00,
      description: description,
      coverImage: resolvedCover,
      tags: tags.map((t) => t.toUpperCase()),
      fileCount: category === 'drum_kit' ? 180 : category === 'sample_pack' ? 120 : 64,
      fileSize: '480 MB',
      sampleRate: '24-Bit WAV',
      royaltyFree: true,
      contents: {
        'One-shots': 45,
        'Drum loops': 40,
        'Melody stems': 25,
        'Sound FX': 15
      }
    };

    onPublish(newKit);
    setIsSuccess(true);
    
    // Smooth transition
    setTimeout(() => {
      setIsSuccess(false);
      onNavigate('profile');
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      
      {/* Upper Title Section */}
      <header className="mb-12 text-center">
        <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-black mb-2 uppercase tracking-tighter leading-none">
          Sell New Kit
        </h1>
        <p className="font-sans text-sm text-neutral-500">
          Upload and list your high-fidelity sonic assets to the marketplace catalog.
        </p>
      </header>

      {isSuccess ? (
        <div className="py-20 border border-black bg-white flex flex-col items-center justify-center text-center gap-4">
          <CheckCircle className="w-16 h-16 text-black animate-bounce" />
          <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight">
            Asset Published!
          </h2>
          <p className="font-sans text-xs text-neutral-500 max-w-xs px-4">
            Your new sound package was successfully registered and is now listed first within the catalog & your active listings!
          </p>
        </div>
      ) : (
        <form onSubmit={handlePublishSubmit} className="space-y-12">
          
          {/* Metadata Section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 pb-2 uppercase tracking-tight text-neutral-800">
              1. Metadata
            </h2>

            {/* Title */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500" htmlFor="kit_title">
                Kit Title
              </label>
              <input
                required
                id="kit_title"
                type="text"
                placeholder="e.g. TR-808 Analog Stems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border-b border-neutral-300 focus:border-black p-3 font-sans text-sm transition-colors outline-none focus:ring-0"
              />
            </div>

            {/* Category selection radio list */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500">
                Category
              </label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'drum_kit'}
                    onChange={() => setCategory('drum_kit')}
                    className="text-black border-black focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800">Drum Kit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'sample_pack'}
                    onChange={() => setCategory('sample_pack')}
                    className="text-black border-black focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800">Sample Pack</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'preset_bank'}
                    onChange={() => setCategory('preset_bank')}
                    className="text-black border-black focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800">Serum Bank</span>
                </label>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2 max-w-xs">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500" htmlFor="price">
                Price (USD)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-xs text-neutral-400">$</span>
                <input
                  required
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border-b border-neutral-300 focus:border-black p-3 pl-8 font-sans text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description text area */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500" htmlFor="description">
                Description
              </label>
              <textarea
                required
                id="description"
                rows={4}
                placeholder="Describe the sonic characteristics, synthesizers used, contents & compatibility formats..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-neutral-200 focus:border-black p-3 font-sans text-xs outline-none transition-all placeholder:text-neutral-400 resize-y"
              />
            </div>
          </section>

          {/* Core Assets section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 pb-2 uppercase tracking-tight text-neutral-800">
              2. Assets
            </h2>

            {/* Dotted cover photo dragging area */}
            <div className="space-y-2">
              <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500">
                Cover Image
              </span>
              <div
                onDragOver={onDragOverHandler}
                onDragLeave={onDragLeaveHandler}
                onDrop={onDropHandler}
                onClick={() => coverInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center hover:border-black transition-all cursor-pointer bg-white relative group flex flex-col items-center justify-center min-h-[220px] ${
                  dragOver ? 'border-black bg-neutral-50' : 'border-neutral-200'
                }`}
              >
                {coverPreviewUrl ? (
                  <div className="relative w-40 h-40 border border-neutral-200">
                    <img
                      src={coverPreviewUrl}
                      alt="PREVIEW"
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-mono text-[10px] text-white uppercase tracking-wider font-extrabold">
                        Change Artwork
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image className="w-12 h-12 text-neutral-300 group-hover:text-black transition-colors mb-3" />
                    <p className="font-sans text-xs text-neutral-600 group-hover:text-black transition-colors">
                      Drag & drop cover art or <span className="underline font-bold">browse local files</span>
                    </p>
                    <p className="font-mono text-[9px] text-neutral-400 mt-1">
                      1000x1000px JPG/PNG recommended
                    </p>
                  </>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleCoverSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            {/* Extra MP3 and ZIP assets links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MP3 */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500">
                  Audio Demo (MP3/WAV)
                </span>
                <div className="border border-neutral-200 p-3 bg-white hover:border-black transition-colors flex items-center justify-between">
                  <span className="font-sans text-xs text-neutral-500 truncate mr-4">
                    {demoFileName || 'No audio chosen'}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="cursor-pointer font-mono text-[10px] border border-black px-3 py-1 bg-white hover:bg-neutral-50 font-bold uppercase transition-colors"
                  >
                    Browse
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files && e.target.files[0] && setDemoFileName(e.target.files[0].name)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* ZIP */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500">
                  Main File (ZIP)
                </span>
                <div className="border border-neutral-200 p-3 bg-white hover:border-black transition-colors flex items-center justify-between">
                  <span className="font-sans text-xs text-neutral-500 truncate mr-4">
                    {zipFileName || 'No file selected (.zip)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="cursor-pointer font-mono text-[10px] border border-black px-3 py-1 bg-white hover:bg-neutral-50 font-bold uppercase transition-colors"
                  >
                    Browse
                  </button>
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    onChange={(e) => e.target.files && e.target.files[0] && setZipFileName(e.target.files[0].name)}
                    className="hidden"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Taxonomy Section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 pb-2 uppercase tracking-tight text-neutral-800">
              3. Taxonomy
            </h2>
            
            {/* Custom Tag Input with + Button */}
            <div className="space-y-3">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500" htmlFor="custom_tag_input">
                Add Custom Tags
              </label>
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="custom_tag_input"
                    type="text"
                    placeholder="Type custom tag (e.g. ACID, GLITCH)..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    className="w-full bg-white border border-neutral-300 focus:border-black pl-8 pr-3 py-2 font-mono text-xs uppercase outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustomTag()}
                  className="bg-black text-white hover:opacity-90 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-opacity"
                  title="Add tag"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Selected Tags list */}
            {tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="block font-mono text-[9px] uppercase font-bold text-neutral-400">
                  Active Selected Tags ({tags.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white font-mono text-[10px] uppercase tracking-wider font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-neutral-300 cursor-pointer p-0.5"
                        title={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Available Preset Tags */}
            <div className="space-y-2 pt-2">
              <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500">
                Suggested Presets (Click to toggle)
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = tags.includes(tag.toUpperCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 border font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-200 text-neutral-800 border-neutral-400 font-bold'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bottom actions list */}
          <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-4 border-t border-neutral-200 md:items-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-mono text-xs border border-neutral-300 hover:border-black px-8 py-3 bg-white uppercase tracking-wider font-semibold cursor-pointer transition-colors"
            >
              Cancel Draft
            </button>
            <button
              type="submit"
              className="font-mono text-xs bg-black text-white px-8 py-3 hover:opacity-90 transition-all uppercase tracking-wider font-extrabold cursor-pointer"
            >
              Publish Kit
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
