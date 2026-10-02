export interface Kit {
  id: string;
  title: string;
  creator: string;
  category: 'drum_kit' | 'sample_pack' | 'preset_bank';
  price: number;
  bpm?: number;
  key?: string;
  description: string;
  coverImage: string;
  audioDemoUrl?: string;
  fileCount?: number;
  tags: string[];
  contents?: {
    [key: string]: number;
  };
  fileSize?: string;
  sampleRate?: string;
  royaltyFree?: boolean;
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
