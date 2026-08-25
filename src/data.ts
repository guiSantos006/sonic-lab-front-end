import { Kit, UserProfile } from './types';

export const INITIAL_KITS: Kit[] = [
  {
    id: 'industrial-tech-vol1',
    title: 'Industrial Tech Vol.1',
    creator: 'KINETIC SOUNDS',
    category: 'drum_kit',
    price: 24,
    bpm: 120,
    key: 'F Minor',
    description: 'A stark collection of raw hardware drum sounds and mechanical sequences optimized for industrial techno.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-77CZMVvvF5AxOFIDIJP7FSkkW_oYvQemW77GvDEgLeII9QoEwVjiRRGQwl9-o8gJkEhapwqmO5qOg1GnqRplPcMn62ykU5L2FCIfxSA7tYGM5UIumZm2_ZV62hIz3NZMIneoqQE77i15Kp58ExZ_oB4SqlNnUu3fZf1hppb3tL3KFTvIUo-MPU9ykOQXL4incXkz7hBb8SVKdAcCnTO4pIUur9ju418JrPCFmwqN9KruDQsqnKuaCvUVGXDdlfOp8TjKrTJ3rybe',
    fileCount: 240,
    tags: ['TECHNO', 'DRUM KIT', 'ANALOG'],
    contents: {
      'Kicks': 50,
      'Snares / Claps': 45,
      'Hi-Hats': 60,
      'Percussion loops': 30,
      'Bass One-Shots': 25,
      'Atmospheres': 15
    },
    fileSize: '980 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'minimal-house-kit',
    title: 'Minimal House Kit',
    creator: 'ARTIFACT',
    category: 'drum_kit',
    price: 19,
    bpm: 126,
    key: 'A Minor',
    description: 'Pragmatic elements for reductionist house grooves. Stripped back kicks, clicky hats, and warm subs.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmHYdJb8M00ahLcFN39lvmX-Ne9ucT9m8K7YlvtbQzQtVxeB9282zPBZGEkOe0bvauDyKckQlwJJuHutO9JjGPZ8TIbDHZPdOrTi5H_CTH6GLd7iR7We2595OaH4mGL12voPQZNly94Hr5A8oKN7a6yGrmvbGAcvRG45xyJvmBJPCYTycttqXZHyYLMAV0lOKZBRCHaAtoDXgQoMXm0Zw0v6prYN9bH7TkSjD0u45GDolTuW-qRm1cj_Hd-gvZdDlipHf-fhrmVtox',
    fileCount: 180,
    tags: ['HOUSE', 'MINIMAL', 'LO-FI'],
    contents: {
      'Kicks': 30,
      'Snares': 30,
      'Hats': 40,
      'Synth Stabs': 30,
      'Groove Loops': 30,
      'FX': 20
    },
    fileSize: '450 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'raw-foundations',
    title: 'Raw Foundations',
    creator: 'NULL_STATE',
    category: 'drum_kit',
    price: 29,
    bpm: 90,
    key: 'C Major',
    description: 'The absolute essential dirt and pressure for boom bap hip-hop beats. Sampled through old analog equipment.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsuJCgRlyMkjTn49dvr9n_6a19c5_te67Tcl6WDYgX9LgNLFtPf7QMs5pvTW65pFUCt7_So3a2ApJmm3kRddHz3NdQksPxMhISbxjOYfJEE8oIen-tS4f0XonUrYD-SNFPlFfxO-0gXfgbA6IVmPQRHw9Lkif8cHdwKhwWCnK63DiWQqdxUlnuP_HGSzakmEKUk7yN-nyo0mwTptwNy5s6tEngBrILTaIcm5pbKK3fx7ndIKy99qW9h09QYi5mSvsj9kXkNOEEdtiw',
    fileCount: 320,
    tags: ['TRAP', 'BOOM BAP', 'ANALOG'],
    contents: {
      'Kicks': 80,
      'Snares': 70,
      'Hats': 90,
      'Percussion': 40,
      'Melody Loops': 30,
      'Bass Hits': 10
    },
    fileSize: '1.2 GB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'liquid-dnb-essentials',
    title: 'Liquid D&B Essentials',
    creator: 'SYNTHETICA',
    category: 'drum_kit',
    price: 35,
    bpm: 174,
    key: 'E Minor',
    description: 'Gliding basslines, atmospheric pads, and crisp breakbeats tailored perfectly for liquid drum & bass.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU-ikueRQ-ouUUFzpqfncRNnFwze88vwsMo5DLSAO4CISx65AUCE48Y91cdAft0t1yCxBxq_-Ne5JfHrUmkRHO1Mz71nibsSKI5KOVA7VYIer5cDLJpbkIbqsAs-a4WAJaPbRK7ajQOFFR_ip2TaLKo-uCQfESWHwOZpbBUluAZ4uZRX1frOGBMMWBEM_pTGpAmkYV2Md97JLDZXm8vk-t0BpyiK1D6HxFbkbPOCK5HG5GyMrsqBZQWss1puqzVauTv7NxRgYettrZ',
    fileCount: 150,
    tags: ['DRUM & BASS', 'AMBIENT', 'VOCALS'],
    contents: {
      'Drum Breaks': 40,
      'Bass Loops': 30,
      'Pads': 25,
      'FX': 25,
      'Vocal Textures': 15,
      'Melodic Chords': 15
    },
    fileSize: '820 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'vintage-synth-chords',
    title: 'Vintage Synth Chords',
    creator: 'KINETIC SOUNDS',
    category: 'sample_pack',
    price: 18,
    bpm: 110,
    key: 'C Minor',
    description: 'Harmonically rich chords and textured soundscapes captured from rare authentic hardware synthesizers running through tube preamps.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh8RiDwdQ-gZk-TDL-Y3-O4xWwjmLx0D6cw30u3QHGD-rBigX_F1BonyeemRB7gYDrO8mXyhY6hqB9qVEqoLawCovZ2FiTBZvoSa7kTcA4p3QxZidaU6jD1c3cHyynGxXVHHFIppDJmSOwU_foHIwmfZ0NCICNJHCYZaaD69WI89phz6E9Vf9T2PIolr35h92B40Qk3fd4n7QYrQxwii5PWbua-TLuIYWgBgiI_NqmxyHBaPP2NgiMHoAZnmq1w8KvRyufKvTIO2zW',
    fileCount: 120,
    tags: ['ANALOG', 'LO-FI', 'AMBIENT'],
    contents: {
      'Synth Loops': 50,
      'Midi Chords': 30,
      'Noise Beds': 20,
      'One-Shots': 20
    },
    fileSize: '620 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'ethereal-voices',
    title: 'Ethereal Voices',
    creator: 'NULL_STATE',
    category: 'sample_pack',
    price: 22,
    bpm: 124,
    key: 'G# Minor',
    description: 'Breathtaking processed vocal loops, glitched vocal cuts, and mystical ambient vocal phrases perfect for deep house and garage.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5qRm1N96mTqiILi0a539m0JdQ7rxZbVFNB0P8nXRXqFatZOc-AC8QOcU4Kxt4wx5Pbi-efhUwFTMl9uof-EUoIwXiDRjmcDDRuF9DvVuVX5sOsN4DVCa8rJPQE5vWOss5bNwDqXX0c-BY8C1KcT_QuzBh7wAZvH06_12eTYA3pUGGsywkAOL5_Tu8W9S--jibDbDf3MqLdZJRrlBDx-tyOZM3bNJY67xHs4CB0s5dtYWlqvFO-nxBRjyDmnneuYfU43zrUGd7OQzy',
    fileCount: 95,
    tags: ['VOCALS', 'AMBIENT', 'GARAGE'],
    contents: {
      'Vocal Phrase Loops': 40,
      'Vocal Chops': 35,
      'Pads / Textures': 20
    },
    fileSize: '350 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'dust-tape-noise',
    title: 'Dust & Tape Noise',
    creator: 'ARTIFACT',
    category: 'sample_pack',
    price: 18,
    bpm: 85,
    key: 'A Minor',
    description: 'Authentic warm vinyl crackle, tape hiss, cassette speed warbles, and mechanical flutter loops to glue your mix together.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU5iMp4Tu-s_WpFbFV389fuuWl1THIQO8vkWPeHr4HxuXmB5xCaRXxXa2BRRXulJ8pfRwvhBwGb01fGjnB8vMI3QUmMJBUQiZdlvae-b-8symUQKrfHw2uOADTDpE9l1JFoBUeEez9mUqH6zffuH7lqUvd5J6zGBloYRNV1XRzUKZ-L2wEJYmUOGkVABx7SPcW0ordivtMn-c8717QcQXzfjaj2wrawS2HRftet6KEjCYNeTvl_PBWwR-aVW0IVZijonBntJqeh1Y9',
    fileCount: 45,
    tags: ['LO-FI', 'ANALOG', 'NOISE'],
    contents: {
      'Cassette Loops': 15,
      'Vinyl Cuts': 15,
      'Reel-to-Reel Textures': 15
    },
    fileSize: '290 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'serum-bass-archive',
    title: 'Serum Bass Archive',
    creator: 'NULL_STATE',
    category: 'preset_bank',
    price: 30,
    tags: ['TRAP', 'DUBSTEP', 'PRESETS'],
    description: 'Uniquely sound-designed wavetable presets for Xfer Serum, targeting modern heavy bass music and aggressive beats.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeS6LWXYVAgfAf36J7Pz5p9bnJ7UsdaAdhnMsj5QNNC_7qG69bxjfHPjl2dGJPD6cog9JMftCCce_AtJAtdyRlVRmBpdIakMTSgeEg0P1ior55jXoJ6VFzNp2RApRm9LaZ_QJxbxbVTwlrf1fuMQDYKhit-NGMKF40bgemrflEx9ur27LDysmUm_YLraA6lIX282_XMW12rv6vTcOtVNoZ9d-BZwVGL1ZuJj7fBPcpAa5u9wqmMwiMVLekpt_bmUfoCUFZ8e_6IIKj',
    fileCount: 80,
    contents: {
      'Serum Presets': 80
    },
    fileSize: '5 MB',
    sampleRate: 'Presets (.fxp)',
    royaltyFree: true
  },
  {
    id: 'analog-keys-v2',
    title: 'Analog Keys V2',
    creator: 'SYNTHETICA',
    category: 'sample_pack',
    price: 22,
    bpm: 95,
    key: 'C# Minor',
    description: 'Charming vintage synth key loops, soulful Rhodes textures, and warped lofi piano recordings.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcTvCYy1vLj1H6VeH1E_6xm9Olxd99zCzuj_djVNAl3cKm6L77NkReAk8icn5vne5u70Qz4sgwaxmBGBMIPW2HRPG-4GtNV5s388TlfJ5iM2DUIhPQIVIpmqN0x3hTl30UNHQsNpItinsEWmd1I3oOG62nN_WBwpxUSzoQhulvGhcYeF02zpi8CV_Yq-TkcOir9XD59GEirZx4GJLU_vbFNLgpUWKLCP_IuXt3djGceH7rdasNZ-E7Fo193LQ3AUN_HH2o-TI094zM',
    fileCount: 110,
    tags: ['LO-FI', 'SAMPLE', 'ANALOG'],
    contents: {
      'Rhodes Loops': 35,
      'Upright Piano Cuts': 35,
      'Vintage Keys Stabs': 40
    },
    fileSize: '510 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  },
  {
    id: 'industrial-tension-vol1',
    title: 'INDUSTRIAL TENSION VOL. 1',
    creator: 'KINETIC SOUNDS',
    category: 'drum_kit',
    price: 49,
    bpm: 125,
    key: 'D Minor',
    description: 'A meticulously crafted collection of brutal, unyielding drum hits and textural loops designed for modern industrial techno, EBM, and dark cinematic scoring.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9-8-uXZnwfeD2k-AyYIlFvSBK_P2ZxGIdX8c_panNHKg8ficYovC8vL6OXz7AmVf2-S7PjbqVPRYg3mDtffMsFDQWiwN4TXoNTjOxR2zMvRGkOQLK8U3cQjc8xg6v17E4e77x8PW1C8J3p6aEF1ja1mtZLa3fb6pTsqr8gLyX44HlOLyNF62MrKBziJXRv1gxM_CRw_Yvky-0Ah6BrcVe2mn0ICJNVtT4duDkRuyjkILIMvlrzyPRhY8TlcX2eMSlCQw2fJeBjxDr',
    fileCount: 225,
    tags: ['WAV 24-BIT', 'ROYALTY FREE', '980 MB'],
    contents: {
      'Kicks': 50,
      'Snares / Claps': 45,
      'Hi-Hats': 60,
      'Percussion loops': 30,
      'Bass One-Shots': 25,
      'Atmospheres': 15
    },
    fileSize: '980 MB',
    sampleRate: '24-Bit WAV',
    royaltyFree: true
  }
];

export const PRESET_ITEMS = [
  { id: 'neuro-bass', title: 'Neuro Bass', category: 'Dubstep / Bass', count: '50 Presets', icon: 'memory' },
  { id: 'lush-pads', title: 'Lush Pads', category: 'Ambient / Chill', count: '85 Presets', icon: 'waves' },
  { id: 'tech-plucks', title: 'Tech House Plucks', category: 'Tech House', count: '64 Presets', icon: 'bolt' },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'ALEXANDER_VOID',
  role: 'SOUND DESIGNER',
  location: 'BERLIN',
  bio: 'Specializing in brutalist techno percussion and algorithmic textures. Curator of high-fidelity auditory assets for modern production environments.',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAExWU-khnM2AizPlFsS50YOrhmiZmqRxGD1TjSh96cDG3AMOFG9A56e6gjJ8oDIMcDGpdF7oXSwXQsHWT6KhBary0LxB6wPQJ4v9KvOR-1YUOvOgz85oD7xBBl_A1s4O26gdxR62ZdoD9Srt8ADtBCNWdEq8VDik5sEBfUCFBTYvVK-bnGXPt5f0Sw8WcIH13UpvkjTRKbMGAnIfIR6UqzLPeCVzHJKbN_aqtzd01e6i7nsqDIDyWigdGkU9tFdFHiVVIfTPKaNRR3'
};

export const PURCHASED_KITS_MOCK = [
  {
    id: 'purchased-1',
    title: 'INDUSTRIAL_DRUMS_VOL1',
    format: 'WAV',
    detail: '120 BPM',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBotOPWDbePeIp6F9L2SkVUP2OVwgdCOIlz3PNZYfmdDpl33mzU9QATWg7jFNx8aLt-B9RPGenfFYleSa3XIbWBsyOmNKonFPy-wie6kSkLTetjw0FY8iBmDxC4-x2cwr0JdPv8HbSSBOeAvVSEEFo5luYvIt4iS7ZBOh5-520JWyUELR-Jkxr5RTKtVedSemC3KCfrfJYIOWjbtPzyZG1IdmqzEh7qdKhtTZWNiTf7qhyZewrhKS-CFewbC_lbc_fDcdVPIjSqzh5'
  },
  {
    id: 'purchased-2',
    title: 'CORROSION_TEXTURES',
    format: 'WAV',
    detail: 'AMBIENT',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzNPpGPRPCPrZdUxRaAyc3dkvMfyykdkvX0uglgiP9r-bkiyIj25XnWEqTBsjIgnvD8BZVrTNPMo_YxMPr-5Weso9vojLlg64BL4AMXtjIQ7OB3WSqVUfdwVLd3youANIvrmvkAkjj8N6_4PP-lkHpkixJ-6ep56Sp3lNkGSlu-M4q7tezedXylaXf3IKy8Jd-ZW8-7ljlj1GWwYb4L-czHbBNumR1P7QfBix4LQeixkiQHG-bqRs3wcxmoCZd6EDuqSjt1z9bL_0Q'
  },
  {
    id: 'purchased-3',
    title: 'VOID_BASS_SYNTHS',
    format: 'SERUM',
    detail: 'PRESETS',
    coverImage: 'waveform'
  }
];
