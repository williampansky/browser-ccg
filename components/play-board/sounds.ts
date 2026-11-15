import type { GameEvent } from '../../engine';

/**
 * The sound effects the board can play. Deliberately few and quiet: a soft thud for a minion, a faint chime for a spell, a low thump
 * for damage. Add a name here, to `SOUND_OF` and to `RECIPES` to extend.
 */
export type SoundName = 'cardPlay' | 'draw' | 'cardHover' | 'minion' | 'spell' | 'weapon' | 'hit' | 'heal' | 'death' | 'turn' | 'gameOver';

// Attacking and gaining Armor make no sound of their own: the hit that follows an attack is the sound, and a quiet board is easier to listen to.
const SOUND_OF: Partial<Record<GameEvent['type'], SoundName>> = {
  Drew: 'draw',
  MinionPlayed: 'minion',
  MinionSummoned: 'minion',
  CardPlayed: 'spell',
  HeroSkillUsed: 'spell',
  WeaponEquipped: 'weapon',
  MinionDamaged: 'hit',
  HeroDamaged: 'hit',
  Healed: 'heal',
  MinionDied: 'death',
  WeaponBroke: 'death',
  TurnStarted: 'turn',
  GameOver: 'gameOver',
};

/** At most this many sounds for one action (a board wipe is a few soft notes, not a pile of them). */
export const MAX_SOUNDS_PER_ACTION = 3;

/**
 * The sounds for one action's events, in order, each at most once (so a board wipe is one thud, not ten), and never more than
 * `MAX_SOUNDS_PER_ACTION`; the end of the game always keeps its place.
 */
export const soundsFor = (events: GameEvent[]): SoundName[] => {
  // Putting a card down from the hand is its own sound, ahead of what the card then does (a minion's landing, a spell's chime).
  const out: SoundName[] = events.some((e) => e.type === 'MinionPlayed' || e.type === 'CardPlayed') ? ['cardPlay'] : [];
  for (const e of events) {
    const s = SOUND_OF[e.type];
    if (s && !out.includes(s)) out.push(s);
  }
  // The card sounds (putting a card down, drawing one) are about handling cards, not about what happened, so they do not use up
  // the cap: a spell that kills a minion still gets its death sound.
  const isCardSound = (n: SoundName) => n === 'cardPlay' || n === 'draw';
  const rest = out.filter((n) => !isCardSound(n));
  const kept =
    rest.length <= MAX_SOUNDS_PER_ACTION
      ? rest
      : rest.includes('gameOver')
        ? [...rest.filter((n) => n !== 'gameOver').slice(0, MAX_SOUNDS_PER_ACTION - 1), 'gameOver']
        : rest.slice(0, MAX_SOUNDS_PER_ACTION);
  return out.filter((n) => isCardSound(n) || kept.includes(n));
};

// --- Playback: small synthesised tones (Web Audio), so there are no audio files yet. Swap `RECIPES` for samples later. ---
// Soft shapes only (sine and triangle, a gentle fade-in, a low-pass filter), a small pitch movement and a low volume.

/** `thump` is the loudness of a short burst of low-passed noise laid under the tone: the body of a heavy impact. */
type Recipe = { wave: OscillatorType; from: number; to: number; ms: number; gain: number; thump?: number };
const RECIPES: Record<SoundName, Recipe> = {
  // Quiet stand-ins used only until (or if) the samples below load.
  cardPlay: { wave: 'triangle', from: 220, to: 160, ms: 80, gain: 0.04 },
  draw: { wave: 'sine', from: 600, to: 500, ms: 60, gain: 0.02 },
  cardHover: { wave: 'sine', from: 900, to: 700, ms: 30, gain: 0.012 },
  minion: { wave: 'triangle', from: 150, to: 70, ms: 170, gain: 0.09, thump: 0.12 },
  spell: { wave: 'sine', from: 523, to: 659, ms: 200, gain: 0.045 },
  weapon: { wave: 'triangle', from: 330, to: 300, ms: 90, gain: 0.045 },
  hit: { wave: 'triangle', from: 130, to: 55, ms: 160, gain: 0.09, thump: 0.16 },
  heal: { wave: 'sine', from: 392, to: 494, ms: 180, gain: 0.04 },
  death: { wave: 'triangle', from: 100, to: 45, ms: 300, gain: 0.085, thump: 0.1 },
  turn: { wave: 'sine', from: 440, to: 440, ms: 80, gain: 0.025 },
  gameOver: { wave: 'sine', from: 392, to: 294, ms: 500, gain: 0.055 },
};

/**
 * Recorded sounds (CC0, Kenney's Casino Audio via OpenGameArt): a variant is picked at random each time, with a little pitch
 * variation, so repeats do not sound identical. A sound with no entry here (or whose files fail to load) uses its tone above.
 */
