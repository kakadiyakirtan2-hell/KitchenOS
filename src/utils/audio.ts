/**
 * Synthesizes pure Web Audio sound effects with zero external assets
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Soft pleasant tap chime for buttons and checklists
 */
export function playChime(pitch: 'low' | 'med' | 'high' = 'med') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freqs = { low: 440, med: 587.33, high: 880 }; // A4, D5, A5
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[pitch], ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.debug('Audio not supported', err);
  }
}

/**
 * Pleasant melodic 3-tone kitchen bell alert when timer expires
 */
export function playTimerAlarm() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);

      const startTime = ctx.currentTime + idx * 0.14;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
  } catch (err) {
    console.debug('Timer alarm audio error', err);
  }
}

/**
 * Joyful celebratory victory fanfare when mom completes a recipe
 */
export function playSuccessCelebration() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [
      { f: 523.25, t: 0.0 }, // C5
      { f: 659.25, t: 0.1 }, // E5
      { f: 783.99, t: 0.2 }, // G5
      { f: 1046.5, t: 0.35 } // High C6
    ];

    chords.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);

      const start = ctx.currentTime + note.t;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.9);
    });
  } catch (err) {
    console.debug('Celebration fanfare error', err);
  }
}

/**
 * Synthesizes realistic tadka crackle & sizzle using filtered noise
 */
export function playSizzleBurst() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (err) {
    console.debug('Sizzle audio error', err);
  }
}

/**
 * Synthesizes gentle bubble pop for simmering chai/dal
 */
export function playBubbleSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 200 + Math.random() * 300;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.debug('Bubble sound error', err);
  }
}
