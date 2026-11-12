import React from 'react';
import type { FrameColor } from './card-face-model';

/**
 * A card frame drawn in code (SVG + CSS gradients) instead of the painted PNGs: a few KB instead of ~700 KB per rarity.
 * PROTOTYPE (2026-11-12): everything is drawn in the same 178 x 250 design units as `CardFace`, so it drops in behind the
 * same text, cost and stat positions. See `/card-lab` to compare the two side by side.
 */

type Rarity = FrameColor;

interface Palette {
  /** The glowing trim, the gem and the ribbon */
  trim: string;
  light: string;
  dark: string;
}

const PALETTE: Record<Rarity, Palette> = {
  // Keyed by the frame colour (`RARITY_STYLE` in card-face-model.ts says which rarity gets which).
  STEEL: { trim: '#8aa0bd', light: '#d3deee', dark: '#2f3d52' },
  GREEN: { trim: '#46c76f', light: '#a5f0bb', dark: '#145a2d' },
  BLUE: { trim: '#3c9bff', light: '#9fd0ff', dark: '#123e70' },
  PURPLE: { trim: '#a86bf5', light: '#d9b8ff', dark: '#47207f' },
  RED: { trim: '#f0483f', light: '#ffb3ad', dark: '#7c1210' },
};

const id = (r: Rarity, name: string) => `vf-${r}-${name}`;

