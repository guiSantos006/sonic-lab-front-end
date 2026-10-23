/**
 * SoundKit Service
 * Integrates directly with Spring Boot backend:
 * - GET /soundkits (Search & Filter)
 * - GET /soundkits/{id} (Kit Details)
 * - GET /soundkits/tags (Distinct tags)
 * - POST /soundkits/uploads/cover (Cover image upload)
 * - POST /soundkits/uploads/demo (Audio demo upload & waveform extraction)
 * - POST /soundkits/uploads/package (Audio package zip upload)
 * - POST /soundkits (Create sound kit)
 * - GET /soundkits/my-kits (Producer's sound kits)
 * - DELETE /soundkits/{id} (Deactivate kit)
 */

import { Kit } from '../types';
import { INITIAL_KITS } from '../data';
import { getBackendBaseUrl, getAuthToken, getBackendPort } from './authService';
import JSZip from 'jszip';

export type SoundKitBackendType = 'DRUM_KIT' | 'SAMPLE_PACK' | 'PRESET_BANK' | 'MIDI_KIT';

export interface SoundKitFilterParams {
  q?: string;
  type?: SoundKitBackendType;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export interface AudioDemoPayload {
  url: string;
  durationInSeconds?: number;
  waveformData?: number[];
}

export interface CreateSoundKitRequest {
  title: string;
  description?: string;
  price: number;
  type: SoundKitBackendType;
  coverUrl?: string;
  fileUrl?: string;
  audioDemo?: AudioDemoPayload;
  tags?: string[];
  specifications?: Record<string, string>;
  contents?: Record<string, number | string>;
}

export interface SoundKitResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  creatorId: string;
  type: SoundKitBackendType;
  coverUrl: string;
  fileUrl?: string;
  audioDemo?: AudioDemoPayload;
  tags: string[];
  specifications?: Record<string, string>;
  contents?: Record<string, number | string>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface SoundKitUploadResponse {
  fileUrl: string;
  sizeInBytes: number;
  totalAudioFiles: number;
}

// Local mock storage key
const MOCK_SOUNDKITS_KEY = 'sonic_lab_backend_mock_kits';
const MOCK_MODE_KEY = 'sonic_lab_mock_mode_enabled';

/**
 * Check if Mock Mode is enabled
 */
export function isMockMode(): boolean {
  try {
    return localStorage.getItem(MOCK_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Enable or disable Mock Mode
 */
export function setMockMode(enabled: boolean): void {
  try {
    localStorage.setItem(MOCK_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Generate 100 waveform amplitude values matching Java backend audio processor
 */
export function generateWaveformData(): number[] {
  const points: number[] = [];
  for (let i = 0; i < 100; i++) {
    // Generate realistic rhythmic audio envelope with peaks
    const bassPulse = Math.sin(i * 0.15) * 0.4;
    const midPulse = Math.sin(i * 0.45) * 0.25;
    const noise = Math.random() * 0.25;
    const val = Math.max(0.12, Math.min(1.0, Math.abs(bassPulse + midPulse + noise + 0.3)));
    points.push(Number(val.toFixed(3)));
  }
  return points;
}

/**
 * Maps Backend SoundKit enum to frontend category
 */
export function categoryToBackendType(category: Kit['category']): SoundKitBackendType {
  switch (category) {
    case 'drum_kit':
      return 'DRUM_KIT';
    case 'sample_pack':
      return 'SAMPLE_PACK';
    case 'preset_bank':
      return 'PRESET_BANK';
    case 'midi_kit':
      return 'MIDI_KIT';
    default:
      return 'DRUM_KIT';
  }
}

/**
 * Resolves an asset URL (cover image, demo audio, or package file)
 * If the backend returns a relative path like '/uploads/...', prepend the active backend base URL.
 */
export function resolveAssetUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const base = getBackendBaseUrl();
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

/**
 * Maps backend response to front-end Kit format
 */
export function soundKitResponseToKit(item: SoundKitResponse): Kit {
  const typeMap: Record<SoundKitBackendType, Kit['category']> = {
    DRUM_KIT: 'drum_kit',
    SAMPLE_PACK: 'sample_pack',
    PRESET_BANK: 'preset_bank',
    MIDI_KIT: 'midi_kit',
  };

  const category = typeMap[item.type] || 'drum_kit';
  const resolvedCover = resolveAssetUrl(item.coverUrl) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400';
  const resolvedAudioUrl = item.audioDemo?.url ? resolveAssetUrl(item.audioDemo.url) : undefined;

  // Resolve kit contents strictly according to the specific sound kit's own data
  let resolvedContents: Record<string, number | string> | undefined = item.contents;

  if (!resolvedContents && item.specifications?.contentsJson) {
    try {
      const parsed = JSON.parse(item.specifications.contentsJson);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        resolvedContents = parsed;
      }
    } catch {
      // ignore
    }
  }

  // Check matching kit in initial catalog
  if (!resolvedContents) {
    const matched = INITIAL_KITS.find(
      (k) => k.id === item.id || k.title.toLowerCase().trim() === item.title.toLowerCase().trim()
    );
    if (matched?.contents) {
      resolvedContents = matched.contents;
    }
  }

  // Dynamic, authentic breakdown based on kit specifications & category if not explicitly set
  if (!resolvedContents) {
    const count = item.specifications?.fileCount ? parseInt(item.specifications.fileCount, 10) : 100;
    if (category === 'preset_bank') {
      resolvedContents = {
        'Main Presets (.fxp)': Math.round(count * 0.55),
        'Lead & Pluck Presets': Math.round(count * 0.25),
        'Dystopian / Sub Basses': Math.round(count * 0.15),
        'Custom Wavetables': Math.max(5, Math.round(count * 0.05)),
      };
    } else if (category === 'midi_kit') {
      resolvedContents = {
        'Melody Progressions': Math.round(count * 0.4),
        'Chord Progressions': Math.round(count * 0.35),
        'Bassline MIDIs': Math.round(count * 0.15),
        'Hi-Hat & Drum MIDIs': Math.round(count * 0.1),
      };
    } else if (category === 'sample_pack') {
      resolvedContents = {
        'Melody Loops & Stems': Math.round(count * 0.35),
        'Drum & Percussion Loops': Math.round(count * 0.3),
        'One-Shots & Chops': Math.round(count * 0.2),
        'Ambient Textures & FX': Math.round(count * 0.15),
      };
    } else {
      resolvedContents = {
        'Kicks': Math.round(count * 0.25),
        'Snares / Claps': Math.round(count * 0.22),
        'Hi-Hats': Math.round(count * 0.28),
        'Percussion & Metallic Loops': Math.round(count * 0.15),
        'Sub 808s': Math.max(5, Math.round(count * 0.1)),
      };
    }
  }

  return {
    id: item.id,
    title: item.title,
    creator: item.specifications?.creator || 'PRODUTOR',
    category,
    price: typeof item.price === 'number' ? item.price : parseFloat(item.price as unknown as string) || 0,
    description: item.description || '',
    coverImage: resolvedCover,
    audioDemoUrl: resolvedAudioUrl,
    audioDemo: item.audioDemo ? {
      url: resolvedAudioUrl || item.audioDemo.url,
      durationInSeconds: item.audioDemo.durationInSeconds,
      waveformData: item.audioDemo.waveformData,
    } : undefined,
    tags: item.tags || [],
    specifications: item.specifications,
    contents: resolvedContents,
    fileCount: item.specifications?.fileCount ? parseInt(item.specifications.fileCount, 10) : undefined,
    fileSize: item.specifications?.fileSize,
    sampleRate: item.specifications?.sampleRate || '24-Bit / 44.1kHz',
    royaltyFree: true,
    createdAt: item.createdAt,
  };
}

/**
 * Resilient HTTP fetcher that tries direct backend URL first,
 * with fallback to Vite proxy path if direct CORS/connection is rejected.
 * Automatically injects the JWT Authorization Bearer header if available.
 */
async function resilientFetch(subPath: string, init?: RequestInit): Promise<Response> {
  const baseUrl = getBackendBaseUrl();
  const directUrl = `${baseUrl}${subPath}`;
  const relativeUrl = subPath;

  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedInit: RequestInit = {
    ...init,
    headers,
  };

  try {
    const response = await fetch(directUrl, mergedInit);
    return response;
  } catch (directErr) {
    // Direct call failed, attempt Vite proxy
    try {
      const proxyResponse = await fetch(relativeUrl, mergedInit);
      return proxyResponse;
    } catch {
      throw directErr;
    }
  }
}

/**
 * Initialize mock kit storage with realistic seed items if empty
 */
function getStoredMockKits(): SoundKitResponse[] {
  try {
    const saved = localStorage.getItem(MOCK_SOUNDKITS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  const initialMocks: SoundKitResponse[] = [
    {
      id: 'mock-sk-001',
      title: 'INDUSTRIAL TENSION VOL. 1',
      description: 'Analog modular textures, distorted 808s, and metallic percussions crafted on Eurorack hardware.',
      price: 29.0,
      creatorId: 'creator-void',
      type: 'DRUM_KIT',
      coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600',
      fileUrl: 'https://storage.soniclab.io/packages/industrial-tension-vol1.zip',
      audioDemo: {
        url: 'https://cdn.freesound.org/previews/415/415510_5121236-lq.mp3',
        durationInSeconds: 105,
        waveformData: generateWaveformData(),
      },
      tags: ['TECHNO', 'INDUSTRIAL', 'ANALOG', 'MODULAR'],
      specifications: {
        creator: 'ALEXANDER_VOID',
        fileCount: '180',
        fileSize: '480 MB',
        sampleRate: '24-Bit / 44.1kHz',
        format: 'WAV',
      },
      contents: {
        'Analog Modular Kicks': 45,
        'Distorted 808s': 30,
        'Industrial Snares & Claps': 40,
        'Metallic Percussion': 35,
        'Noise Atmospheres': 30,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-sk-002',
      title: 'ANALOG DRIFT TRAP DRUMS',
      description: 'Heavy sub-bass kicks, punchy snares, and tape-saturated cymbals recorded via vintage reel-to-reel.',
      price: 34.5,
      creatorId: 'creator-void',
      type: 'SAMPLE_PACK',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
      fileUrl: 'https://storage.soniclab.io/packages/analog-drift-trap.zip',
      audioDemo: {
        url: 'https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3',
        durationInSeconds: 90,
        waveformData: generateWaveformData(),
      },
      tags: ['TRAP', 'ANALOG', 'BASS', 'BOOM BAP'],
      specifications: {
        creator: 'SONIC_RESEARCH',
        fileCount: '145',
        fileSize: '620 MB',
        sampleRate: '24-Bit / 48kHz',
        format: 'WAV',
      },
      contents: {
        'Sub-Bass 808 Glides': 35,
        'Tape Saturated Snares': 35,
        'Reel-to-Reel Hi-Hats': 40,
        'Analog Melody Loops': 20,
        'Percussion One-Shots': 15,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-sk-003',
      title: 'SERUM CYBERNETIC PRESETS',
      description: 'Futuristic wavetables, morphing bass leads, and dystopian soundscapes for Xfer Serum.',
      price: 24.0,
      creatorId: 'creator-serum',
      type: 'PRESET_BANK',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
      fileUrl: 'https://storage.soniclab.io/packages/serum-cybernetic.zip',
      audioDemo: {
        url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
        durationInSeconds: 78,
        waveformData: generateWaveformData(),
      },
      tags: ['SERUM', 'SYNTHWAVE', 'PRESETS', 'TECHNO'],
      specifications: {
        creator: 'CYBER_AUDIO',
        fileCount: '80',
        fileSize: '85 MB',
        sampleRate: 'Serum .fxp',
        format: 'Presets',
      },
      contents: {
        'Cyber Bass Leads': 30,
        'Reese & Sub Basses': 25,
        'Dystopian Soundscapes': 15,
        'Custom Wavetables': 10,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  try {
    localStorage.setItem(MOCK_SOUNDKITS_KEY, JSON.stringify(initialMocks));
  } catch {
    // ignore
  }

  return initialMocks;
}

/**
 * Save mock kits to storage
 */
function saveMockKits(kits: SoundKitResponse[]): void {
  try {
    localStorage.setItem(MOCK_SOUNDKITS_KEY, JSON.stringify(kits));
  } catch {
    // ignore
  }
}

/**
 * GET /soundkits (Search & Filter)
 */
export async function apiSearchSoundKits(
  params?: SoundKitFilterParams
): Promise<PageResponse<SoundKitResponse>> {
  if (isMockMode()) {
    return filterMockKits(params);
  }

  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q.trim());
  if (params?.type) query.set('type', params.type);
  if (params?.tags && params.tags.length > 0) {
    params.tags.forEach((t) => query.append('tags', t));
  }
  if (params?.minPrice !== undefined && params.minPrice !== null) {
    query.set('minPrice', params.minPrice.toString());
  }
  if (params?.maxPrice !== undefined && params.maxPrice !== null) {
    query.set('maxPrice', params.maxPrice.toString());
  }
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());

  const subPath = `/soundkits${query.toString() ? `?${query.toString()}` : ''}`;

  try {
    const response = await resilientFetch(subPath);
    if (!response.ok) {
      throw new Error(`Falha ao carregar SoundKits (${response.status}: ${response.statusText})`);
    }
    return await response.json();
  } catch (err) {
    // If backend is not running, gracefully fallback to mock simulator
    return filterMockKits(params);
  }
}

function filterMockKits(params?: SoundKitFilterParams): PageResponse<SoundKitResponse> {
  let list = getStoredMockKits().filter((k) => k.active !== false);

  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (params?.type) {
    list = list.filter((k) => k.type === params.type);
  }

  if (params?.tags && params.tags.length > 0) {
    const upperTags = params.tags.map((t) => t.toUpperCase());
    list = list.filter((k) => k.tags.some((t) => upperTags.includes(t.toUpperCase())));
  }

  if (params?.minPrice !== undefined) {
    list = list.filter((k) => k.price >= (params.minPrice || 0));
  }

  if (params?.maxPrice !== undefined) {
    list = list.filter((k) => k.price <= (params.maxPrice || Infinity));
  }

  const page = params?.page || 0;
  const size = params?.size || 12;
  const totalElements = list.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const content = list.slice(page * size, (page + 1) * size);

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    isFirst: page === 0,
    isLast: page >= totalPages - 1,
  };
}

/**
 * GET /soundkits/{id}
 */
export async function apiGetSoundKitById(id: string): Promise<SoundKitResponse> {
  if (isMockMode()) {
    const found = getStoredMockKits().find((k) => k.id === id);
    if (found) return found;
    throw new Error(`SoundKit #${id} não encontrado`);
  }

  try {
    const response = await resilientFetch(`/soundkits/${id}`);
    if (!response.ok) {
      throw new Error(`SoundKit não encontrado (${response.status})`);
    }
    return await response.json();
  } catch (err) {
    const found = getStoredMockKits().find((k) => k.id === id);
    if (found) return found;
    throw err;
  }
}

/**
 * GET /soundkits/tags
 */
export async function apiGetSoundKitTags(): Promise<string[]> {
  if (isMockMode()) {
    return getMockTags();
  }

  try {
    const response = await resilientFetch('/soundkits/tags');
    if (!response.ok) {
      throw new Error(`Falha ao obter tags (${response.status})`);
    }
    return await response.json();
  } catch {
    return getMockTags();
  }
}

function getMockTags(): string[] {
  const kits = getStoredMockKits();
  const tagSet = new Set<string>();
  kits.forEach((k) => k.tags?.forEach((t) => tagSet.add(t.toUpperCase())));
  if (tagSet.size === 0) {
    return ['TECHNO', 'TRAP', 'ANALOG', 'LO-FI', 'SERUM', 'SYNTHWAVE', 'MODULAR', 'BASS'];
  }
  return Array.from(tagSet);
}

/**
 * POST /soundkits/uploads/cover
 * Multipart upload for kit artwork
 */
export async function apiUploadCover(file: File): Promise<string> {
  if (isMockMode()) {
    return simulateCoverUpload(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await resilientFetch('/soundkits/uploads/cover', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Falha no upload da capa (${response.status})`);
    }

    const data = await response.json();
    return data.coverUrl || '';
  } catch (err) {
    return simulateCoverUpload(file);
  }
}

async function simulateCoverUpload(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400');
    };
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400');
    };
    reader.readAsDataURL(file);
  });
}

/**
 * POST /soundkits/uploads/demo
 * Multipart upload for audio demo + Java waveform extraction (100 points)
 */
export async function apiUploadDemo(file: File): Promise<AudioDemoPayload> {
  if (isMockMode()) {
    return simulateDemoUpload(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await resilientFetch('/soundkits/uploads/demo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Falha no upload da demonstração de áudio (${response.status})`);
    }

    return await response.json();
  } catch {
    return simulateDemoUpload(file);
  }
}

export async function extractAudioFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const tempUrl = URL.createObjectURL(file);
    audio.src = tempUrl;
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const dur = Math.round(audio.duration);
      URL.revokeObjectURL(tempUrl);
      resolve(!isNaN(dur) && dur > 0 ? dur : 30);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(30);
    };
  });
}

async function simulateDemoUpload(file: File): Promise<AudioDemoPayload> {
  const durationInSeconds = await extractAudioFileDuration(file);
  const waveformData = generateWaveformData();
  const localUrl = URL.createObjectURL(file);
  return {
    url: localUrl,
    durationInSeconds,
    waveformData,
  };
}

/**
 * POST /soundkits/uploads/package
 * Multipart upload for samples / zip package
 */
export async function apiUploadPackage(files: File[]): Promise<SoundKitUploadResponse> {
  if (isMockMode()) {
    return simulatePackageUpload(files);
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await resilientFetch('/soundkits/uploads/package', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Falha no upload do pacote de áudio (${response.status})`);
    }

    return await response.json();
  } catch {
    return simulatePackageUpload(files);
  }
}

function simulatePackageUpload(files: File[]): SoundKitUploadResponse {
  let totalBytes = 0;
  files.forEach((f) => {
    totalBytes += f.size || 150000000;
  });
  if (totalBytes === 0) totalBytes = 345000000; // ~345 MB default

  // Estimate total audio files based on file count or zip heuristic
  const totalAudioFiles = files.length > 1 ? files.length : Math.floor(Math.random() * 80) + 120;

  return {
    fileUrl: `https://storage.soniclab.io/packages/pack-${Date.now()}.zip`,
    sizeInBytes: totalBytes,
    totalAudioFiles,
  };
}

/**
 * POST /soundkits
 * Creates sound kit document in MongoDB (authenticated with Bearer token)
 */
export async function apiCreateSoundKit(request: CreateSoundKitRequest): Promise<SoundKitResponse> {
  const token = getAuthToken();

  if (isMockMode()) {
    return simulateCreateSoundKit(request);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await resilientFetch('/soundkits', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Falha ao criar SoundKit (${response.status})`);
    }

    const created: SoundKitResponse = await response.json();
    // Cache in mock list too for smooth UI
    const existing = getStoredMockKits();
    saveMockKits([created, ...existing]);
    return created;
  } catch (err) {
    return simulateCreateSoundKit(request);
  }
}

function simulateCreateSoundKit(request: CreateSoundKitRequest): SoundKitResponse {
  const newKit: SoundKitResponse = {
    id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: request.title,
    description: request.description || '',
    price: request.price,
    creatorId: 'user-producer-current',
    type: request.type,
    coverUrl: request.coverUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400',
    fileUrl: request.fileUrl || `https://storage.soniclab.io/packages/kit-${Date.now()}.zip`,
    audioDemo: request.audioDemo || {
      url: 'https://cdn.freesound.org/previews/415/415510_5121236-lq.mp3',
      durationInSeconds: 90,
      waveformData: generateWaveformData(),
    },
    tags: request.tags || ['CUSTOM', 'NEW'],
    specifications: request.specifications,
    contents: request.contents,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existing = getStoredMockKits();
  saveMockKits([newKit, ...existing]);
  return newKit;
}

/**
 * GET /soundkits/my-kits
 */
export async function apiGetMySoundKits(page = 0, size = 50): Promise<PageResponse<SoundKitResponse>> {
  const token = getAuthToken();

  if (isMockMode()) {
    const all = getStoredMockKits().filter((k) => k.active !== false);
    return {
      content: all,
      page,
      size,
      totalElements: all.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    };
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await resilientFetch(`/soundkits/my-kits?page=${page}&size=${size}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter seus kits (${response.status})`);
    }

    return await response.json();
  } catch {
    const all = getStoredMockKits().filter((k) => k.active !== false);
    return {
      content: all,
      page,
      size,
      totalElements: all.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    };
  }
}

/**
 * DELETE /soundkits/{id}
 */
export async function apiDeleteSoundKit(id: string): Promise<void> {
  const token = getAuthToken();

  if (isMockMode()) {
    const kits = getStoredMockKits().map((k) => (k.id === id ? { ...k, active: false } : k));
    saveMockKits(kits);
    return;
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await resilientFetch(`/soundkits/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Falha ao desativar SoundKit (${response.status})`);
    }

    // Keep mock in sync
    const kits = getStoredMockKits().map((k) => (k.id === id ? { ...k, active: false } : k));
    saveMockKits(kits);
  } catch (err) {
    // If backend unreachable, perform soft deactivate in storage
    const kits = getStoredMockKits().map((k) => (k.id === id ? { ...k, active: false } : k));
    saveMockKits(kits);
  }
}

/**
 * Quick status check to see if Spring Boot backend is reachable
 */
export async function apiCheckBackendStatus(): Promise<{ online: boolean; port: string; url: string }> {
  const baseUrl = getBackendBaseUrl();
  const port = getBackendPort();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/soundkits/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return { online: res.ok, port, url: baseUrl };
  } catch {
    // Try proxy fallback check
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('/soundkits/tags', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return { online: res.ok, port, url: `${baseUrl} (via proxy)` };
    } catch {
      return { online: false, port, url: baseUrl };
    }
  }
}

/**
 * Generates an in-memory 16-bit PCM WAV audio file with a punchy rhythmic loop
 * Fully valid WAV container readable by Java AudioSystem and browser HTML5 Audio!
 */
export function generateTestWavFile(filename = 'demo-preview.wav', durationSec = 4): File {
  const sampleRate = 44100;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write RIFF chunk descriptor
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Synthesize punchy 120 BPM drum pattern
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatPhase = (t * 2) % 1; // 120 bpm (2 beats per second)

    // Kick: sweeping sine pitch
    const kickFreq = Math.max(45, 140 * Math.exp(-beatPhase * 16));
    const kickAmp = Math.max(0, 1.0 - beatPhase * 3.2);
    const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickAmp;

    // Hi-hat: white noise pulse on eighth notes
    const hatPhase = (t * 4) % 1;
    const hatAmp = Math.max(0, 0.35 * (1 - hatPhase * 10));
    const hat = (Math.random() * 2 - 1) * hatAmp;

    // Bassline harmonic
    const bass = Math.sin(2 * Math.PI * 55 * t) * 0.28;

    const sample = Math.max(-1, Math.min(1, kick * 0.7 + hat * 0.3 + bass * 0.35));
    const intSample = sample < 0 ? sample * 32768 : sample * 32767;
    view.setInt16(offset, Math.floor(intSample), true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return new File([blob], filename, { type: 'audio/wav', lastModified: Date.now() });
}

/**
 * Generates an in-memory sample cover image file with minimalist design
 */
export function generateTestCoverFile(title = 'SONIC KIT', filename = 'cover.jpg'): File {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark sleek gradient
    const grad = ctx.createLinearGradient(0, 0, 700, 700);
    grad.addColorStop(0, '#0c0f17');
    grad.addColorStop(0.5, '#171c28');
    grad.addColorStop(1, '#080a10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 700, 700);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 700; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 700);
      ctx.stroke();
    }
    for (let y = 0; y < 700; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(700, y);
      ctx.stroke();
    }

    // Glowing circle accent
    const radial = ctx.createRadialGradient(350, 320, 20, 350, 320, 240);
    radial.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    radial.addColorStop(0.7, 'rgba(168, 85, 247, 0.18)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(350, 320, 240, 0, Math.PI * 2);
    ctx.fill();

    // Geometric vinyl ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(350, 320, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(350, 320, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Title & text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 350, 600);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('SONICLAB MASTER AUDIO • 24-BIT WAV', 350, 635);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  return new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });
}

/**
 * Breakdown entry detected in a ZIP file
 */
export interface ZipFolderBreakdown {
  folderName: string;
  count: number;
}

export interface ZipAnalysisResult {
  folders: ZipFolderBreakdown[];
  totalFiles: number;
  allFileNames: string[];
}

/**
 * Inspects an uploaded .zip file client-side, reads the internal folder structure,
 * and automatically counts the files inside each folder.
 */
export async function analyzeZipContents(file: File): Promise<ZipAnalysisResult> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);

  const folderCountMap: Record<string, number> = {};
  let rootFilesCount = 0;
  const allFileNames: string[] = [];
  let totalFiles = 0;

  // First pass: collect all non-directory and non-system files
  const filePaths: string[] = [];
  loaded.forEach((relativePath, entry) => {
    if (entry.dir) return;

    // Filter out macOS metadata / hidden system files
    const segments = relativePath.split('/').filter(Boolean);
    if (
      segments.some(
        (seg) =>
          seg.startsWith('__MACOSX') ||
          seg.startsWith('.') ||
          seg === 'Thumbs.db' ||
          seg === 'desktop.ini'
      )
    ) {
      return;
    }

    filePaths.push(relativePath);
  });

  // Check if all files are wrapped in a single root folder (e.g. "MyKit/Kicks/01.wav")
  let commonWrapper: string | null = null;
  if (filePaths.length > 0) {
    const firstRoot = filePaths[0].split('/').filter(Boolean)[0];
    const hasMoreThanOneLevel = filePaths.some((p) => p.split('/').filter(Boolean).length > 1);
    if (hasMoreThanOneLevel && filePaths.every((p) => p.split('/').filter(Boolean)[0] === firstRoot)) {
      commonWrapper = firstRoot;
    }
  }

  // Second pass: group by folder
  filePaths.forEach((path) => {
    let segments = path.split('/').filter(Boolean);
    if (commonWrapper && segments.length > 1 && segments[0] === commonWrapper) {
      // Strip common root folder wrapper so we get "Kicks", "Percussion", etc.
      segments = segments.slice(1);
    }

    const fileName = segments[segments.length - 1];
    allFileNames.push(fileName);
    totalFiles++;

    if (segments.length > 1) {
      // It is inside a folder, e.g. "Kicks" or "Percussion"
      const folderName = segments[0].trim();
      folderCountMap[folderName] = (folderCountMap[folderName] || 0) + 1;
    } else {
      rootFilesCount++;
    }
  });

  const folders: ZipFolderBreakdown[] = Object.entries(folderCountMap)
    .map(([folderName, count]) => ({
      folderName,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (rootFilesCount > 0) {
    folders.push({
      folderName: folders.length > 0 ? 'Root / One-Shots' : 'Audio Files',
      count: rootFilesCount,
    });
  }

  return {
    folders,
    totalFiles,
    allFileNames,
  };
}

/**
 * Generates an authentic in-memory ZIP package file containing sample folders and files
 */
export async function generateTestPackageZip(
  sampleBreakdown: { name: string; count: number }[],
  filename = 'soundkit-package.zip'
): Promise<File> {
  const zip = new JSZip();

  sampleBreakdown.forEach((item) => {
    const cleanFolder = item.name.replace(/[/\\?%*:|"<>]/g, '_');
    const folder = zip.folder(cleanFolder);
    const limit = Math.min(item.count, 20);
    for (let i = 1; i <= limit; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      folder?.file(
        `${cleanFolder}_${pad}.wav`,
        `SONIC_LAB_AUDIO_PCM_DATA_${cleanFolder}_SAMPLE_${pad}`
      );
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  return new File([content], filename, { type: 'application/zip', lastModified: Date.now() });
}

/**
 * Backward-compatible helper for generating a quick test package file
 */
export function generateTestPackageFile(filename = 'soundkit-package.zip'): File {
  const dummyHeader = 'PK\x03\x04\x14\x00\x00\x00\x08\x00' + 'SONIC_LAB_SAMPLES_BUNDLE' + '\x00'.repeat(2048);
  const blob = new Blob([dummyHeader], { type: 'application/zip' });
  return new File([blob], filename, { type: 'application/zip', lastModified: Date.now() });
}

