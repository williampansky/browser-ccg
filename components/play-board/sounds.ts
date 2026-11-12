import type { GameEvent } from '../../engine';

/**
 * The sound effects the board can play. Deliberately few and quiet: a soft thud for a minion, a faint chime for a spell, a low thump
 * for damage. Add a name here, to `SOUND_OF` and to `RECIPES` to extend.
 */
export type SoundName = 'minion' | 'spell' | 'weapon' | 'hit' | 'heal' | 'death' | 'turn' | 'gameOver';

// Attacking and gaining Armor make no sound of their own: the hit that follows an attack is the sound, and a quiet board is easier to listen to.
const SOUND_OF: Partial<Record<GameEvent['type'], SoundName>> = {
  MinionPlayed: 'minion',
  MinionSummoned: 'minion',
  CardPlayed: 'spell',
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
  const out: SoundName[] = [];
  for (const e of events) {
    const s = SOUND_OF[e.type];
    if (s && !out.includes(s)) out.push(s);
  }
  if (out.length <= MAX_SOUNDS_PER_ACTION) return out;
  return out.includes('gameOver')
    ? [...out.filter((n) => n !== 'gameOver').slice(0, MAX_SOUNDS_PER_ACTION - 1), 'gameOver']
    : out.slice(0, MAX_SOUNDS_PER_ACTION);
};

// --- Playback: small synthesised tones (Web Audio), so there are no audio files yet. Swap `RECIPES` for samples later. ---
// Soft shapes only (sine and triangle, a gentle fade-in, a low-pass filter), a small pitch movement and a low volume.

type Recipe = { wave: OscillatorType; from: number; to: number; ms: number; gain: number };
const RECIPES: Record<SoundName, Recipe> = {
  minion: { wave: 'triangle', from: 180, to: 150, ms: 120, gain: 0.07 },
  spell: { wave: 'sine', from: 523, to: 659, ms: 200, gain: 0.045 },
  weapon: { wave: 'triangle', from: 330, to: 300, ms: 90, gain: 0.045 },
  hit: { wave: 'triangle', from: 140, to: 95, ms: 120, gain: 0.075 },
  heal: { wave: 'sine', from: 392, to: 494, ms: 180, gain: 0.04 },
  death: { wave: 'triangle', from: 110, to: 75, ms: 220, gain: 0.075 },
  turn: { wave: 'sine', from: 440, to: 440, ms: 80, gain: 0.025 },
  gameOver: { wave: 'sine', from: 392, to: 294, ms: 500, gain: 0.055 },
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
  try {
    window.localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
};

/** Plays the sounds, one after another `GAP_S` apart so an action's sounds do not stack into one blur. */
export const playSounds = (names: SoundName[]) => {
  if (muted || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  const c = ctx;
  names.forEach((n, i) => {
    const r = RECIPES[n];
    const t = c.currentTime + i * GAP_S;
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
  });
};