/** Every gradient and filter, once per rarity (the same ids repeat across cards; the definitions are identical). */
const Defs = ({ r }: { r: Rarity }) => {
  const p = PALETTE[r];
  return (
    <defs>
      <linearGradient id={id(r, 'metal')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5a6272" />
        <stop offset="0.5" stopColor="#262b35" />
        <stop offset="1" stopColor="#14171d" />
      </linearGradient>
      <linearGradient id={id(r, 'ribbon')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.trim} />
        <stop offset="1" stopColor={p.dark} />
      </linearGradient>
      <linearGradient id={id(r, 'paper')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e6d6b0" />
        <stop offset="1" stopColor="#b99f6c" />
      </linearGradient>
      <radialGradient id={id(r, 'gem')} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.35" stopColor={p.light} />
        <stop offset="1" stopColor={p.dark} />
      </radialGradient>
      <filter id={id(r, 'glow')} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <filter id={id(r, 'grain')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.1  0 0 0 0.35 0" />
      </filter>
    </defs>
  );
};

/** The frame: a steel slab with a window for the art, rarity trim, a ribbon for the name and a parchment text area. */
export const VectorFrame = ({ color: rarity, className }: { color: Rarity; className?: string }) => {
  const p = PALETTE[rarity];
  const win = 'M12 27 H169 V162 H12 Z';
  return (
    <svg className={className} viewBox="0 0 178 250" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <Defs r={rarity} />
      {/* steel slab with the art window cut out */}
      <path
        fillRule="evenodd"
        fill={`url(#${id(rarity, 'metal')})`}
        d={`M10 0 H168 Q178 0 178 10 V240 Q178 250 168 250 H10 Q0 250 0 240 V10 Q0 0 10 0 Z ${win}`}
      />
      {/* glowing rarity trim: the outer edge, and the window edge */}
      <rect x="2.5" y="2.5" width="173" height="245" rx="8" fill="none" stroke={p.trim} strokeWidth="2.4" filter={`url(#${id(rarity, 'glow')})`} opacity="0.9" />
      <rect x="2.5" y="2.5" width="173" height="245" rx="8" fill="none" stroke={p.light} strokeWidth="0.7" opacity="0.8" />
      <path d={win} fill="none" stroke={p.trim} strokeWidth="2.2" filter={`url(#${id(rarity, 'glow')})`} />
      <path d={win} fill="none" stroke="#0a0c10" strokeWidth="1" />
      {/* corner studs */}
      {[
        [9, 9],
        [169, 9],
        [9, 241],
        [169, 241],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.2" fill="#0d1015" stroke={p.trim} strokeWidth="0.8" />
          <circle cx={x} cy={y} r="1.8" fill={p.light} />
        </g>
      ))}
      {/* title plate for the type label */}
      <rect x="36" y="13" width="106" height="11" rx="5.5" fill="#080a0e" opacity="0.88" stroke={p.trim} strokeWidth="0.6" />
      {/* name ribbon */}
      <path
        d="M3 165 L15 160 H163 L175 165 L169 172.5 L175 180 L163 185 H15 L3 180 L9 172.5 Z"
        fill={`url(#${id(rarity, 'ribbon')})`}
        stroke="#05070a"
        strokeWidth="0.9"
      />
      <path d="M15 161.5 H163" stroke={p.light} strokeWidth="0.8" opacity="0.8" />
      {/* parchment */}
      <path d="M7 187 H171 V238 Q171 243 166 243 H12 Q7 243 7 238 Z" fill={`url(#${id(rarity, 'paper')})`} stroke="#05070a" strokeWidth="0.9" />
      <rect x="7" y="187" width="164" height="56" fill="#fff" filter={`url(#${id(rarity, 'grain')})`} opacity="0.55" />
      <path d="M7 187 H171" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
      {/* cost socket, top left */}
      <circle cx="19" cy="19" r="14.5" fill="#0a0c10" stroke={p.trim} strokeWidth="1.4" />
      <circle cx="19" cy="19" r="11.5" fill={`url(#${id(rarity, 'gem')})`} />
    </svg>
  );
};

/** The rarity gem set into the top edge. */
export const VectorGem = ({ color: rarity, className }: { color: Rarity; className?: string }) => {
  const p = PALETTE[rarity];
  return (
    <svg className={className} viewBox="0 0 22 30" aria-hidden="true" focusable="false">
      <Defs r={rarity} />
      <polygon points="11,0 22,15 11,30 0,15" fill="#0a0c10" />
      <polygon points="11,3 19,15 11,27 3,15" fill={`url(#${id(rarity, 'gem')})`} stroke={p.light} strokeWidth="0.6" />
      <polygon points="11,3 15,15 11,27 7,15" fill="#fff" opacity="0.22" />
    </svg>
  );
};

const GLYPH: Record<string, string> = {
  // a simple helm / bolt / blade / flask, drawn in a 24 x 24 box
  minion: 'M12 3 L19 6 V12 Q19 18 12 21 Q5 18 5 12 V6 Z M9 10 H15 V13 H9 Z',
  spell: 'M13 2 L5 13 H11 L9 22 L19 9 H13 Z',
  weapon: 'M17 2 L22 7 L10 19 L8 17 Z M7 16 L9 18 L6 21 L3 21 L3 18 Z',
  item: 'M9 2 H15 V6 L19 13 Q21 19 17 21 H7 Q3 19 5 13 L9 6 Z',
};

/** The round type emblem beside the ribbon (the type icon on a dark disc). */
export const VectorEmblem = ({ color: rarity, type, className }: { color: Rarity; type: string; className?: string }) => {
  const p = PALETTE[rarity];
  return (
    <svg className={className} viewBox="0 0 50 50" aria-hidden="true" focusable="false">
      <Defs r={rarity} />
      <circle cx="25" cy="25" r="23" fill="#0a0c10" stroke={p.trim} strokeWidth="2" />
      <circle cx="25" cy="25" r="18.5" fill={`url(#${id(rarity, 'metal')})`} stroke="#05070a" strokeWidth="1" />
      <g transform="translate(13 13)">
        <path d={GLYPH[type] ?? GLYPH.item} fill={p.light} stroke={p.dark} strokeWidth="0.8" />
      </g>
    </svg>
  );
};

const star = (cx: number, cy: number, outer: number, inner: number, points: number): string =>
  Array.from({ length: points * 2 }, (_, i) => {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

/** The attack badge (a gold burst) and the health badge (a red shield). */
export const VectorStat = ({ kind, className }: { kind: 'attack' | 'health'; className?: string }) => (
  <svg className={className} viewBox="0 0 50 50" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="vf-stat-attack" cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#ffe9a8" />
        <stop offset="0.55" stopColor="#f0a424" />
        <stop offset="1" stopColor="#8a4a07" />
      </radialGradient>
      <radialGradient id="vf-stat-health" cx="0.4" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#ff9c9c" />
        <stop offset="0.55" stopColor="#d12b2b" />
        <stop offset="1" stopColor="#5e0b0b" />
      </radialGradient>
    </defs>
    {kind === 'attack' ? (
      <>
        <polygon points={star(25, 25, 24, 17.5, 10)} fill="#0a0c10" />
        <circle cx="25" cy="25" r="16" fill="url(#vf-stat-attack)" stroke="#3a1f02" strokeWidth="1.4" />
      </>
    ) : (
      <>
        <path d="M25 1.5 L45 8 V25 Q45 40 25 48.5 Q5 40 5 25 V8 Z" fill="#0a0c10" />
        <path d="M25 5 L41 10.5 V25 Q41 37 25 44.5 Q9 37 9 25 V10.5 Z" fill="url(#vf-stat-health)" stroke="#3a0505" strokeWidth="1.2" />
      </>
    )}
  </svg>
);
