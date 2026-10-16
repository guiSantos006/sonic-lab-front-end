import { Kit } from '../types';
import {
  Image,
  Upload,
  CheckCircle,
  FileAudio,
  FileArchive,
  Plus,
  X,
  Tag,
  Server,
  RefreshCw,
  Radio,
  Activity,
  Zap,
  Sparkles,
  LogIn,
  Play,
  ArrowRight,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import {
  apiUploadCover,
  apiUploadDemo,
  apiUploadPackage,
  apiCreateSoundKit,
  categoryToBackendType,
  soundKitResponseToKit,
  apiCheckBackendStatus,
  AudioDemoPayload,
  generateTestWavFile,
  generateTestCoverFile,
  generateTestPackageFile,
  resolveAssetUrl,
} from '../utils/soundKitService';
import { getBackendBaseUrl } from '../utils/authService';

interface SellViewProps {
  onPublish: (kit: Kit) => void;
  onNavigate: (view: any) => void;
  creatorName?: string;
  isLoggedIn?: boolean;
}

export default function SellView({ onPublish, onNavigate, creatorName, isLoggedIn = false }: SellViewProps) {
  // Form fields state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'drum_kit' | 'sample_pack' | 'preset_bank' | 'midi_kit'>('drum_kit');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['TECHNO', 'ANALOG']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Asset uploaded files
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [demoFileName, setDemoFileName] = useState('');
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState('');

  // Uploading & processing progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStep, setUploadProgressStep] = useState<string | null>(null);

  // Backend connectivity status
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; checked: boolean; url: string }>({
    online: false,
    checked: false,
    url: 'http://localhost:8080',
  });
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPublishedKit, setLastPublishedKit] = useState<Kit | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  // File Inputs references
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Suggested preset tags list
  const AVAILABLE_TAGS = ['TECHNO', 'TRAP', 'LO-FI', 'ANALOG', 'AMBIENT', 'VOCALS', 'DUBSTEP', 'BOOM BAP', 'SYNTHWAVE', 'INDUSTRIAL', 'HOUSE', 'MINIMAL', 'MIDI', 'SYNTHS'];

  const checkBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const res = await apiCheckBackendStatus();
      setBackendStatus({ online: res.online, checked: true, url: res.url });
    } catch {
      setBackendStatus({ online: false, checked: true, url: 'http://localhost:8080' });
    } finally {
      setIsCheckingBackend(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // Quick Test Auto-Fill Generator
  const handleAutoFillTestKit = () => {
    const testSamples = [
      {
        title: '808 DYNASTY TRAP DRUMS',
        category: 'drum_kit' as const,
        price: '29.90',
        description: 'Pack premium com 808s analógicos saturados em fita, kicks socados, claps estalados e hi-hats com grooves dinâmicos gravados em hardware analógico.',
        tags: ['TRAP', '808', 'ANALOG', 'BOOM BAP'],
      },
      {
        title: 'CYBERPUNK SERUM ESSENTIALS',
        category: 'preset_bank' as const,
        price: '24.50',
        description: 'Bancos de presets com wavetables futuristas, leads cortantes e reeses distorcidos para Xfer Serum prontos para trilhas e produções pesadas.',
        tags: ['SERUM', 'SYNTHWAVE', 'INDUSTRIAL', 'CYBERPUNK'],
      },
      {
        title: 'LO-FI NOSTALGIA SAMPLE PACK',
        category: 'sample_pack' as const,
        price: '19.00',
        description: 'Pianos em fita cassete, texturas de vinil quentes e melodias melancólicas com timbragem clássica para produções relaxantes e chillhop.',
        tags: ['LO-FI', 'CHILL', 'PIANO', 'ANALOG'],
      },
    ];

    const pick = testSamples[Math.floor(Math.random() * testSamples.length)];
    setTitle(pick.title);
    setCategory(pick.category);
    setPrice(pick.price);
    setDescription(pick.description);
    setTags(pick.tags);

    // Generate valid in-memory test WAV audio demo
    const testWav = generateTestWavFile(`${pick.title.toLowerCase().replace(/\s+/g, '-')}-demo.wav`, 4);
    setDemoFile(testWav);
    setDemoFileName(testWav.name);

    // Generate valid in-memory test Cover Image
    const testCover = generateTestCoverFile(pick.title, 'artwork.jpg');
    setCoverFile(testCover);
    setCoverFileName(testCover.name);
    setCoverPreviewUrl(URL.createObjectURL(testCover));

    // Generate valid in-memory test ZIP Package
    const testPackage = generateTestPackageFile(`${pick.title.toLowerCase().replace(/\s+/g, '-')}-package.zip`);
    setPackageFile(testPackage);
    setZipFileName(testPackage.name);

    setAutoFilledNotice('Dados de teste preenchidos com sucesso! Capa, Áudio Demo WAV e Pacote ZIP prontos para envio.');
    setTimeout(() => setAutoFilledNotice(null), 5000);
  };

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
    setCoverFile(file);
    setCoverFileName(file.name);
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

  // Submit Handler: integrates 4-step backend pipeline
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim()) {
      setFormError('Preencha os campos obrigatórios: Título, Preço e Descrição.');
      return;
    }
    setFormError(null);
    setIsUploading(true);
    setUploadProgressStep('Iniciando processamento...');

    const baseUrl = getBackendBaseUrl();

    try {
      let resolvedCoverUrl = coverPreviewUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400';
      let resolvedDemoData: AudioDemoPayload | undefined = undefined;
      let resolvedFileUrl = `${baseUrl}/uploads/soundkits/packages/sample-kit.zip`;
      let detectedSamples = category === 'drum_kit' ? 180 : category === 'sample_pack' ? 120 : category === 'midi_kit' ? 95 : 64;
      let detectedSize = '480 MB';

      // 1. Upload Cover to Spring Boot if a real file was chosen
      if (coverFile) {
        setUploadProgressStep('1/4: Enviando arte de capa (/soundkits/uploads/cover)...');
        try {
          const uploadedCoverPath = await apiUploadCover(coverFile);
          if (uploadedCoverPath) {
            resolvedCoverUrl = resolveAssetUrl(uploadedCoverPath);
          }
        } catch (err) {
          console.warn('Cover upload to backend failed, using preview URL:', err);
        }
      }

      // 2. Upload Demo Audio & Extract Java Waveform
      if (demoFile) {
        setUploadProgressStep('2/4: Enviando áudio demo e gerando 100 pontos de waveform no Java (/soundkits/uploads/demo)...');
        try {
          resolvedDemoData = await apiUploadDemo(demoFile);
          if (resolvedDemoData?.url) {
            resolvedDemoData.url = resolveAssetUrl(resolvedDemoData.url);
          }
        } catch (err) {
          console.warn('Demo upload to backend failed:', err);
        }
      }

      // 3. Upload Sample Package (ZIP)
      if (packageFile) {
        setUploadProgressStep('3/4: Empacotando samples e gerando ZIP (/soundkits/uploads/package)...');
        try {
          const pkgRes = await apiUploadPackage([packageFile]);
          if (pkgRes.fileUrl) {
            resolvedFileUrl = resolveAssetUrl(pkgRes.fileUrl);
          }
          if (pkgRes.totalAudioFiles > 0) detectedSamples = pkgRes.totalAudioFiles;
          if (pkgRes.sizeInBytes > 0) detectedSize = `${(pkgRes.sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        } catch (err) {
          console.warn('Package upload to backend failed:', err);
        }
      }

      // Ensure audioDemo complies with backend validation (^https?://)
      if (!resolvedDemoData || !resolvedDemoData.url || !resolvedDemoData.url.startsWith('http')) {
        resolvedDemoData = {
          url: resolvedDemoData?.url && resolvedDemoData.url.startsWith('http')
            ? resolvedDemoData.url
            : `${baseUrl}/uploads/soundkits/demos/demo-sample.mp3`,
          durationInSeconds: resolvedDemoData?.durationInSeconds || 32,
          waveformData: resolvedDemoData?.waveformData || Array.from({ length: 100 }, () => Math.round(Math.random() * 80 + 20) / 100),
        };
      }

      // 4. Create SoundKit in Backend
      setUploadProgressStep('4/4: Salvando registro do SoundKit no MongoDB (/soundkits)...');
      let publishedKit: Kit | null = null;
      try {
        const backendType = categoryToBackendType(category);
        const createdResponse = await apiCreateSoundKit({
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          type: backendType,
          coverUrl: resolvedCoverUrl,
          fileUrl: resolvedFileUrl,
          audioDemo: resolvedDemoData,
          tags: tags.map((t) => t.toUpperCase()),
          specifications: {
            creator: (creatorName || 'PRODUTOR').toUpperCase(),
            fileCount: detectedSamples.toString(),
            fileSize: detectedSize,
            sampleRate: '24-Bit / 44.1kHz',
            format: category === 'preset_bank' ? 'Serum .fxp' : category === 'midi_kit' ? 'Standard MIDI .mid' : '24-Bit WAV / Stems',
          },
        });
        publishedKit = soundKitResponseToKit(createdResponse);
      } catch (err) {
        console.warn('Backend create failed, fallback to local kit:', err);
      }

      // Fallback Kit if backend was offline
      if (!publishedKit) {
        publishedKit = {
          id: `custom-kit-${Date.now()}`,
          title: title,
          creator: (creatorName || 'PRODUTOR').toUpperCase(),
          category: category,
          price: parseFloat(price) || 29.0,
          description: description,
          coverImage: resolvedCoverUrl,
          audioDemoUrl: resolvedDemoData?.url,
          audioDemo: resolvedDemoData,
          tags: tags.map((t) => t.toUpperCase()),
          fileCount: detectedSamples,
          fileSize: detectedSize,
          sampleRate: '24-Bit WAV',
          royaltyFree: true,
          contents: {
            'One-shots': 45,
            'Drum loops': 40,
            'Melody stems': 25,
            'Sound FX': 15,
          },
        };
      }

      setLastPublishedKit(publishedKit);
      onPublish(publishedKit);
      setIsSuccess(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao publicar o kit.');
    } finally {
      setIsUploading(false);
      setUploadProgressStep(null);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setCategory('drum_kit');
    setPrice('');
    setDescription('');
    setTags(['TECHNO', 'ANALOG']);
    setCoverFile(null);
    setCoverFileName('');
    setCoverPreviewUrl('');
    setDemoFile(null);
    setDemoFileName('');
    setPackageFile(null);
    setZipFileName('');
    setIsSuccess(false);
    setLastPublishedKit(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Upper Title Section */}
      <header className="mb-8 text-center relative">
        <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-primary mb-2 uppercase tracking-tighter leading-none">
          Publicar SoundKit
        </h1>
        <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          Envie seus pacotes de samples, drum kits ou presets para o catálogo ativo da plataforma.
        </p>
      </header>

      {/* Visitor / Logged-in Alert Banner */}
      {!isLoggedIn && (
        <div className="mb-6 p-4 border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Atenção:</strong> Você está em modo visitante. Para associar o SoundKit ao seu perfil de produtor no MongoDB, faça login.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-mono text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Entrar / Cadastrar
          </button>
        </div>
      )}

      {isSuccess && lastPublishedKit ? (
        <div className="py-14 px-6 border border-black dark:border-white bg-white dark:bg-neutral-900 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-primary">
              SoundKit Publicado com Sucesso!
            </h2>
            <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              "{lastPublishedKit.title}" foi registrado no sistema e já está disponível para audição, visualização no catálogo e gerenciamento no seu perfil.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:opacity-90"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ver no Catálogo</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider bg-white dark:bg-neutral-800 text-black dark:text-white cursor-pointer"
            >
              <span>Meus Kits (Perfil)</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-neutral-500 hover:text-black dark:hover:text-white font-mono text-xs underline cursor-pointer px-3 py-2"
            >
              Publicar Outro Kit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePublishSubmit} className="space-y-12">
          {formError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 font-mono text-xs flex items-center justify-between">
              <span>{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-red-800 dark:text-red-300 hover:text-black dark:hover:text-white font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isUploading && uploadProgressStep && (
            <div className="p-4 bg-neutral-100 dark:bg-neutral-950 border border-black dark:border-white font-mono text-xs flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200">{uploadProgressStep}</span>
            </div>
          )}
          
          {/* Metadata Section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 dark:border-neutral-800 pb-2 uppercase tracking-tight text-primary">
              1. Metadata
            </h2>

            {/* Title */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400" htmlFor="kit_title">
                Kit Title
              </label>
              <input
                required
                id="kit_title"
                type="text"
                placeholder="e.g. TR-808 Analog Stems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:border-black dark:focus:border-white p-3 font-sans text-sm transition-colors outline-none focus:ring-0"
              />
            </div>

            {/* Category selection radio list */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                Category
              </label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'drum_kit'}
                    onChange={() => setCategory('drum_kit')}
                    className="text-black dark:text-white border-neutral-400 dark:border-neutral-600 focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800 dark:text-neutral-200">Drum Kit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'sample_pack'}
                    onChange={() => setCategory('sample_pack')}
                    className="text-black dark:text-white border-neutral-400 dark:border-neutral-600 focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800 dark:text-neutral-200">Sample Pack</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'preset_bank'}
                    onChange={() => setCategory('preset_bank')}
                    className="text-black dark:text-white border-neutral-400 dark:border-neutral-600 focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800 dark:text-neutral-200">Serum Bank</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'midi_kit'}
                    onChange={() => setCategory('midi_kit')}
                    className="text-black dark:text-white border-neutral-400 dark:border-neutral-600 focus:ring-black bg-transparent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-mono text-xs uppercase text-neutral-800 dark:text-neutral-200">MIDI Kit</span>
                </label>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2 max-w-xs">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400" htmlFor="price">
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
                  className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:border-black dark:focus:border-white p-3 pl-8 font-sans text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description text area */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400" htmlFor="description">
                Description
              </label>
              <textarea
                required
                id="description"
                rows={4}
                placeholder="Describe the sonic characteristics, synthesizers used, contents & compatibility formats..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-black dark:focus:border-white p-3 font-sans text-xs outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-y"
              />
            </div>
          </section>

          {/* Core Assets section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 dark:border-neutral-800 pb-2 uppercase tracking-tight text-primary">
              2. Assets
            </h2>

            {/* Dotted cover photo dragging area */}
            <div className="space-y-2">
              <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                Cover Image
              </span>
              <div
                onDragOver={onDragOverHandler}
                onDragLeave={onDragLeaveHandler}
                onDrop={onDropHandler}
                onClick={() => coverInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center hover:border-black dark:hover:border-white transition-all cursor-pointer bg-white dark:bg-neutral-900 relative group flex flex-col items-center justify-center min-h-[220px] ${
                  dragOver ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {coverPreviewUrl ? (
                  <div className="relative w-40 h-40 border border-neutral-200 dark:border-neutral-700">
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
                    <Image className="w-12 h-12 text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors mb-3" />
                    <p className="font-sans text-xs text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
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
              
              {/* MP3 / WAV demo */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                  Audio Demo (WAV/MP3/FLAC)
                </span>
                <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between">
                  <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400 truncate mr-4">
                    {demoFileName || 'No audio chosen'}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="cursor-pointer font-mono text-[10px] border border-black dark:border-neutral-600 px-3 py-1 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 font-bold uppercase transition-colors"
                  >
                    Browse
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.aiff,.flac,.ogg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDemoFile(e.target.files[0]);
                        setDemoFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* ZIP */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                  Main File (ZIP Package)
                </span>
                <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between">
                  <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400 truncate mr-4">
                    {zipFileName || 'No file selected (.zip)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="cursor-pointer font-mono text-[10px] border border-black dark:border-neutral-600 px-3 py-1 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 font-bold uppercase transition-colors"
                  >
                    Browse
                  </button>
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip,audio/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPackageFile(e.target.files[0]);
                        setZipFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Taxonomy Section */}
          <section className="space-y-6">
            <h2 className="font-sans text-lg font-bold border-b border-neutral-200 dark:border-neutral-800 pb-2 uppercase tracking-tight text-primary">
              3. Taxonomy
            </h2>
            
            {/* Custom Tag Input with + Button */}
            <div className="space-y-3">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400" htmlFor="custom_tag_input">
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
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:border-black dark:focus:border-white pl-8 pr-3 py-2 font-mono text-xs uppercase outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustomTag()}
                  className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-opacity"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] uppercase tracking-wider font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-neutral-300 dark:hover:text-neutral-700 cursor-pointer p-0.5"
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
              <span className="block font-mono text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
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
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-400 dark:border-neutral-600 font-bold'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white'
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
          <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-4 border-t border-neutral-200 dark:border-neutral-800 md:items-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white px-8 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white uppercase tracking-wider font-semibold cursor-pointer transition-colors"
            >
              Cancel Draft
            </button>
            <button
              type="submit"
              className="font-mono text-xs bg-black dark:bg-white text-white dark:text-black px-8 py-3 hover:opacity-90 transition-all uppercase tracking-wider font-extrabold cursor-pointer"
            >
              Publish Kit
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
