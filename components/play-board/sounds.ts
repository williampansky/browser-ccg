import type { GameEvent } from '../../engine';

/** The sound effects the board can play. Add a name here and a recipe in `RECIPES` to extend. */
export type SoundName = 'minion' | 'spell' | 'weapon' | 'attack' | 'hit' | 'heal' | 'armor' | 'death' | 'turn' | 'gameOver';

const SOUND_OF: Partial<Record<GameEvent['type'], SoundName>> = {
  MinionPlayed: 'minion',
  MinionSummoned: 'minion',
  CardPlayed: 'spell',
  WeaponEquipped: 'weapon',
  MinionAttacked: 'attack',
  WeaponAttacked: 'attack',
  MinionDamaged: 'hit',
  HeroDamaged: 'hit',
  Healed: 'heal',
  ArmorGained: 'armor',
  MinionDied: 'death',
  WeaponBroke: 'death',
  TurnStarted: 'turn',
  GameOver: 'gameOver',
};

/** The sounds for one action's events, in order, each at most once (so a board wipe is one thud, not ten). */
export const soundsFor = (events: GameEvent[]): SoundName[] => {
  const out: SoundName[] = [];
  for (const e of events) {
    const s = SOUND_OF[e.type];
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
};

// --- Playback: small synthesised blips (Web Audio), so there are no audio files yet. Swap `RECIPES` for samples later. ---

type Recipe = { wave: OscillatorType; from: number; to: number; ms: number; gain: number };
const RECIPES: Record<SoundName, Recipe> = {
  minion: { wave: 'triangle', from: 220, to: 330, ms: 140, gain: 0.25 },
  spell: { wave: 'sine', from: 500, to: 900, ms: 260, gain: 0.2 },
  weapon: { wave: 'square', from: 300, to: 200, ms: 120, gain: 0.12 },
  attack: { wave: 'sawtooth', from: 400, to: 150, ms: 110, gain: 0.15 },
  hit: { wave: 'square', from: 160, to: 70, ms: 160, gain: 0.2 },
  heal: { wave: 'sine', from: 440, to: 660, ms: 220, gain: 0.15 },
  armor: { wave: 'triangle', from: 600, to: 500, ms: 100, gain: 0.15 },
  death: { wave: 'sawtooth', from: 200, to: 50, ms: 320, gain: 0.2 },
  turn: { wave: 'sine', from: 660, to: 660, ms: 120, gain: 0.12 },
  gameOver: { wave: 'triangle', from: 440, to: 220, ms: 700, gain: 0.25 },
};

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

/** Plays one sound; sounds start 90ms apart so an action's sounds do not stack into one blur. */
export const playSounds = (names: SoundName[]) => {
  if (muted || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  const c = ctx;
  names.forEach((n, i) => {
    const r = RECIPES[n];
    const t = c.currentTime + i * 0.09;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = r.wave;
    osc.frequency.setValueAtTime(r.from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(r.to, 1), t + r.ms / 1000);
    g.gain.setValueAtTime(r.gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + r.ms / 1000);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + r.ms / 1000 + 0.02);
  });
};
