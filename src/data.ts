import { Kit, UserProfile } from './types';

export const INITIAL_KITS: Kit[] = [];

export const PRESET_ITEMS = [
  { id: 'neuro-bass', title: 'Neuro Bass', category: 'Dubstep / Bass', count: '50 Presets', icon: 'memory' },
  { id: 'lush-pads', title: 'Lush Pads', category: 'Ambient / Chill', count: '85 Presets', icon: 'waves' },
  { id: 'tech-plucks', title: 'Tech House Plucks', category: 'Tech House', count: '64 Presets', icon: 'bolt' },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'PRODUCER',
  role: 'SOUND DESIGNER',
  location: 'STUDIO',
  bio: 'Criador e produtor musical independente no ecossistema SONIC_LAB.',
  avatar: ''
};

export const PURCHASED_KITS_MOCK: any[] = [];

