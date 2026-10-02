// Lightweight Web Audio API audio synthesis for realistic kit audio previews

class AudioPreviewService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentKitId: string | null = null;
  private intervalId: any = null;
  private onEndedCallback: (() => void) | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(kitId: string, bpm = 120, category = 'drum_kit', onEnded?: () => void) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentKitId = kitId;
    this.onEndedCallback = onEnded || null;

    const beatInterval = (60 / bpm) * 1000;
    let step = 0;
    const totalSteps = 32; // 2 bars of 16th notes or 8 beats

    const playBeat = () => {
      if (!this.ctx || !this.isPlaying) return;

      const now = this.ctx.currentTime;

      // Kick drum on 1, 5, 9, 13 (four on the floor or syncopated)
      if (step % 4 === 0) {
        this.synthKick(now);
      }

      // Snare / Clap on 4, 12
      if (step % 8 === 4) {
        this.synthSnare(now);
      }

      // Hi-Hats on 2, 6, 10, 14
      if (step % 2 === 0) {
        this.synthHiHat(now, step % 4 === 2 ? 0.08 : 0.04);
      }

      // Melodic / Bass tone
      if (category === 'sample_pack' || category === 'preset_bank') {
        const notes = [130.81, 146.83, 164.81, 196.0, 220.0]; // C, D, E, G, A
        const note = notes[(step * 3) % notes.length];
        if (step % 2 === 0) {
          this.synthBass(now, note);
        }
      }

      step++;
      if (step >= totalSteps) {
        this.stop();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    };

    playBeat();
    this.intervalId = setInterval(playBeat, beatInterval / 2);
  }

  public stop() {
    this.isPlaying = false;
    this.currentKitId = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getPlayingId() {
    return this.currentKitId;
  }

  private synthKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private synthSnare(time: number) {
    if (!this.ctx) return;
    // White noise buffer for snare snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  private synthHiHat(time: number, vol = 0.06) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.01));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  private synthBass(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + 0.2);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }
}

export const audioPlayer = new AudioPreviewService();
