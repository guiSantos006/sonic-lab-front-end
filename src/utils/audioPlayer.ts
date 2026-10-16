/**
 * Enhanced Audio Player Engine
 * Supports:
 * - Real audio file streaming (HTML5 Audio with CORS support)
 * - Synthesized rhythmic sound preview fallback (Web Audio API)
 * - Real-time playback tracking (currentTime, duration, progress)
 * - Waveform scrubbing and seeking
 * - Loop mode and volume control
 * - State change event broadcasting
 */

export type AudioPlayerEvent = 'play' | 'pause' | 'stop' | 'timeupdate' | 'ended' | 'volumechange' | 'error';

type Listener = () => void;

class AudioPlayerEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  // Synthesis state
  private isSynthesizing = false;
  private synthIntervalId: any = null;
  private synthStep = 0;
  private synthTotalSteps = 64; // ~16 seconds of beat loop
  private synthStartTime = 0;
  private synthDuration = 16;

  // Track state
  private currentKitId: string | null = null;
  private currentKitTitle: string = '';
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private volume = 0.85;
  private isMuted = false;
  private isLoop = false;

  private listeners: Map<AudioPlayerEvent, Set<Listener>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.emit('play');
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('pause');
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
        if (!isNaN(this.audioElement.duration) && this.audioElement.duration > 0) {
          this.duration = this.audioElement.duration;
        }
        this.emit('timeupdate');
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && !isNaN(this.audioElement.duration)) {
        this.duration = this.audioElement.duration;
        this.emit('timeupdate');
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.isLoop) {
        if (this.audioElement) {
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {});
        }
      } else {
        this.isPlaying = false;
        this.emit('ended');
      }
    });

    this.audioElement.addEventListener('error', (err) => {
      console.warn('Real audio file failed to load, switching to synthesized preview fallback:', err);
      // Fallback seamlessly to Web Audio synthesizer
      if (this.currentKitId && this.isPlaying) {
        this.startSynthPlayback(this.currentKitId, 120, 'drum_kit');
      }
      this.emit('error');
    });
  }

  private initWebAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Subscribe to player events
   */
  public on(event: AudioPlayerEvent, callback: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: AudioPlayerEvent) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('AudioPlayer listener error:', e);
        }
      });
    }
  }

  /**
   * Play a SoundKit demo
   */
  public async playKit(kit: {
    id: string;
    title?: string;
    bpm?: number;
    category?: string;
    audioDemoUrl?: string;
    audioDemo?: { url: string; durationInSeconds?: number; waveformData?: number[] };
  }) {
    this.initAudioElement();
    this.initWebAudio();

    // If same kit is paused, resume it
    if (this.currentKitId === kit.id && !this.isPlaying && this.currentTime > 0) {
      this.resume();
      return;
    }

    this.stop();

    this.currentKitId = kit.id;
    this.currentKitTitle = kit.title || 'SoundKit Demo';

    const url = kit.audioDemo?.url || kit.audioDemoUrl;
    const specifiedDuration = kit.audioDemo?.durationInSeconds || (kit.category === 'drum_kit' ? 24 : 32);

    if (url && url.trim().length > 0 && !url.startsWith('mock:')) {
      // Stream real audio URL
      try {
        if (!this.audioElement) this.initAudioElement();
        if (this.audioElement) {
          this.audioElement.src = url;
          this.audioElement.volume = this.isMuted ? 0 : this.volume;
          this.audioElement.loop = this.isLoop;
          this.duration = specifiedDuration;
          await this.audioElement.play();
          this.isPlaying = true;
          this.isSynthesizing = false;
          this.emit('play');
          return;
        }
      } catch (err) {
        console.warn('Direct stream attempt failed, using Web Audio synthesizer:', err);
      }
    }

    // Synthesized rhythmic preview
    this.startSynthPlayback(kit.id, kit.bpm || 120, kit.category || 'drum_kit', specifiedDuration);
  }

  /**
   * Start Web Audio synthesizer loop
   */
  private startSynthPlayback(kitId: string, bpm = 120, category = 'drum_kit', totalDuration = 24) {
    this.initWebAudio();
    this.isSynthesizing = true;
    this.isPlaying = true;
    this.duration = totalDuration;
    this.currentTime = 0;
    this.synthStartTime = Date.now();
    this.synthDuration = totalDuration;
    this.synthStep = 0;

    const beatInterval = (60 / bpm) * 1000;
    this.synthTotalSteps = Math.floor((totalDuration * 1000) / (beatInterval / 2));

    const playBeat = () => {
      if (!this.isPlaying || !this.isSynthesizing) return;

      const elapsed = (Date.now() - this.synthStartTime) / 1000;
      this.currentTime = Math.min(this.duration, elapsed);
      this.emit('timeupdate');

      if (this.currentTime >= this.duration) {
        if (this.isLoop) {
          this.currentTime = 0;
          this.synthStartTime = Date.now();
          this.synthStep = 0;
        } else {
          this.stop();
          this.emit('ended');
          return;
        }
      }

      if (!this.audioCtx || this.isMuted) return;

      const now = this.audioCtx.currentTime;
      const step = this.synthStep;

      // Kick drum
      if (step % 4 === 0) {
        this.synthKick(now, this.volume);
      }

      // Snare / Clap
      if (step % 8 === 4) {
        this.synthSnare(now, this.volume);
      }

      // Hi-Hats
      if (step % 2 === 0) {
        this.synthHiHat(now, (step % 4 === 2 ? 0.08 : 0.04) * this.volume);
      }

      // Melodic / Bass Tone
      if (category === 'sample_pack' || category === 'preset_bank' || category === 'midi_kit') {
        const notes = [130.81, 146.83, 164.81, 196.0, 220.0]; // C, D, E, G, A
        const note = notes[(step * 3) % notes.length];
        if (step % 2 === 0) {
          this.synthBass(now, note, this.volume);
        }
      }

      this.synthStep++;
    };

    playBeat();
    this.synthIntervalId = setInterval(playBeat, beatInterval / 2);
    this.emit('play');
  }

  /**
   * Pause playback
   */
  public pause() {
    this.isPlaying = false;
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    this.emit('pause');
  }

  /**
   * Resume paused audio
   */
  public resume() {
    if (!this.currentKitId) return;

    if (this.isSynthesizing) {
      this.isPlaying = true;
      this.synthStartTime = Date.now() - this.currentTime * 1000;
      const bpm = 120;
      const beatInterval = (60 / bpm) * 1000;
      this.synthIntervalId = setInterval(() => {
        if (!this.isPlaying || !this.isSynthesizing) return;
        const elapsed = (Date.now() - this.synthStartTime) / 1000;
        this.currentTime = Math.min(this.duration, elapsed);
        this.emit('timeupdate');
        if (this.currentTime >= this.duration) {
          if (this.isLoop) {
            this.currentTime = 0;
            this.synthStartTime = Date.now();
          } else {
            this.stop();
            this.emit('ended');
          }
        }
      }, beatInterval / 2);
      this.emit('play');
    } else if (this.audioElement) {
      this.audioElement.play().catch(() => {});
      this.isPlaying = true;
      this.emit('play');
    }
  }

  /**
   * Stop and reset player
   */
  public stop() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    this.currentTime = 0;
    this.emit('stop');
  }

  /**
   * Seek to specific position (in seconds)
   */
  public seek(seconds: number) {
    const target = Math.max(0, Math.min(this.duration || 30, seconds));
    this.currentTime = target;

    if (this.audioElement && !this.isSynthesizing) {
      this.audioElement.currentTime = target;
    } else if (this.isSynthesizing) {
      this.synthStartTime = Date.now() - target * 1000;
    }

    this.emit('timeupdate');
  }

  /**
   * Seek by percentage (0 to 1)
   */
  public seekPercent(fraction: number) {
    const total = this.duration || 30;
    this.seek(total * Math.max(0, Math.min(1, fraction)));
  }

  /**
   * Skip forward or backward by seconds (e.g. +10s or -10s)
   */
  public skip(seconds: number) {
    this.seek(this.currentTime + seconds);
  }

  /**
   * Set volume from 0 to 1
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.emit('volumechange');
  }

  /**
   * Toggle mute
   */
  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.emit('volumechange');
  }

  /**
   * Toggle loop
   */
  public toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.audioElement) {
      this.audioElement.loop = this.isLoop;
    }
  }

  // Getters
  public getPlayingKitId(): string | null {
    return this.currentKitId;
  }

  public getPlayingKitTitle(): string {
    return this.currentKitTitle;
  }

  public isPlayingNow(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration || 30;
  }

  public getProgress(): number {
    if (!this.duration) return 0;
    return Math.min(1, Math.max(0, this.currentTime / this.duration));
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsLoop(): boolean {
    return this.isLoop;
  }

  // Synthesizer voice functions
  private synthKick(time: number, masterVol: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.35 * masterVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private synthSnare(time: number, masterVol: number) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.03));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2 * masterVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(time);
  }

  private synthHiHat(time: number, vol = 0.06) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.01));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(time);
  }

  private synthBass(time: number, freq: number, masterVol: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + 0.2);

    gain.gain.setValueAtTime(0.12 * masterVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }
}

export const audioPlayer = new AudioPlayerEngine();
