/* ─────────────────────────────────────────────────────────────────────────
 *  SoundEngine.js
 *  Generates a mechanical click/clack using Web Audio API oscillators.
 *  No external audio file required.
 *  AudioContext is created lazily on first user interaction (browser policy).
 * ─────────────────────────────────────────────────────────────────────────*/
class SoundEngine {
  constructor() {
    this.ctx   = null;
    this.muted = false;
    this._initOnInteraction();
  }

  // ── Public ────────────────────────────────────────────────────────────────

  play() {
    if (this.muted || !this.ctx) return;
    try {
      this._clack();
    } catch (_) { /* audio context can fail silently */ }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  get isMuted() { return this.muted; }

  // ── Private ──────────────────────────────────────────────────────────────

  _initOnInteraction() {
    const init = () => {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener('click',   init);
      document.removeEventListener('keydown', init);
    };
    document.addEventListener('click',   init, { once: true });
    document.addEventListener('keydown', init, { once: true });
  }

  /** Synthesise a short mechanical click — two bursts of noise + tone. */
  _clack() {
    const t   = this.ctx.currentTime;
    const dur = 0.18;

    // ── Noise burst (body of the click) ──
    const bufLen  = this.ctx.sampleRate * dur;
    const buffer  = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type            = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value         = 0.8;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + dur);

    // ── Tonal transient (the "tick") ──
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}
