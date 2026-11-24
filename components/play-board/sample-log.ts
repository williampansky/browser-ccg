import { LOG_ICON } from './describe-events';
import type { LogLine, LogTone } from './log-line';

/** Which sample the board lab loads into the log (`llpv`). */
export type LogSample = 'empty' | 'typical' | 'everything';

export const LOG_SAMPLES: { value: LogSample; label: string }[] = [
  { value: 'empty', label: 'Empty' },
  { value: 'typical', label: 'A typical turn' },
  { value: 'everything', label: 'Every kind of line (scrolls)' },
];

type Side = '0' | '1';
const turn = (actor: Side, n: number): LogLine => ({
  kind: 'turn',
  actor,
  text: `Turn ${n}`,
});
const act = (
  actor: Side,
  icon: string,
  text: string,
  note?: string,
): LogLine => ({ kind: 'action', actor, icon, text, note });
const fx = (
  actor: Side,
  tone: LogTone,
  amount: string | undefined,
  text: string,
  note?: string,
  icon?: string,
): LogLine => ({ kind: 'effect', actor, tone, amount, text, note, icon });
const hero = (side: Side) => `**Player ${Number(side) + 1}**'s hero`;
const guard = '__0|Frontline Guardsman__';
const drone = '__0|Surveying Drone__';
const sub = '__1|Nuclear Submarine__';

const TURN_ONE: LogLine[] = [
  turn('0', 1),
  act('0', LOG_ICON.play, `plays ${guard}`),
];

const TURN_TWO: LogLine[] = [
  turn('1', 2),
  act(
    '1',
    LOG_ICON.spell,
    `casts __1|Fireball__ on ${guard}`,
    '+1 Spell Damage',
  ),
  fx('0', 'damage', '-6', guard, '1 left'),
  fx('0', 'death', undefined, `${guard} dies`, undefined, LOG_ICON.death),
];

const TURN_THREE: LogLine[] = [
  turn('0', 3),
  act('0', LOG_ICON.play, `plays ${drone} on ${hero('1')}`),
  act('0', LOG_ICON.attack, `${drone} attacks ${hero('1')}`),
  fx('1', 'damage', '-2', hero('1'), '28 left'),
  act('1', LOG_ICON.trigger, `${sub} triggers`),
  fx('0', 'damage', '-8', hero('0'), 'dead'),
  { kind: 'info', icon: LOG_ICON.win, text: '**Player 2** wins!' },
];

/** Lines of every kind the log can show. */
const EVERYTHING: LogLine[][] = [
  [
    {
      kind: 'info',
      text: 'New game. **Player 1** goes first; **Player 2** starts with an extra card (__The Orb__).',
    },
    {
      kind: 'info',
      text: '**Player 1** plays Random deck; **Player 2** plays Random deck.',
    },
  ],
  TURN_ONE,
  [
    act('0', LOG_ICON.skill, `uses __0|Heroic Strike__ on ${guard}`),
    fx('0', 'buff', '+2/+0', guard, 'now 4/4, gains Guard'),
    act('0', LOG_ICON.equip, 'equips __0|Battle Axe__'),
    act('0', LOG_ICON.mystery, 'sets a Mystery', 'Attack'),
    act('0', LOG_ICON.skill, 'uses __0|Brace__'),
    fx('0', 'armor', '+3', hero('0'), 'armor'),
  ],
  TURN_TWO,
  [
    act('0', LOG_ICON.attack, `${guard} attacks ${drone}`),
    fx(
      '0',
      'note',
      undefined,
      `${drone} Bubble pops`,
      undefined,
      LOG_ICON.bubble,
    ),
    fx('0', 'damage', '-3', guard, '2 left'),
    act('1', LOG_ICON.mystery, 'Mystery revealed: __1|Ambush__'),
  ],
  [
    act('0', LOG_ICON.attack, `hero attacks ${hero('1')} with its weapon`),
    fx('1', 'damage', '-3', hero('1'), '1 absorbed, 25 left'),
    fx(
      '0',
      'death',
      undefined,
      'weapon breaks',
      undefined,
      LOG_ICON.weaponBreak,
    ),
    fx('1', 'heal', '+2', hero('1'), '27 left'),
  ],
  [
    act('1', LOG_ICON.fatigue, 'out of cards: fatigue', '2'),
    act('0', LOG_ICON.burn, 'hand is full: a card is burned'),
    fx('0', 'note', undefined, `${guard} summoned`, undefined, LOG_ICON.summon),
    fx('1', 'debuff', undefined, hero('1'), 'is Disabled'),
    act('0', LOG_ICON.trigger, `${drone} On Death`),
  ],
  TURN_THREE,
];

const TYPICAL: LogLine[][] = [TURN_ONE, TURN_TWO, TURN_THREE.slice(0, 5)];

export const sampleLog = (sample: LogSample): LogLine[][] => {
  if (sample === 'empty') return [];
  return sample === 'typical' ? TYPICAL : EVERYTHING;
};
