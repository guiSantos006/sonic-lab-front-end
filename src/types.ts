export interface AudioDemoData {
  url: string;
  durationInSeconds?: number;
  waveformData?: number[];
}

export interface Kit {
  id: string;
  title: string;
  creator: string;
  category: 'drum_kit' | 'sample_pack' | 'preset_bank' | 'midi_kit';
  price: number;
  bpm?: number;
  key?: string;
  description: string;
  coverImage: string;
  audioDemoUrl?: string;
  audioDemo?: AudioDemoData;
  fileCount?: number;
  tags: string[];
  contents?: {
    [key: string]: number;
  };
  fileSize?: string;
  sampleRate?: string;
  royaltyFree?: boolean;
  specifications?: Record<string, string>;
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  location: string;
  bio: string;
  avatar: string;
  email?: string;
  token?: string;
}

export type ThemeMode = 'light' | 'dark';

export type ViewType = 'home' | 'catalog' | 'sell' | 'details' | 'profile' | 'login' | 'register';