const SAMPLES: Partial<Record<SoundName, { files: string[]; gain: number; jitter?: number; maxMs?: number }>> = {
  cardPlay: { files: ['/sounds/cards/card-slide-7.ogg'], gain: 0.15, jitter: 0.07 },
  draw: { files: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/sounds/cards/card-slide-${n}.ogg`), gain: 0.3 },
  // Fanning across the hand: one short slide, quiet, with wide pitch variation so a sweep over several cards does not repeat itself.
  cardHover: { files: ['/sounds/cards/card-slide-5.ogg'], gain: 0.15, jitter: 0.03, maxMs: 150 },
};
const PITCH_JITTER = 0.06;

/** Overrides from the board lab's Sounds section (never set on the real /play): which file, how loud, how much pitch variation. */
export interface SoundTuning {
  file?: string;
  gain?: number;
  jitter?: number;
  /** Cut the sound off after this many ms (with a short fade), so quick repeats are short flicks and do not smear */
  maxMs?: number;
}
export type TunableSound = 'cardPlay' | 'draw' | 'cardHover' | 'hold';
const tuning: Partial<Record<TunableSound, SoundTuning>> = {};
let hoverGapOverride: number | undefined;
export const setSoundTuning = (name: TunableSound, t: SoundTuning | undefined) => {
  if (t) tuning[name] = t;
  else delete tuning[name];
  if (name === 'hold' && hold) hold.gain.gain.value = t?.gain ?? HOLD_GAIN; // live while the loop plays
};
export const setHoverGapMs = (ms: number | undefined) => {
  hoverGapOverride = ms;
};
/** What a tunable sound uses when nothing is overridden (files, gain, pitch variation), for the lab's sliders. */
export const soundDefaults = (name: TunableSound): { files: string[]; gain: number; jitter: number; maxMs?: number } =>
  name === 'hold'
    ? { files: [HOLD_FILE], gain: HOLD_GAIN, jitter: 0 }
    : { files: SAMPLES[name]!.files, gain: SAMPLES[name]!.gain, jitter: SAMPLES[name]!.jitter ?? PITCH_JITTER, maxMs: SAMPLES[name]!.maxMs };

/**
 * The sound while a card is held (clicked, or being dragged): a soft magical shimmer (CC0, "Magic Fireflies" by ienba, freesound.org),
 * looped and faded in when the card is picked up and out when it is let go.
 */
const HOLD_FILE = '/sounds/cards/magic-fireflies.m4a';
const HOLD_GAIN = 0.65;
const HOLD_FADE_IN_S = 0.12;
const HOLD_FADE_OUT_S = 0.2;
let hold: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
/** True while the card is held, so a shimmer that finished decoding after the card was let go does not start. */
let holdWanted = false;
/** The recorded sounds playing right now, so the lab's Stop button can cut them off. */
const live = new Set<AudioBufferSourceNode>();
const rawFiles = new Map<string, Promise<ArrayBuffer | null>>();
const decoded = new Map<string, AudioBuffer>();
const fetchFile = (url: string) => {
  let p = rawFiles.get(url);
  if (!p) {
    p = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null), () => null);
    rawFiles.set(url, p);
  }
  return p;
};
/**
 * Starts fetching and decoding every sample (call once when the board mounts), so the first play of each file is the recording and not
 * the stand-in tone. (Fetching alone was not enough: a file is only usable once decoded, and decoding used to wait for its first play.)
 */
export const preloadSounds = () => {
  if (typeof window === 'undefined') return;
  const files = [...Object.values(SAMPLES).flatMap((s) => s?.files ?? []), HOLD_FILE];
  files.forEach((f) => void fetchFile(f));
  // Decoding needs an audio context; a suspended one (no click yet) can still decode.
  const c = audioContext();
  if (c) files.forEach((f) => void decode(c, f));
};
const decode = async (c: AudioContext, url: string): Promise<AudioBuffer | null> => {
  const hit = decoded.get(url);
  if (hit) return hit;
  const raw = await fetchFile(url);
  if (!raw) return null;
  try {
    const buf = await c.decodeAudioData(raw.slice(0));
    decoded.set(url, buf);
    return buf;
  } catch {
    return null;
  }
};
/** Plays one recorded variant `at` (AudioContext time); false if it is not ready, so the caller can fall back to the tone. */
const playSample = (c: AudioContext, name: SoundName, at: number): boolean => {
  const sample = SAMPLES[name];
  if (!sample) return false;
  const t = tuning[name as TunableSound];
  const files = t?.file ? [t.file] : sample.files;
  const url = files[Math.floor(Math.random() * files.length)];
  const buf = decoded.get(url);
  if (!buf) {
    void decode(c, url); // ready next time
    return false;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = 1 + (Math.random() * 2 - 1) * (t?.jitter ?? sample.jitter ?? PITCH_JITTER);
  const g = c.createGain();
  g.gain.value = t?.gain ?? sample.gain;
  src.connect(g).connect(c.destination);
  src.start(at);
  live.add(src);
  src.onended = () => live.delete(src);
  const maxMs = t?.maxMs ?? sample.maxMs;
  if (maxMs) {
    // A short fade-out so the cut is not a click.
    const end = at + maxMs / 1000;
    g.gain.setValueAtTime(g.gain.value, Math.max(at, end - 0.03));
    g.gain.linearRampToValueAtTime(0, end);
    src.stop(end + 0.01);
  }
  return true;
};

/** The low-pass cut-off that rounds off every tone (Hz), and the gap between one action's sounds (seconds). */
const SOFTEN_HZ = 1400;
const GAP_S = 0.12;

const MUTE_KEY = 'ccg-muted';
let ctx: AudioContext | null = null;
let muted = typeof window !== 'undefined' && window.localStorage?.getItem(MUTE_KEY) === '1';

export const isMuted = () => muted;
export const setMuted = (m: boolean) => {
  muted = m;
  if (m) stopHoldSound();
  try {
    window.localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
};

/** Plays the sounds, one after another `GAP_S` apart so an action's sounds do not stack into one blur; `delayS` waits for the animation's impact. */
export const playSounds = (names: SoundName[], delayS = 0) => {
  if (muted || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  const c = ctx;
  names.forEach((n, i) => {
    const r = RECIPES[n];
    const t = c.currentTime + delayS + i * GAP_S;
    if (playSample(c, n, t)) return;
    const end = t + r.ms / 1000;
    const osc = c.createOscillator();
    const g = c.createGain();
    const soft = c.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = SOFTEN_HZ;
    osc.type = r.wave;
    osc.frequency.setValueAtTime(r.from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(r.to, 1), end);
    // A 12 ms fade-in (no click at the start), then a smooth fade out.
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(r.gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(soft).connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(end + 0.02);
    if (r.thump) {
      // The body of an impact: 90 ms of noise through a low-pass that closes fast, so it lands as a thud, not a hiss.
      const len = Math.floor(c.sampleRate * 0.09);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let k = 0; k < len; k++) data[k] = (Math.random() * 2 - 1) * (1 - k / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, t);
      lp.frequency.exponentialRampToValueAtTime(120, t + 0.09);
      const ng = c.createGain();
      ng.gain.setValueAtTime(r.thump, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      src.connect(lp).connect(ng).connect(c.destination);
      src.start(t);
    }
  });
};

const audioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

/** Starts the held-card shimmer (a no-op if it is already playing, muted, or the file is unavailable). */
export const startHoldSound = () => {
  holdWanted = true;
  if (muted || hold) return;
  const c = audioContext();
  if (!c) return;
  void decode(c, tuning.hold?.file ?? HOLD_FILE).then((buf) => {
    if (!buf || !holdWanted || hold || muted) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(tuning.hold?.gain ?? HOLD_GAIN, c.currentTime + HOLD_FADE_IN_S);
    src.connect(gain).connect(c.destination);
    src.start(0, Math.random() * buf.duration); // from a random point, so it does not always open the same way
    hold = { src, gain };
  });
};

/** Fades the held-card shimmer out. */
export const stopHoldSound = () => {
  holdWanted = false;
  if (!hold || !ctx) return;
  const { src, gain } = hold;
  hold = null;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + HOLD_FADE_OUT_S);
  src.stop(t + HOLD_FADE_OUT_S + 0.02);
};

/** Minimum gap between hover sounds (ms), so a fast sweep over the hand is a run of ticks, not a pile. */
export const HOVER_GAP_MS = 35;
let lastHover = 0;
let pendingHover: ReturnType<typeof setTimeout> | null = null;
/**
 * The quiet slide when the pointer moves onto a card in hand. A hover that comes inside the gap is not thrown away: it plays when the gap
 * ends (a newer hover replaces it, and `cancelCardHover` drops it when the pointer has already left), so resting on a card always sounds.
 */
export const playCardHover = () => {
  const now = typeof performance !== 'undefined' ? performance.now() : 0;
  const gap = hoverGapOverride ?? HOVER_GAP_MS;
  if (pendingHover) clearTimeout(pendingHover);
  pendingHover = null;
  const wait = lastHover + gap - now;
  if (wait <= 0) {
    lastHover = now;
    playSounds(['cardHover']);
    return;
  }
  pendingHover = setTimeout(() => {
    pendingHover = null;
    lastHover = typeof performance !== 'undefined' ? performance.now() : 0;
    playSounds(['cardHover']);
  }, wait);
};
/** The pointer left the card before its delayed hover sound played: drop it. */
export const cancelCardHover = () => {
  if (pendingHover) clearTimeout(pendingHover);
  pendingHover = null;
};

/** Plays a tunable sound once, for the lab's Play buttons (the held-card loop keeps going until Stop). */
export const previewSound = (name: TunableSound) => {
  if (name === 'hold') {
    startHoldSound(); // loops until `stopPreview`
  } else {
    // Decode the file first, so a newly picked one plays as itself and not as the fallback tone.
    const c = audioContext();
    const files = tuning[name]?.file ? [tuning[name]!.file!] : soundDefaults(name).files;
    if (!c) return;
    void Promise.all(files.map((f) => decode(c, f))).then(() => playSounds([name]));
  }
};

/** Stops everything the lab's Play buttons started: recorded sounds still playing, a pending hover sound and the held-card loop. */
export const stopPreview = () => {
  cancelCardHover();
  live.forEach((s) => {
    try {
      s.stop();
    } catch {
      /* already stopped */
    }
  });
  live.clear();
  stopHoldSound();
};
