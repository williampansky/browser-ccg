import { produce } from 'immer';
import { createPortal } from 'react-dom';
import { AimArrow } from './AimArrow';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Action,
  applyAction,
  buildDeck,
  chooseGreedyAction,
  chooseRandomAction,
  DEFAULT_TURN_SECONDS,
  getCardDef,
  getHero,
  withHeroTokens,
  Card,
  createGame,
  createSeededRng,
  GameEvent,
  GameState,
  legalActions,
  loadHsCards,
  MinionInstance,
  playablePool,
  primePool,
  turnSeconds,
  PlayerId,
  Rng,
  TargetRef,
  effectiveCost,
} from '../../engine';
import { gapIndex } from './board-position';
import { isAccessible, setAccessible, titleIf } from './accessibility';
import { formatClock, isTimerOn, secondsLeft, setTimerOn } from './turn-timer';
import { fanDrop, fanRotation, fanX, HAND_CARD_HEIGHT, handSink as computeHandSink, handZoom } from './hand-fan';
import { applyDebugSetup, DebugSetup } from './debug-setup';
import { nukeHero } from './nuke-hero';
import { CardFace } from './CardFace';
import { DEFAULT_PROFILE, foeTheme, loadProfile, logName, PlayerProfile, themeOf } from '../player-profile/profile';
import { MinionFace } from './MinionFace';
import { minionOvalHeight } from './minion-model';
import minionStyles from './board-minion.module.scss';
import { artBackground, withSpellDamageText } from './card-face-model';
import { loadDecks } from '../deck-builder/deck-storage';
import { aiDeckChoice, DeckChoice, deckOptions, loadChoices, resolveDeck, saveChoices } from './deck-choice';
import { HeroBar } from './HeroBar';
import { HeroFigure } from './HeroVariants';
import { heroImage } from './hero-images';
import { CardFlight } from './CardFlight';
import { FLIGHT_MS, IMPACT_MS, lunge, nudge, reducedMotion } from './motion';
import { EnergyBar } from './EnergyBar';
import { HeroSkills } from './HeroSkills';
import { heroOptions, loadHeroChoices, resolveHero, saveHeroChoices, HeroChoice } from './hero-choice';
import { deckRows } from './deck-rows';
import { describeEvents, MYSTERY_HINT, mysteryCategory } from './describe-events';
import { isMuted, playSounds, setMuted, soundsFor } from './sounds';
import { targetLinePath, TargetLineStyle } from './target-line';
import { startDragGhost, DragGhost } from './drag-ghost';
import { UiThemePicker } from '../ui-theme/UiThemePicker';
import { playUiSound } from '../ui-theme/ui-sfx';
import styles from './play-board.module.scss';

let activeGhost: DragGhost | null = null; // the opaque card that follows the pointer during a hand drag

type Mode = 'ai' | 'hotseat';
type PlayAction = Extract<Action, { type: 'PlayCard' }>;
const AI_PLAYER: PlayerId = '1';
const AI_DELAY_MS = 800;
/** How long the AI's aiming arrow shows before a targeted action happens. */
const AI_AIM_MS = 1100;
/** 'curve' or 'straight'; both are supported by `targetLinePath`. */
const TARGET_LINE_STYLE: TargetLineStyle = 'curve';

type Selection =
  | { kind: 'hand'; index: number; choice?: number }
  | { kind: 'minion'; id: number }
  | { kind: 'hero' }
  | { kind: 'skill'; index: number };

const { cards, byId: baseById } = loadHsCards();
/** The cards plus the minions and weapons hero skills create. */
const byId = withHeroTokens(baseById);
const pool = playablePool(cards);
const prime = primePool(cards);
/** " as Zeus" for the start-of-game log line; empty without a hero. */
const heroText = (s: GameState, p: PlayerId) => {
  const hero = getHero(s.players[p].hero?.id);
  return hero ? ` as ${hero.name}` : '';
};
const otherPlayer = (p: PlayerId): PlayerId => (p === '0' ? '1' : '0');
/** What a player is called on the board: your own name for Player 1, "Player 2" (and "(AI)" against the bot) for the other seat. */
const playerLabel = (p: PlayerId, mode: Mode, myName: string) =>
  p === '0' ? myName : `Player 2${mode === 'ai' && p === AI_PLAYER ? ' (AI)' : ''}`;
/** The art of a card (`artBackground`: art, then `fallbackId`'s art, then PLACEHOLDER.jpg when a file is missing). */
const artStyle = (id?: string, fallbackId?: string): React.CSSProperties => ({ backgroundImage: artBackground(id, fallbackId) });
/** An invisible 1px drag image: the aim arrow shows an attack, so no ghost of the attacker needs to cover the targets. */
const blankDragImage = (() => {
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  return img;
})();
/** While a drag is active the body carries this class, which hides the hover popups (see play-board.module.scss). */
const setDragging = (on: boolean) => document.body.classList.toggle('dragging', on);
/** Card type -> accent colour class (minion blue, spell purple, weapon orange, item teal). */
const typeClass = (type?: string) => (type ? styles[`type_${type}`] ?? '' : '');
const targetKey = (t: TargetRef) => (t.kind === 'hero' ? `h${t.player}` : `m${t.instanceId}`);
const centerOf = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
const sameTarget = (a: TargetRef, b: TargetRef) =>
  a.kind === 'hero' ? b.kind === 'hero' && a.player === b.player : b.kind === 'minion' && a.instanceId === b.instanceId;

/** Renders log markup: `**Player 1**` (coloured by side) and `__Card__` (bold italic). */
const plain = (text?: string) => (text ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const tipByName = new Map(
  cards.map((c) => [
    c.name,
    `${c.name} (${c.cost})${c.type === 'minion' || c.type === 'weapon' ? ` ${c.attack}/${c.health}` : ''}${
      c.race && c.race !== 'NONE' ? ` ${(c.raceName ?? c.race).toLowerCase()}` : ''
    }: ${plain(c.text)}`,
  ])
);
/** Instant tooltip (fixed-position, so scrolling panels can't clip it). `side` is which way it opens from the element. */
const useTip = (tip: string | undefined, side: 'left' | 'right' = 'right', quiet = false) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPos({ x: side === 'right' ? r.right + 8 : r.left - 8, y: r.top });
    },
    onMouseLeave: () => setPos(null),
  };
  // Rendered into <body>: inside a minion (which is scaled while selected and thrown while attacking) a fixed element
  // is positioned against that transform, not the window, and the tip landed far away (playtest 2026-11-13).
  const node =
    pos && tip && !quiet && typeof document !== 'undefined'
      ? createPortal(
          <span
            className={styles.logTip}
            style={{ left: pos.x, top: pos.y, transform: side === 'left' ? 'translateX(-100%)' : undefined }}
          >
            {tip}
          </span>,
          document.body
        )
      : null;
  return { handlers, node };
};
/** Width of a card in hand at full size (the hand shrinks them together when it gets crowded). */
const HAND_CARD_WIDTH = 144;
/** How many px of the tops of the cards in hand stay visible above the bottom edge of the window. */
const HAND_PEEK = 110;
const LogCard = ({ name }: { name: string }) => {
  const { handlers, node } = useTip(tipByName.get(name));
  return (
    <strong className={styles.logCard} {...handlers}>
      <em>{name}</em>
      {node}
    </strong>
  );
};
/** A deck-tracker row; its tooltip opens to the left because the panel is pinned to the right edge. */
const DeckRow = ({ name, children, className }: { name: string; children: React.ReactNode; className: string }) => {
  const { handlers, node } = useTip(tipByName.get(name), 'left');
  return (
    <div className={className} {...handlers}>
      {children}
      {node}
    </div>
  );
};
interface Ghost {
  key: number;
  owner: PlayerId;
  index: number;
  m: MinionInstance;
  /** ms to wait before dying: an attack's killing blow has to land first */
  delay: number;
}
/** How long a death plays before the slot is gone (see `minionDie` in board-minion.module.scss). */
const DEATH_MS = 750;
/** The row of minions with this owner's ghosts put back at the places their minions died. */
const withGhosts = (nodes: React.ReactNode[], ghosts: Ghost[], owner: PlayerId, renderGhost: (g: Ghost) => React.ReactNode) => {
  const out = [...nodes];
  [...ghosts]
    .filter((g) => g.owner === owner)
    .sort((a, b) => a.index - b.index)
    .forEach((g) => out.splice(Math.min(g.index, out.length), 0, renderGhost(g)));
  return out;
};
/** A board minion: hovering shows its printed card next to its current stats. */
const MinionTip = ({ card, m, className, onClick, children, nodeRef, quiet, ...rest }: any) => {
  const printed = card ? tipByName.get(card.name) ?? [card.name, card.text].filter(Boolean).join('\n') : undefined;
  const { handlers, node } = useTip(printed && `${printed}\nNow: ${m.attack}/${m.health} (max ${m.maxHealth})`, 'right', quiet);
  return (
    <button
      {...rest}
      ref={nodeRef}
      type="button"
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        handlers.onMouseEnter(e);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        handlers.onMouseLeave();
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
      {node}
    </button>
  );
};
const renderLogLine = (line: string, myName: string, colors: Record<'0' | '1', string>) =>
  line.split(/(\*\*.+?\*\*|__.+?__)/g).map((part, i) => {
    if (part.startsWith('**')) {
      const text = part.slice(2, -2);
      return (
        <strong key={i} className={text === 'Player 1' ? styles.logMe : styles.logFoe} style={{ color: text === 'Player 1' ? colors['0'] : colors['1'] }}>
          {logName(text, myName)}
        </strong>
      );
    }
    if (part.startsWith('__')) {
      const name = part.slice(2, -2);
      return (
        <LogCard key={i} name={name} />
      );
    }
    return part;
  });

const targetOf = (a: Action): TargetRef | undefined =>
  a.type === 'PlayCard' || a.type === 'Attack' || a.type === 'WeaponAttack' || a.type === 'HeroSkill' ? a.target : undefined;

/**
 * Debug URL params for /play (read on every new game): `?first=0|1` picks who goes first (Player 1 = 0),
 * `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand (in hand order),
 * `?b0=CORE_027,...` and `?b1=...` put ready minions on that player's board, `?w0=CORE_076` and `?w1=...` equip a weapon,
 * `?e0=10` and `?e1=...` set that player's energy (current and total, 0-10), `?h0=ZEUS` and `?h1=...` pick a hero (or `none`).
 */
const debugParams = (): { first?: PlayerId; hands: Record<PlayerId, string[]>; setup: DebugSetup; heroes: Record<PlayerId, string | null> } => {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const list = (k: string) => (q.get(k) ?? '').split(',').map((x) => x.trim()).filter((id) => byId.has(id));
  const f = q.get('first');
  const weapon = (k: string) => list(k)[0];
  const energy = (k: string) => {
    const n = parseInt(q.get(k) ?? '', 10);
    return Number.isNaN(n) ? undefined : Math.min(10, Math.max(0, n));
  };
  return {
    first: f === '0' || f === '1' ? f : undefined,
    hands: { '0': list('p0'), '1': list('p1') },
    heroes: { '0': q.get('h0'), '1': q.get('h1') },
    setup: {
      boards: { '0': list('b0'), '1': list('b1') },
      weapons: { '0': weapon('w0'), '1': weapon('w1') },
      energy: { '0': energy('e0'), '1': energy('e1') },
    },
  };
};

const newGame = (vsAi: boolean, seed?: number): { state: GameState; rng: Rng; decks: Record<PlayerId, string[]>; first: PlayerId; deckNames: Record<PlayerId, string> } => {
  const rng = createSeededRng(seed ?? Date.now() % 2147483647);
  const choices = loadChoices();
  const saved = loadDecks(byId);
  const p0 = resolveDeck(choices['0'], pool, saved, rng, prime);
  // The AI never plays a saved deck: it gets a starter deck (or a random one if there is none to pick).
  const p1 = resolveDeck(vsAi ? aiDeckChoice(choices['1']) : choices['1'], pool, saved, rng, prime);
  const decks = { '0': p0.cards, '1': p1.cards };
  const dbg = debugParams();
  const heroChoices = loadHeroChoices();
  const heroKeys = {
    // A saved deck with its own hero brings it along; otherwise the picker's hero is used.
    '0': resolveHero(dbg.heroes['0'] ?? p0.hero ?? heroChoices['0'], rng),
    '1': resolveHero(dbg.heroes['1'] ?? p1.hero ?? heroChoices['1'], rng),
  };
  const randomFirst: PlayerId = rng.int(2) === 0 ? '0' : '1';
  const first: PlayerId = dbg.first ?? randomFirst;
  let state = createGame(
    { decks, firstPlayer: first, secondPlayerBonusCard: 'GAME_001', heroes: { '0': heroKeys['0'], '1': heroKeys['1'] } },
    rng
  );
  state = produce(state, (g) => {
    (['0', '1'] as PlayerId[]).forEach((p) => {
      const me = g.players[p];
      dbg.hands[p].forEach((cardId, i) => {
        if (i >= me.hand.length) return;
        // Swap with a copy still in the deck when there is one (keeps the deck tracker honest); else overwrite the slot.
        const inDeck = me.deck.findIndex((c) => c.cardId === cardId);
        if (inDeck >= 0) me.deck[inDeck].cardId = me.hand[i].cardId;
        me.hand[i].cardId = cardId;
      });
    });
  });
  state = applyDebugSetup(state, dbg.setup, byId);
  return { state, rng, decks, first, deckNames: { '0': p0.name, '1': p1.name } };
};

/** Hot-seat board: the active player is always at the bottom, the other player's hand is hidden. */
/**
 * Layout-lab mode (the /board-lab page): no AI and no turn clock, a fixed seed (so decks and hands are the same every game), and the
 * boards and energy follow these props live instead of restarting the game.
 */
export interface LabProps {
  boards: Record<PlayerId, string[]>;
  energy: Record<PlayerId, number | undefined>;
  /** Whose turn it is (the toggle in the lab); unset leaves the game's own */
  active?: PlayerId;
}
const LAB_SEED = 20261114;

export const PlayBoard = ({ lab }: { lab?: LabProps }) => {
  const [state, setState] = useState<GameState | null>(null);
  /** One entry per action, oldest first. */
  const [log, setLog] = useState<string[][]>([]);
  /** Each player's deck list at the start, for the deck tracker on the right. */
  const [startDecks, setStartDecks] = useState<Record<PlayerId, string[]>>({ '0': [], '1': [] });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<Mode>('ai');
  const [smartAi, setSmartAi] = useState(true);
  const modeRef = useRef<Mode>('ai');
  const viewerRef = useRef<PlayerId>('0');
  modeRef.current = mode;
  const [menuOpen, setMenuOpen] = useState(false);
  /** The player's name and colour theme, edited on the /profile page (this browser only for now; see player-profile/profile.ts). */
  const [profile, setProfileState] = useState<PlayerProfile>(DEFAULT_PROFILE);
  useEffect(() => setProfileState(loadProfile()), []);
  /** Each side's colour: yours is your theme; the other seat is red (blue if you chose red). */
  const sideColors = { '0': themeOf(profile.theme).color, '1': foeTheme(profile.theme).color } as Record<'0' | '1', string>;
  /** The "New game" deck picker: null when closed, else the choices being edited. */
  const [picker, setPicker] = useState<Record<PlayerId, DeckChoice> | null>(null);
  const [heroPicker, setHeroPicker] = useState<Record<PlayerId, HeroChoice>>({ '0': 'random', '1': 'random' });
  /** The spell just cast, shown briefly in the middle of the board. */
  const [castFx, setCastFx] = useState<{ card: Card; owner: PlayerId; n: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => setSoundOn(!isMuted()), []);
  /** Accessibility mode (one menu option for now): hover titles, a visible focus outline and explicit "Play" buttons after
   *  selecting a card. Off by default; saved. More settings will be split out of it later. */
  const [a11y, setA11y] = useState(false);
  useEffect(() => setA11y(isAccessible()), []);
  // PROTOTYPE: ?herofig=1 draws each hero as the Vol 14 figure card (components/play-board/HeroVariants.tsx) instead of the bar.
  const [figUi, setFigUi] = useState(false);
  useEffect(() => setFigUi(new URLSearchParams(window.location.search).has('herofig')), []);
  /** Turn timer: 60 s per turn (15 s with Cronus on a board), on by default; running out ends the turn. Local stand-in for a server clock. */
  const [timerOn, setTimerOnState] = useState(true);
  useEffect(() => setTimerOnState(isTimerOn()), []);
  const [gameKey, setGameKey] = useState(0);
  const turnStartedAt = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());
  const rngRef = useRef<Rng | null>(null);
  // The log shows the newest line at the bottom and stays pinned there unless you scroll up to read older events.
  const logRef = useRef<HTMLDivElement | null>(null);
  const logPinned = useRef(true);
  // Targeting line: where the pointer is, which character it is over, and the DOM nodes to draw between.
  /** The AI's pending targeted action: shown as an arrow first (a card from hand starts at the hero, so it stays hidden). */
  // Minions that just died stay on the board as ghosts while their death plays, then the row closes up.
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  // A minion played from your hand: its card flies from the hand to the slot, and the minion's landing waits for it.
  const [flight, setFlight] = useState<{ card: Card; instanceId: number; from: DOMRect } | null>(null);
  const [flightTo, setFlightTo] = useState<DOMRect | null>(null);
  const landDelay = useRef(new Map<number, number>());
  const [foeAim, setFoeAim] = useState<{ action: Action; from: string; to: TargetRef } | null>(null);
  const [hover, setHover] = useState<TargetRef | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const track = (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };
  const label = (p: PlayerId) => playerLabel(p, mode, profile.name);

  const start = useCallback(() => {
    const g = newGame(modeRef.current === 'ai', lab ? LAB_SEED : undefined);
    rngRef.current = g.rng;
    setState(g.state);
    setStartDecks(g.decks);
    const [a, b] = g.first === '0' ? ['Player 1', 'Player 2'] : ['Player 2', 'Player 1'];
    setLog([[`New game. **${a}** goes first; **${b}** starts with an extra card (__The Orb__).`, `**Player 1** plays **${g.deckNames['0']}**${heroText(g.state, '0')}; **Player 2** plays **${g.deckNames['1']}**${heroText(g.state, '1')}.`]]);
    setSelection(null);
    setMessage('');
    setFoeAim(null);
    setGameKey((k) => k + 1);
  }, []);

  // While something is selected: follow the pointer (for the targeting line), and let Escape or a
  // right-click cancel the selection.
  const hasSelection = selection !== null;
  useEffect(() => {
    if (!hasSelection) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null);
    };
    const rightClick = (e: MouseEvent) => {
      e.preventDefault(); // no browser context menu while cancelling
      setSelection(null);
    };
    window.addEventListener('keydown', key);
    window.addEventListener('contextmenu', rightClick);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('contextmenu', rightClick);
    };
  }, [hasSelection]);

  useEffect(() => {
    const el = logRef.current;
    if (el && logPinned.current) el.scrollTop = el.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (!menuOpen) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [menuOpen]);

  // Start on the client only: the deck shuffle uses the clock, which would not match server rendering.
  useEffect(start, [start]);

  // `body.dragging` hides the hover popups during a drag. A dropped card that gets played unmounts its own button, so its
  // dragend never reaches React; clear the class on any drop/dragend, on the first mouse move after a drag (browsers send
  // none during a native drag), and whenever the game state changes, so the tooltips can never stay hidden.
  useEffect(() => {
    const off = () => setDragging(false);
    window.addEventListener('mousemove', off);
    window.addEventListener('drop', off, true);
    window.addEventListener('dragend', off, true);
    return () => {
      window.removeEventListener('mousemove', off);
      window.removeEventListener('drop', off, true);
      window.removeEventListener('dragend', off, true);
    };
  }, []);
  useEffect(() => {
    setDragging(false);
  }, [state]);

  const dispatch = useCallback(
    (action: Action) => {
      if (!state || !rngRef.current) return;
      const result = applyAction(state, action, { rng: rngRef.current, catalog: byId });
      if ('error' in result) {
        setMessage(`Not allowed: ${result.error}`);
        return;
      }
      setMessage('');
      setSelection(null);
      (document.activeElement as HTMLElement | null)?.blur?.(); // keep no button "focused" after an action
      if (action.type === 'PlayCard') {
        const played = byId.get(state.players[state.activePlayer].hand[action.handIndex]?.cardId ?? '');
        // Spells and items (potions, scrolls) get the cast popup; a Mystery goes face down, so it never does (that would show the card).
        if ((played?.type === 'spell' || played?.type === 'item') && !getCardDef(played)?.mystery) {
          setCastFx({ card: played, owner: state.activePlayer, n: Date.now() });
        }
      }
      if (action.type === 'PlayCard' && state.activePlayer === viewerRef.current) {
        const card = byId.get(state.players[state.activePlayer].hand[action.handIndex]?.cardId ?? '');
        const played = result.events.find((e) => e.type === 'MinionPlayed');
        const handEl = nodes.current.get(`c${action.handIndex}`);
        if (card?.type === 'minion' && played && played.type === 'MinionPlayed' && handEl && !reducedMotion()) {
          landDelay.current.set(played.instanceId, FLIGHT_MS);
          setFlight({ card, instanceId: played.instanceId, from: handEl.getBoundingClientRect() });
          setTimeout(() => {
            setFlight(null);
            setFlightTo(null);
            landDelay.current.delete(played.instanceId);
          }, FLIGHT_MS + 60);
        }
      }
      // Attacks are thrown at the target; a big hit jolts the table when it lands.
      if (action.type === 'Attack' || action.type === 'WeaponAttack') {
        const from = nodes.current.get(action.type === 'Attack' ? `m${action.attackerId}` : `h${state.activePlayer}`);
        const to = action.target && nodes.current.get(targetKey(action.target));
        if (from && to) lunge(from, to);
        const dealt = result.events.reduce((n, e) => n + (e.type === 'MinionDamaged' || e.type === 'HeroDamaged' ? e.amount : 0), 0);
        if (dealt >= 4 && tableRef.current) nudge(tableRef.current, dealt);
      }
      const died = result.events.filter((e): e is Extract<GameEvent, { type: 'MinionDied' }> => e.type === 'MinionDied');
      if (died.length > 0 && !reducedMotion()) {
        const fresh: Ghost[] = [];
        for (const e of died) {
          const index = state.players[e.player].board.findIndex((m) => m.instanceId === e.instanceId);
          if (index >= 0)
            fresh.push({
              key: e.instanceId,
              owner: e.player,
              index,
              m: state.players[e.player].board[index],
              delay: action.type === 'Attack' || action.type === 'WeaponAttack' ? IMPACT_MS : 0,
            });
        }
        setGhosts((old) => [...old, ...fresh]);
        setTimeout(() => setGhosts((old) => old.filter((g) => !fresh.includes(g))), DEATH_MS + IMPACT_MS + 50);
      }
      setState(result.state);
      // Sounds wait for the picture's impact: the strike of an attack, or the landing of a minion that flew in from the hand.
      const isAttack = action.type === 'Attack' || action.type === 'WeaponAttack';
      const flew = action.type === 'PlayCard' && landDelay.current.size > 0;
      playSounds(soundsFor(result.events), reducedMotion() ? 0 : isAttack ? IMPACT_MS / 1000 : flew ? (FLIGHT_MS + 200) / 1000 : 0);
      setLog((old) => [...old, describeEvents(result.events, byId, state, result.state, modeRef.current === 'ai' ? '0' : null)].slice(-100));
    },
    [state]
  );

  // The viewer is who sits at the bottom: always Player 1 against the AI, the active player in hot-seat.
  const viewer: PlayerId = !state ? '0' : mode === 'ai' ? '0' : state.activePlayer;
  viewerRef.current = viewer;
  const aiToMove = !lab && !!state && mode === 'ai' && state.status === 'playing' && state.activePlayer === AI_PLAYER;

  // Lab mode: keep the boards and energy in step with the props without touching the hands, decks or heroes.
  const labKey = lab ? JSON.stringify([lab.boards, lab.energy, lab.active]) : '';
  useEffect(() => {
    if (!lab) return;
    setState((old) => {
      if (!old) return old;
      const cleared = produce(old, (g) => {
        (['0', '1'] as PlayerId[]).forEach((p) => {
          g.players[p].board = [];
        });
        if (lab.active) g.activePlayer = lab.active;
      });
      return applyDebugSetup(
        cleared,
        { boards: lab.boards, weapons: { '0': undefined, '1': undefined }, energy: lab.energy },
        byId
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labKey, gameKey]);

  // Once the new minion is on the board, measure where it is so the card knows where to land.
  useEffect(() => {
    if (!flight) return;
    const el = nodes.current.get(`m${flight.instanceId}`);
    if (el) setFlightTo(el.getBoundingClientRect());
  }, [flight]);

  // The clock restarts whenever a turn begins (or a new game). It counts only on a human's turn.
  const timerApplies = !lab && timerOn && !!state && state.status === 'playing' && !aiToMove;
  useEffect(() => {
    turnStartedAt.current = Date.now();
    setNow(Date.now());
  }, [state?.turn, state?.activePlayer, gameKey]);
  useEffect(() => {
    if (!timerApplies) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timerApplies]);
  const turnLimit = state ? turnSeconds(state, byId) : DEFAULT_TURN_SECONDS;
  const clockLeft = secondsLeft(turnStartedAt.current, now, turnLimit);
  const timedOut = timerApplies && clockLeft <= 0;
  useEffect(() => {
    if (timedOut) dispatch({ type: 'EndTurn' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  // The AI takes one action per tick, so you can follow what it does. A targeted action first shows an aiming arrow.
  useEffect(() => {
    if (!aiToMove || !state || !rngRef.current || foeAim) return;
    const rng = rngRef.current;
    const timer = setTimeout(() => {
      const action = (smartAi ? chooseGreedyAction : chooseRandomAction)(state, byId, rng);
      const to = targetOf(action);
      if (!to) return dispatch(action);
      const from =
        action.type === 'Attack' ? `m${action.attackerId}` : action.type === 'HeroSkill' ? `s${AI_PLAYER}-${action.skill}` : `h${AI_PLAYER}`;
      setFoeAim({ action, from, to });
    }, AI_DELAY_MS);
    return () => clearTimeout(timer);
  }, [aiToMove, state, dispatch, foeAim, smartAi]);
  useEffect(() => {
    if (!foeAim) return;
    const timer = setTimeout(() => {
      dispatch(foeAim.action);
      setFoeAim(null);
    }, AI_AIM_MS);
    return () => clearTimeout(timer);
  }, [foeAim, dispatch]);

  // With nothing selected, Escape opens the menu (with a selection it cancels it, handled above).
  const selectionRef = useRef<Selection | null>(null);
  selectionRef.current = selection;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectionRef.current && !menuOpenRef.current) setMenuOpen(true);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    if (!castFx) return;
    const timer = setTimeout(() => setCastFx(null), 1600);
    return () => clearTimeout(timer);
  }, [castFx]);

  // Keep the hand on one row: past what fits, the cards shrink together.
  const handRef = useRef<HTMLDivElement | null>(null);
  const [handWidth, setHandWidth] = useState(0);
  // How far the cards sink below the row so only their tops show; shrinks on short windows so they never vanish offscreen.
  const [handSink, setHandSink] = useState(100);
  // The cast-a-spell area is the board above the player bar: `bottomRef` is that bar's section, `tableRef` the board.
  const tableRef = useRef<HTMLDivElement | null>(null);
  /** The board's width, so a full row of seven minions fits (their size follows it). */
  const [boardWidth, setBoardWidth] = useState(0);
  const bottomRef = useRef<HTMLElement | null>(null);
  const [areaHeight, setAreaHeight] = useState(0);
  const [areaHot, setAreaHot] = useState(false);
  /** True when a pointer at this height is over the cast area, i.e. on the board and above the player bar. */
  const aboveBar = (clientY: number) => !!bottomRef.current && clientY < bottomRef.current.getBoundingClientRect().top;
  useEffect(() => {
    const el = handRef.current;
    if (!el) return;
    const measure = () => {
      setHandWidth(el.clientWidth);
      const zoom = handZoom(el.clientWidth, el.childElementCount, HAND_CARD_WIDTH);
      setHandSink(computeHandSink(window.innerHeight, el.getBoundingClientRect().bottom, zoom, HAND_PEEK));
      if (tableRef.current) setBoardWidth(tableRef.current.clientWidth);
      if (tableRef.current && bottomRef.current) {
        setAreaHeight(Math.max(0, Math.round(bottomRef.current.getBoundingClientRect().top - tableRef.current.getBoundingClientRect().top)));
      }
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);
    if (tableRef.current) ro.observe(tableRef.current);
    measure();
    return () => ro.disconnect();
  }, [state]);

  // Space ends the turn (when you can), unless a choice dialog is open.
  const [hoverGap, setHoverGap] = useState<number | null>(null);
  /** A "choose one" card being dragged (it is not selected until dropped, because selecting opens its dialog). */
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  /** The hand card being dragged: hidden in the hand so only the drag image shows. */
  const [draggedHand, setDraggedHand] = useState<number | null>(null);
  // A card dragged to aim at a target stays in the hand (selected, with the arrow); it must not take a click's enlargement.
  const [heldHand, setHeldHand] = useState<number | null>(null);
  // A dragged card that gets played unmounts its own button (when it was the last one in the hand), so its dragend never
  // reaches React and `draggedHand` would stay set: the next card drawn into that slot came up invisible (playtest 2026-11-12).
  // Clear it on any window drop/dragend (the drop event still fires) and whenever the game state changes. `dragIndex` is only
  // cleared on a state change, never on drop, because the drop handlers still need it.
  useEffect(() => {
    const clear = () => {
      setDraggedHand(null);
      setHeldHand(null);
    };
    window.addEventListener('drop', clear, true);
    window.addEventListener('dragend', clear, true);
    return () => {
      window.removeEventListener('drop', clear, true);
      window.removeEventListener('dragend', clear, true);
    };
  }, []);
  useEffect(() => {
    setDraggedHand(null);
    setHeldHand(null);
    setDragIndex(null);
  }, [state]);
  /** Where a choose-one card was dropped; picking its option in the dialog then plays it there. */
  const [pendingDrop, setPendingDrop] = useState<{ boardIndex?: number; target?: TargetRef } | null>(null);
  useEffect(() => {
    if (!selection) setPendingDrop(null);
  }, [selection]);
  const modalOpenRef = useRef(false);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
  // The menu's own sounds (they come from the interface theme and are silent in a theme without any).
  const menuWasOpen = useRef(false);
  useEffect(() => {
    if (menuOpen !== menuWasOpen.current) playUiSound(menuOpen ? 'open' : 'close');
    menuWasOpen.current = menuOpen;
  }, [menuOpen]);
  /** Set each render to `onNukeHero` while "Attack hero" is available (null otherwise): Shift+Space runs it. */
  const nukeRef = useRef<(() => void) | null>(null);
  const canEndTurn = !!state && state.status === 'playing' && !aiToMove;
  useEffect(() => {
    if (!canEndTurn) return;
    const down = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.repeat || modalOpenRef.current || menuOpenRef.current) return;
      e.preventDefault(); // no page scroll, and no click on a focused button
      // Shift+Space is "Attack hero": it does nothing when that is unavailable, so it can never end the turn by accident.
      if (e.shiftKey) nukeRef.current?.();
      else dispatch({ type: 'EndTurn' });
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [canEndTurn, dispatch]);

  // `legalActions` is empty when it is not that player's turn, which also locks the board during the AI's turn.
  const actions = useMemo(() => (state ? legalActions(state, viewer, byId) : []), [state, viewer]);

  if (!state || !rngRef.current) return <main className={styles.page}>Loading...</main>;

  const me = viewer;
  const foe = otherPlayer(me);
  const over = state.status === 'over';
  const myTurn = state.activePlayer === me;
  /** Links out of the game ask first while a game is still going. */
  const leaveGame = (e: { preventDefault: () => void }) => {
    if (!over && !window.confirm('Leave this game? It is not saved.')) e.preventDefault();
  };

  // What the current selection can aim at.
  const optionsFor = (sel: Selection | null): Action[] => {
    if (!sel) return [];
    if (sel.kind === 'hand') {
      const plays = actions.filter((a): a is PlayAction => a.type === 'PlayCard' && a.handIndex === sel.index);
      // A "choose one" card shows nothing to aim at until an option is picked.
      if (plays.some((a) => a.choice !== undefined)) return plays.filter((a) => a.choice === sel.choice);
      return plays;
    }
    if (sel.kind === 'minion') return actions.filter((a) => a.type === 'Attack' && a.attackerId === sel.id);
    if (sel.kind === 'skill') return actions.filter((a) => a.type === 'HeroSkill' && a.skill === sel.index);
    return actions.filter((a) => a.type === 'WeaponAttack');
  };
  const options = optionsFor(selection);
  const aimable = options.map(targetOf).filter((t): t is TargetRef => !!t);
  // A dragged choose-one card has no selection yet, so its legal targets and zones come straight from its plays.
  const dragPlays =
    dragIndex === null ? [] : actions.filter((a): a is PlayAction => a.type === 'PlayCard' && a.handIndex === dragIndex);
  const isAimable = (t: TargetRef) =>
    aimable.some((x) => sameTarget(x, t)) ||
    dragPlays.some((a) => {
      const at = targetOf(a);
      return !!at && sameTarget(at, t);
    });

  const clickTarget = (t: TargetRef) => {
    if (!isAimable(t)) return false;
    // For a minion with a warcry, prefer the rightmost board position.
    const matching = options.filter((a) => {
      const at = targetOf(a);
      return at && sameTarget(at, t);
    });
    const best = matching.reduce((a, b) =>
      a.type === 'PlayCard' && b.type === 'PlayCard' && (b.boardIndex ?? 0) > (a.boardIndex ?? 0) ? b : a
    );
    dispatch(best);
    return true;
  };

  // Spell damage from the viewer's board, shown on the spells in their hand.
  const mySpellDamage = state.players[viewer].board.reduce(
    (sum, m) => sum + (m.silenced ? 0 : getCardDef(byId.get(m.cardId)!)?.spellDamage ?? 0),
    0
  );

  // "Attack hero" button: with no enemy minions in the way, every ready minion and the hero's weapon hit the enemy hero.
  const heroHits = actions.filter(
    (a) => (a.type === 'Attack' || a.type === 'WeaponAttack') && a.target.kind === 'hero' && a.target.player === foe
  );
  const canNukeHero = !over && myTurn && state.players[foe].board.length === 0 && heroHits.length > 0;
  nukeRef.current = canNukeHero ? () => onNukeHero() : null;
  const onNukeHero = () => {
    if (!canNukeHero || !rngRef.current) return;
    const result = nukeHero(state, me, rngRef.current, byId);
    if (result.steps.length === 0) return;
    let cur = result.state;
    const lines = result.steps.map((s) => describeEvents(s.events, byId, s.before, cur, modeRef.current === 'ai' ? '0' : null));
    const heard = result.steps.flatMap((s) => s.events);
    if (cur.status === 'playing') {
      const r = applyAction(cur, { type: 'EndTurn' }, { rng: rngRef.current, catalog: byId });
      if (!('error' in r)) {
        lines.push(describeEvents(r.events, byId, cur, r.state, modeRef.current === 'ai' ? '0' : null));
        heard.push(...r.events);
        cur = r.state;
      }
    }
    setSelection(null);
    (document.activeElement as HTMLElement | null)?.blur?.();
    // "Attack hero" swings every attacker in turn: each is thrown at the hero, one after another, then the turn passes.
    if (!reducedMotion()) {
      const swings = heard.filter((e) => e.type === 'MinionAttacked' || e.type === 'WeaponAttacked');
      swings.forEach((e, i) => {
        setTimeout(() => {
          const from = nodes.current.get(e.type === 'MinionAttacked' ? `m${e.attackerId}` : `h${me}`);
          const to = nodes.current.get(targetKey((e as { target: TargetRef }).target));
          if (from && to) lunge(from, to);
        }, i * 320);
      });
    }
    setState(cur);
    playSounds(soundsFor(heard));
    setLog((old) => [...old, ...lines].slice(-100));
  };

  const canAttack = (m: MinionInstance) => actions.some((a) => a.type === 'Attack' && a.attackerId === m.instanceId);
  const heroCanSwing = actions.some((a) => a.type === 'WeaponAttack');

  const clickMinion = (owner: PlayerId, m: MinionInstance) => {
    if (over) return;
    if (clickTarget({ kind: 'minion', instanceId: m.instanceId })) return;
    if (owner === me && canAttack(m)) {
      setSelection(selection?.kind === 'minion' && selection.id === m.instanceId ? null : { kind: 'minion', id: m.instanceId });
    }
  };
  /** Click a skill button: an untargeted skill is used at once; a targeted one is selected and then aimed. */
  const pickSkill = (index: number) => {
    if (over) return;
    const uses = actions.filter((a): a is Extract<Action, { type: 'HeroSkill' }> => a.type === 'HeroSkill' && a.skill === index);
    if (uses.length === 0) return;
    if (uses.every((a) => !a.target)) dispatch(uses[0]);
    else setSelection(selection?.kind === 'skill' && selection.index === index ? null : { kind: 'skill', index });
  };
  const clickHero = (owner: PlayerId) => {
    if (over) return;
    if (clickTarget({ kind: 'hero', player: owner })) return;
    if (owner === me && heroCanSwing) setSelection(selection?.kind === 'hero' ? null : { kind: 'hero' });
  };

  const selectedCard =
    selection?.kind === 'hand' ? byId.get(state.players[me].hand[selection.index]?.cardId ?? '') : undefined;
  const untargetedPlays = selection?.kind === 'hand' ? options.filter((a) => !targetOf(a)) : [];

  // "Choose one" cards: one button per option. An option that needs no target plays right away.
  const choiceOptions: number[] =
    selection?.kind === 'hand' && selection.choice === undefined
      ? Array.from(
          new Set(
            actions.flatMap((a) => (a.type === 'PlayCard' && a.handIndex === selection.index && a.choice !== undefined ? [a.choice] : []))
          )
        )
      : [];
  const choiceLabel = (choice: number): string => {
    const card = selectedCard;
    const def = card && getCardDef(card);
    const raw = def?.choices?.[choice]?.label ?? `Option ${choice + 1}`;
    // A spell's damage option shows what it will really deal with your Spell Damage (the in-hand text already does).
    const base = card?.type === 'spell' ? plain(withSpellDamageText(raw, mySpellDamage)) : raw;
    // Surveying Drone: show which card each option keeps.
    const top = card?.id === 'CORE_055' ? byId.get(state.players[me].deck[choice]?.cardId ?? '') : undefined;
    return top ? `${base}: ${top.name}` : base;
  };
  const pickChoice = (choice: number) => {
    if (selection?.kind !== 'hand') return;
    const plays = actions.filter(
      (a): a is PlayAction => a.type === 'PlayCard' && a.handIndex === selection.index && a.choice === choice
    );
    if (pendingDrop) {
      const ctx = pendingDrop;
      setPendingDrop(null);
      const match = plays.find((a) => {
        const at = targetOf(a);
        if (ctx.target) return !!at && sameTarget(at, ctx.target);
        return !at && (ctx.boardIndex === undefined ? a.boardIndex === undefined : a.boardIndex !== undefined);
      });
      if (match) {
        dispatch(ctx.boardIndex !== undefined ? { ...match, boardIndex: ctx.boardIndex } : match);
        return;
      }
      // The option does not fit where it was dropped: fall through to the click flow.
    }
    if (plays.length > 0 && plays.every((a) => !a.target)) dispatch(plays[0]);
    else setSelection({ ...selection, choice });
  };

  // Drop zones: what a click would play right now (shown as a glow that brightens on hover).
  const placedPlays = untargetedPlays.filter((a) => a.type === 'PlayCard' && a.boardIndex !== undefined);
  const dragPlaced = dragPlays.some((a) => a.boardIndex !== undefined && !a.target);
  const dragLoose = dragPlays.some((a) => a.boardIndex === undefined && !a.target);
  const boardZone = (placedPlays.length > 0 || dragPlaced) && !over;
  // A dragged choose-one card is a global play until it is dropped: anywhere on the board opens its dialog (a targeted option
  // is then aimed with the arrow), as well as straight onto a target. Unless its options are placed on the board (a gap).
  const dragChoice = dragIndex !== null;
  const areaZone = ((untargetedPlays.length > 0 && placedPlays.length === 0) || ((dragLoose || dragChoice) && !dragPlaced)) && !over;
  const dropChoiceCard = (ctx: { boardIndex?: number; target?: TargetRef }) => {
    if (dragIndex === null) return;
    setPendingDrop(ctx);
    setSelection({ kind: 'hand', index: dragIndex });
    setDragIndex(null);
  };

  // The gap under the pointer, ignoring the spacer that marks it (so it does not move its own target).
  const gapAt = (row: Element, clickX: number) =>
    gapIndex(
      Array.from(row.children)
        .filter((el) => !el.hasAttribute('data-gap'))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return r.left + r.width / 2;
        }),
      clickX
    );
  const myBoard = state.players[me].board;
  const gapMarker = boardZone && hoverGap !== null && myBoard.length > 0 ? Math.min(hoverGap, myBoard.length) : null;

  // Click-to-play: with a minion selected, click your board where you want it to land (between two minions, or at either end);
  // with a spell or other card that needs no aim, click anywhere in the play area.
  const playFromArea = (e: React.MouseEvent, zone: 'board' | 'table', dropped = false) => {
    // A click on a button (a minion, End turn...) means something else; a card dropped over a minion still lands in the gap.
    if (over || selection?.kind !== 'hand' || (!dropped && (e.target as HTMLElement).closest('button'))) return;
    if (zone === 'table' && !aboveBar(e.clientY)) return; // the cast area ends at the player bar
    if (zone === 'board') e.stopPropagation();
    const plain = untargetedPlays.filter((a): a is PlayAction => a.type === 'PlayCard');
    const placed = plain.filter((a) => a.boardIndex !== undefined);
    if (placed.length > 0) {
      if (zone !== 'board') return;
      // Land in the gap nearest the click: between two minions, or at either end.
      const boardIndex = gapAt(e.currentTarget, e.clientX);
      const pick = placed[0];
      if (pick.type === 'PlayCard') dispatch({ ...pick, boardIndex });
    } else if (plain.length > 0) {
      dispatch(plain[0]);
    }
  };

  // Surveying Drone: a dialog showing the cards you can keep, with their stats.
  const droneModal = selectedCard?.id === 'CORE_055' && choiceOptions.length > 0;
  // Every "choose one" card asks in a dialog first, however small the options are.
  const choiceModal = choiceOptions.length > 0 && !droneModal;
  modalOpenRef.current = droneModal || choiceModal;

  // Drag and drop (the main way to play a card; clicking still works). Dragging selects the card, so the same drop zones,
  // targets and arrow show as for a click; dropping plays it exactly as a click would.
  const dropOnTarget = (t: TargetRef) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!isAimable(t)) return;
      e.preventDefault();
      setHover((h) => (h && targetKey(h) === targetKey(t) ? h : t)); // same target: no re-render per dragover event
    },
    onDragLeave: () => setHover(null),
    onDrop: (e: React.DragEvent) => {
      if (!isAimable(t)) return;
      e.preventDefault();
      e.stopPropagation(); // the play area behind it must not treat this drop as its own
      if (dragIndex !== null) dropChoiceCard({ target: t });
      else clickTarget(t);
      setHover(null);
    },
  });

  // Drag an attacker (your minion or hero) onto an enemy: it is selected for the drag, exactly like a click.
  const dragFrom = (sel: Selection) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', 'attack');
      e.dataTransfer.effectAllowed = 'move';
      setDragging(true);
      if (blankDragImage) e.dataTransfer.setDragImage(blankDragImage, 0, 0); // no ghost over the target: the arrow shows the attack
      setTimeout(() => setSelection(sel), 0);
    },
    onDragEnd: () => {
      setDragging(false);
      setSelection(null);
      setHover(null);
    },
  });

  // The oval height of every board minion, set on both rows (the CSS reads --m-h).
  const minionRowStyle = { ['--m-h' as string]: `${minionOvalHeight(boardWidth)}px` } as React.CSSProperties;
  const renderMinion = (owner: PlayerId, m: MinionInstance) => {
    const card = byId.get(m.cardId);
    const selected = selection?.kind === 'minion' && selection.id === m.instanceId;
    const aim = isAimable({ kind: 'minion', instanceId: m.instanceId });
    const sick = m.playedOnTurn === state.turn && !m.keywords.rush && owner === me;
    return (
      <MinionTip
        key={m.instanceId}
        card={card}
        m={m}
        nodeRef={track(`m${m.instanceId}`)}
        style={
          landDelay.current.has(m.instanceId)
            ? ({ animationDelay: `${landDelay.current.get(m.instanceId)}ms`, ['--land-delay' as string]: `${landDelay.current.get(m.instanceId)}ms` } as React.CSSProperties)
            : undefined
        }
        quiet={!!selection && selection.kind !== 'hand'} // no tooltips while an attack or skill is being aimed
        onMouseEnter={() => setHover({ kind: 'minion', instanceId: m.instanceId })}
        onMouseLeave={() => setHover(null)}
        {...dropOnTarget({ kind: 'minion', instanceId: m.instanceId })}
        {...(!over && owner === me && canAttack(m) ? dragFrom({ kind: 'minion', id: m.instanceId }) : {})}
        className={[
          minionStyles.slot,
          owner === me && canAttack(m) ? minionStyles.ready : '',
          selected ? minionStyles.selected : '',
          aim ? minionStyles.aim : '',
          aim && hover?.kind === 'minion' && hover.instanceId === m.instanceId ? minionStyles.aimHover : '',
        ].join(' ')}
        onClick={() => clickMinion(owner, m)}
      >
        <MinionFace card={card} m={m} turn={state.turn} sick={sick} />
      </MinionTip>
    );
  };

  const renderGhost = (g: Ghost) => (
    <div
      key={`dead${g.key}`}
      data-gap
      aria-hidden="true"
      className={[minionStyles.slot, minionStyles.dying].join(' ')}
      style={{ animationDelay: `${g.delay}ms` }}
    >
      <MinionFace card={byId.get(g.m.cardId)} m={g.m} turn={state.turn} sick={false} />
    </div>
  );

  const renderHero = (owner: PlayerId, isMe: boolean) => {
    const p = state.players[owner];
    const weapon = p.weapon && byId.get(p.weapon.cardId);
    const aim = isAimable({ kind: 'hero', player: owner });
    const isAi = mode === 'ai' && owner === AI_PLAYER;
    const hero = p.hero && getHero(p.hero.id);
    const skillRow = hero && p.hero && (
      <HeroSkills
        heroName={hero.name}
        selected={selection?.kind === 'skill' && isMe ? selection.index : null}
        interactive={isMe && !over && myTurn}
        nodeRef={(i) => track(`s${owner}-${i}`)}
        onPick={pickSkill}
        skills={hero.skills.map((s) => ({
          index: s.index,
          icon: heroImage(hero.id, `skill-${s.index + 1}`),
          name: s.name,
          cost: s.cost,
          text: s.text,
          usable: isMe && actions.some((a) => a.type === 'HeroSkill' && a.skill === s.index),
          cooldownLeft: p.hero!.cooldowns[s.index] ?? 0,
          spent: !!p.hero!.spent[s.index],
          targeted: !!s.target,
        }))}
      />
    );
    if (figUi && hero && p.hero) {
      return (
        <div className={[styles.figSlot, isMe ? styles.figMe : styles.figFoe].join(' ')}>
          <HeroFigure
            heroId={hero.id}
            name={hero.name}
            health={p.health}
            armor={p.armor}
            team={owner === '0' ? 'green' : 'red'}
            active={owner === state.activePlayer && !over}
            rootRef={track(`h${owner}`)}
            skillRef={(i) => track(`s${owner}-${i}`)}
            onSkill={pickSkill}
            aim={aim}
            aimHover={hover?.kind === 'hero' && hover.player === owner}
            selected={selection?.kind === 'hero' && isMe}
            canAct={isMe && heroCanSwing}
            skills={hero.skills.map((s) => {
              const cooldownLeft = p.hero!.cooldowns[s.index] ?? 0;
              const spent = !!p.hero!.spent[s.index];
              return {
                name: s.name,
                cost: s.cost,
                text: s.text,
                usable: isMe && !over && myTurn && actions.some((a) => a.type === 'HeroSkill' && a.skill === s.index),
                cooldownLeft,
                spent,
                selected: selection?.kind === 'skill' && isMe && selection.index === s.index,
                targeted: !!s.target,
              };
            })}
            dom={{
              onMouseEnter: () => setHover({ kind: 'hero', player: owner }),
              onMouseLeave: () => setHover(null),
              ...dropOnTarget({ kind: 'hero', player: owner }),
              ...(!over && isMe && heroCanSwing ? dragFrom({ kind: 'hero' }) : {}),
              onClick: () => clickHero(owner),
            }}
          />
        </div>
      );
    }
    const bar = (
      <HeroBar
        name={label(owner)}
        emblem={isAi ? 'AI' : owner === '0' ? '1' : '2'}
        portrait={hero ? heroImage(hero.id, 'avatar') : undefined}
        team={owner === '0' ? 'green' : 'red'}
        accent={sideColors[owner]}
        turnTag={owner === state.activePlayer ? (isAi ? 'thinking...' : 'your turn') : ''}
        active={owner === state.activePlayer && !over}
        health={p.health}
        armor={p.armor}
        energy={p.energy}
        overcharge={p.overcharge}
        mystery={
          p.mystery
            ? owner === viewer
              ? `${byId.get(p.mystery.cardId)?.name} (${mysteryCategory(p.mystery.cardId, byId)})`
              : `Mystery (${mysteryCategory(p.mystery.cardId, byId)})`
            : undefined
        }
        mysteryTip={
          p.mystery
            ? owner === viewer
              ? plain(byId.get(p.mystery.cardId)?.text)
              : MYSTERY_HINT[getCardDef(byId.get(p.mystery.cardId)!)?.mystery?.category ?? 'attack']
            : undefined
        }
        mysteryTipBelow={owner !== viewer}
        deck={p.deck.length}
        hand={p.hand.length}
        weapon={weapon && p.weapon ? { name: weapon.name ?? 'Weapon', attack: p.weapon.attack, durability: p.weapon.durability } : null}
        showTitles={a11y}
        weaponDisabled={p.heroDisabledOnTurn !== undefined && p.heroDisabledOnTurn >= state.turn}
        avatarRef={track(`h${owner}`)}
        aim={aim}
        aimHover={hover?.kind === 'hero' && hover.player === owner}
        selected={selection?.kind === 'hero' && isMe}
        canAct={isMe && heroCanSwing}
        onMouseEnter={() => setHover({ kind: 'hero', player: owner })}
        onMouseLeave={() => setHover(null)}
        {...dropOnTarget({ kind: 'hero', player: owner })}
        {...(!over && isMe && heroCanSwing ? dragFrom({ kind: 'hero' }) : {})}
        onClick={() => clickHero(owner)}
      />
    );
    return (
      <>
        {owner === viewer ? skillRow : null}
        {bar}
        {owner === viewer ? null : skillRow}
      </>
    );
  };

  const handCount = state.players[me].hand.length;
  // The card being dragged or selected: the energy bar blinks the orbs it would spend.
  const pendingIndex = selection?.kind === 'hand' ? selection.index : dragIndex;
  const pendingCard = pendingIndex === null ? undefined : byId.get(state.players[me].hand[pendingIndex]?.cardId ?? '');
  const pendingCost =
    pendingIndex === null || !pendingCard || over || !myTurn
      ? undefined
      : effectiveCost(state, viewer, pendingCard, byId, getCardDef, state.players[me].hand[pendingIndex]?.costDelta ?? 0);
  const zoomNow = handZoom(handWidth, handCount, HAND_CARD_WIDTH);
  const renderHandCard = (card: Card | undefined, index: number, instanceId: number) => {
    const playable = actions.some((a) => a.type === 'PlayCard' && a.handIndex === index);
    const selected = selection?.kind === 'hand' && selection.index === index;
    // "Choose one" cards are dragged without selecting (selecting opens the dialog); the drop opens it, then the pick plays it there.
    const isChoice = actions.some((a) => a.type === 'PlayCard' && a.handIndex === index && a.choice !== undefined);
    const draggable = !over && playable;
    return (
      <button
        key={instanceId}
        ref={track(`c${index}`)}
        style={{
          ['--fan-rot' as string]: `${fanRotation(index, handCount)}deg`,
          ['--fan-drop' as string]: `${fanDrop(index, handCount)}px`,
          ['--fan-x' as string]: `${fanX(index, handCount, HAND_CARD_WIDTH)}px`,
        }}
        title={titleIf(a11y, playable ? card?.text : `Can't play now. ${card?.text ?? ''}`)}
        className={[styles.handSlot, playable ? styles.slotReady : styles.slotDim, selected ? (heldHand === index || aimable.length > 0 ? styles.slotHeld : styles.slotSelected) : '', draggedHand === index ? styles.slotDragged : ''].join(' ')}
        onClick={() => !over && playable && setSelection(selected ? null : { kind: 'hand', index })}
        draggable={draggable}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', String(index)); // Firefox needs data to start a drag
          e.dataTransfer.effectAllowed = 'move';
          setDragging(true);
          // A card that aims at a target gets the arrow instead of a ghost (the ghost would cover the target); one that is
          // dropped on the board or play area has no arrow, so its ghost stays as the only drag feedback.
          // (A choose-one card has no arrow while it is dragged, since it is not selected, so it gets the ghost like any other card.)
          const aimsAtTarget = !!blankDragImage && !isChoice && actions.some((a) => a.type === 'PlayCard' && a.handIndex === index && a.target);
          if (aimsAtTarget) {
            e.dataTransfer.setDragImage(blankDragImage!, 0, 0);
          } else {
            // The browser's own drag image is always semi-transparent, so hide it and draw an opaque ghost that follows the pointer.
            if (blankDragImage) e.dataTransfer.setDragImage(blankDragImage, 0, 0);
            activeGhost?.stop();
            activeGhost = startDragGhost(e.currentTarget, HAND_CARD_WIDTH, HAND_CARD_WIDTH * 1.4, e.clientX, e.clientY);
          }
          // Select after the drag has begun: re-rendering the dragged card inside dragstart can cancel it.
          // The card is hidden in the hand only when a ghost replaces it; one that aims with the arrow stays put, selected,
          // so it does not vanish while the arrow is active (playtest 2026-11-12).
          setTimeout(() => {
            if (!aimsAtTarget) setDraggedHand(index);
            else setHeldHand(index);
            if (isChoice) setDragIndex(index);
            else setSelection({ kind: 'hand', index });
          }, 0);
        }}
        onDragEnd={() => {
          setDragging(false);
          activeGhost?.stop();
          activeGhost = null;
          if (!isChoice) setSelection(null); // a dropped choose-one card has just opened its dialog: keep that
          setDragIndex(null);
          setDraggedHand(null);
          setHeldHand(null);
          setHover(null);
          setHoverGap(null);
        }}
      >
        {card && <CardFace card={card} width={HAND_CARD_WIDTH} spellDamage={mySpellDamage} cost={effectiveCost(state, viewer, card, byId, getCardDef, state.players[viewer].hand[index]?.costDelta ?? 0)} />}
      </button>
    );
  };

  // The targeting line: from the selected card, minion or hero to the pointer (green over a legal target, else grey).
  const sourceKey =
    selection?.kind === 'hand'
      ? `c${selection.index}`
      : selection?.kind === 'minion'
      ? `m${selection.id}`
      : selection?.kind === 'skill'
      ? `s${me}-${selection.index}`
      : selection
      ? `h${me}`
      : null;
  const sourceEl = sourceKey ? nodes.current.get(sourceKey) : undefined;
  // The arrow always follows the pointer; a legal target under it is shown by highlighting that target.
  const overTarget = hover && isAimable(hover) ? nodes.current.get(targetKey(hover)) : undefined;
  const lineFrom = sourceEl && aimable.length > 0 ? centerOf(sourceEl) : null;

  const foeFromEl = foeAim ? nodes.current.get(foeAim.from) : undefined;
  const foeToEl = foeAim ? nodes.current.get(targetKey(foeAim.to)) : undefined;
  const foeFrom = foeFromEl ? centerOf(foeFromEl) : null;
  const foeTo = foeToEl ? centerOf(foeToEl) : null;

  return (
    <main className={[styles.page, a11y ? styles.a11y : ''].join(' ')}>
      {hasSelection && lineFrom && <AimArrow from={lineFrom} hit={!!overTarget} />}
      {foeFrom && foeTo && (
        <svg className={styles.targetLine} aria-hidden="true">
          <defs>
            <marker id="foe-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#ff6b6b" />
            </marker>
          </defs>
          <path
            d={targetLinePath(foeFrom, foeTo, TARGET_LINE_STYLE)}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth={4}
            strokeLinecap="round"
            markerEnd="url(#foe-arrowhead)"
          />
        </svg>
      )}
      {castFx && (
        <div key={castFx.n} className={[styles.castFx, castFx.owner === me ? styles.castMine : styles.castFoe].join(' ')}>
          <CardFace card={castFx.card} width={190} />
        </div>
      )}
      {over && !menuOpen && (
        <div className={styles.gameOver}>
          <strong className={styles.banner}>
            {state.winner === 'draw' ? 'Draw!' : `${label(state.winner as PlayerId)} wins!`}
          </strong>
          <button type="button" className={styles.endTurn} onClick={start}>
            New game
          </button>
        </div>
      )}
      <button type="button" className={`${styles.menuButton} ui-btn`} onClick={() => setMenuOpen(true)}>
        Menu
      </button>
      {menuOpen && (
        <div className={styles.modalBackdrop} data-ui-sfx onClick={() => setMenuOpen(false)}>
          <div className={`${styles.menu} ui-panel`} role="dialog" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <header className={styles.menuHead}>
              <h3>Menu</h3>
              <span className={styles.menuWho}>
                Playing as <b style={{ color: sideColors['0'] }}>{profile.name}</b> ·{' '}
                <a href="/profile" onClick={leaveGame}>
                  Profile
                </a>
              </span>
            </header>

            <button type="button" className={`${styles.menuPrimary} ui-btn ui-btn--primary`} autoFocus onClick={() => setMenuOpen(false)}>
              Resume
            </button>
            <div className={styles.menuPair}>
              <button type="button" className="ui-btn" onClick={() => { setMenuOpen(false); setPicker(loadChoices()); setHeroPicker(loadHeroChoices()); }}>
                New game
                <small>choose decks</small>
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--danger"
                disabled={over || !myTurn}
                onClick={() => { setMenuOpen(false); dispatch({ type: 'Concede' }); }}
              >
                Concede
                <small>{over ? 'game is over' : myTurn ? 'give up this game' : 'on your turn'}</small>
              </button>
            </div>

            <section className={`${styles.menuGroup} ui-group`} aria-label="Settings">
              <h4>Settings</h4>
              {[
                { label: 'Sound', on: soundOn, flip: () => { setMuted(soundOn); setSoundOn(!soundOn); } },
                { label: `Turn timer (${turnLimit}s)`, on: timerOn, flip: () => { setTimerOn(!timerOn); setTimerOnState(!timerOn); } },
                { label: 'Accessibility mode', on: a11y, flip: () => { setAccessible(!a11y); setA11y(!a11y); } },
              ].map((t) => (
                <button key={t.label} type="button" role="switch" aria-checked={t.on} className="ui-toggle" onClick={t.flip}>
                  <span>{t.label}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
              <div className="ui-seg" role="radiogroup" aria-label="Opponent">
                <span>Opponent</span>
                {[
                  { name: 'Greedy', hint: 'looks one move ahead', value: true },
                  { name: 'Random', hint: 'plays any legal move', value: false },
                ].map((o) => (
                  <button
                    key={o.name}
                    type="button"
                    role="radio"
                    aria-checked={smartAi === o.value}
                                        disabled={mode !== 'ai'}
                    title={o.hint}
                    onClick={() => setSmartAi(o.value)}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
              <div className="ui-seg" role="radiogroup" aria-label="Mode">
                <span>Mode</span>
                {([['ai', 'vs AI'], ['hotseat', 'Hot-seat']] as const).map(([m, name]) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                                        title="Switching starts a new game"
                    onClick={() => {
                      if (mode === m) return;
                      setMode(m);
                      setMenuOpen(false);
                      setTimeout(start, 0);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <UiThemePicker blurb={false} />
            </section>

            <footer className={styles.menuLinks}>
              <a href="/" onClick={leaveGame}>Home</a>
              <a href="/deckbuilder" onClick={leaveGame}>Deck builder</a>
              <a href="/collection" onClick={leaveGame}>Cards</a>
            </footer>
          </div>
        </div>
      )}
      {picker && (
        <div className={styles.modalBackdrop} data-ui-sfx onClick={() => setPicker(null)}>
          <div className={`${styles.modal} ui-panel`} onClick={(e) => e.stopPropagation()}>
            <h3>New game: choose decks</h3>
            {(['0', '1'] as PlayerId[]).map((p) => {
              const savedDecks = mode === 'ai' && p === AI_PLAYER ? [] : loadDecks(byId);
              const options = deckOptions(savedDecks);
              /** The hero a picked saved deck brings with it, if it has one. */
              const deckHero = (value: string) => savedDecks.find((d) => `saved:${d.id}` === value)?.hero;
              const picked = options.find((o) => o.value === picker[p]) ?? options[0];
              return (
                <label key={p} className={styles.deckPick}>
                  <span>{label(p)}</span>
                  <select className="ui-field" value={picked.value} onChange={(e) => setPicker({ ...picker, [p]: e.target.value })}>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <small>{picked.plan ?? ' '}</small>
                  <select
                    className="ui-field"
                    aria-label={`${label(p)} hero`}
                    disabled={!!deckHero(picked.value)}
                    title={deckHero(picked.value) ? 'This deck chooses its own hero (set in the deck builder)' : undefined}
                    value={deckHero(picked.value) ?? heroPicker[p]}
                    onChange={(e) => setHeroPicker({ ...heroPicker, [p]: e.target.value })}
                  >
                    {heroOptions().map((o) => (
                      <option key={o.value} value={o.value}>
                        Hero: {o.label}
                      </option>
                    ))}
                  </select>
                  <small>{heroOptions().find((o) => o.value === (deckHero(picked.value) ?? heroPicker[p]))?.plan ?? ' '}</small>
                </label>
              );
            })}
            <div className={styles.deckPickButtons}>
              <button type="button" className="ui-btn" onClick={() => setPicker(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--primary"
                autoFocus
                onClick={() => {
                  saveChoices(picker);
                  saveHeroChoices(heroPicker);
                  setPicker(null);
                  start();
                }}
              >
                Start
              </button>
            </div>
            <a href="/deckbuilder">Build your own deck</a>
          </div>
        </div>
      )}
      {droneModal && (
        <div className={styles.modalBackdrop} data-ui-sfx onClick={() => setSelection(null)}>
          <div className={`${styles.modal} ui-panel`} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedCard?.name}: pick a card to keep on top</h3>
            <div className={styles.modalCards}>
              {choiceOptions.map((c) => {
                const top = byId.get(state.players[me].deck[c]?.cardId ?? '');
                return (
                  <button key={c} type="button" style={artStyle(top?.id)} className={[styles.modalCard, styles.art].join(' ')} onClick={() => pickChoice(c)}>
                    <span className={styles.cost}>{top?.cost}</span>
                    <span className={styles.name}>{top?.name ?? 'Empty'}</span>
                    <span className={styles.type}>
                      {top?.type}
                      {top?.type === 'minion' || top?.type === 'weapon' ? ` ${top?.attack}/${top?.health}` : ''}
                      {top?.race && top.race !== 'NONE' ? ` · ${(top.raceName ?? top.race).toLowerCase()}` : ''}
                    </span>
                    <span className={styles.text}>{top?.text}</span>
                    <span className={styles.modalPick}>{choiceLabel(c).split(':')[0]}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="ui-btn" onClick={() => setSelection(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {choiceModal && (
        <div className={styles.modalBackdrop} data-ui-sfx onClick={() => setSelection(null)}>
          <div className={`${styles.modal} ui-panel`} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedCard?.name}: choose one</h3>
            <div className={styles.modalCards}>
              {choiceOptions.map((c) => {
                // Options print as their own entourage card where one exists (CORE_051a, CORE_128b...); else the card's own art.
                const opt = byId.get(`${selectedCard?.id}${'abcdef'[c]}`);
                return (
                  <button
                    key={c}
                    type="button"
                    style={artStyle(opt?.id ?? selectedCard?.id, selectedCard?.id)}
                    className={[styles.modalCard, typeClass(opt?.type ?? selectedCard?.type), styles.art].join(' ')}
                    onClick={() => pickChoice(c)}
                  >
                    {opt && <span className={styles.cost}>{opt.cost}</span>}
                    <span className={styles.name}>{opt?.name ?? choiceLabel(c)}</span>
                    {opt && (
                      <span className={styles.type}>
                        {opt.type}
                        {opt.type === 'minion' || opt.type === 'weapon' ? ` ${opt.attack}/${opt.health}` : ''}
                      </span>
                    )}
                    {opt && <span className={styles.text}>{plain(opt.text)}</span>}
                    <span className={styles.modalPick}>{choiceLabel(c)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="ui-btn" onClick={() => setSelection(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div
        ref={tableRef}
        className={styles.table}
        onClick={(e) => playFromArea(e, 'table')}
        onMouseMove={(e) => areaZone && setAreaHot(aboveBar(e.clientY))}
        onMouseLeave={() => setAreaHot(false)}
        onDragOverCapture={(e) => areaZone && setAreaHot(aboveBar(e.clientY))} // capture: a target under the pointer may stop the event
        onDragOver={(e) => areaZone && aboveBar(e.clientY) && e.preventDefault()}
        onDrop={(e) => {
          if (!areaZone || e.defaultPrevented || !aboveBar(e.clientY)) return;
          e.preventDefault();
          if (dragIndex !== null) dropChoiceCard({});
          else playFromArea(e, 'table', true);
        }}
      >
        {flight && flightTo && <CardFlight card={flight.card} from={flight.from} to={flightTo} width={HAND_CARD_WIDTH} />}
        <EnergyBar current={state.players[me].energy.current} total={state.players[me].energy.total} cost={pendingCost} />
        {areaZone && <div className={[styles.castArea, areaHot ? styles.castAreaHot : ''].join(' ')} style={{ height: areaHeight }} />}
        <section className={[styles.side, styles.top].join(' ')}>
          <div className={styles.backs}>
            {state.players[foe].hand.map((_, i, all) => (
              <div
                key={i}
                style={{ ['--back-rot' as string]: `${-fanRotation(i, all.length)}deg`, ['--back-rise' as string]: `${fanDrop(i, all.length) * 0.4}px` }}
                className={[styles.cardBack, foeAim?.action.type === 'PlayCard' && foeAim.action.handIndex === i ? styles.backPicked : ''].join(' ')}
              />
            ))}
          </div>
          {renderHero(foe, false)}
        </section>

        <div className={styles.center}>
          <div className={styles.row} style={minionRowStyle}>
            {withGhosts(state.players[foe].board.map((m) => renderMinion(foe, m)), ghosts, foe, renderGhost)}
          </div>
        <div className={styles.middle}>
          <button
            type="button"
            disabled={over || !myTurn}
            className={styles.endTurn}
            title={titleIf(a11y, 'Space')}
            onClick={() => dispatch({ type: 'EndTurn' })}
          >
            End turn
          </button>
          {over ? (
            <strong className={styles.banner}>
              {state.winner === 'draw' ? 'Draw!' : `${label(state.winner as PlayerId)} wins!`}
            </strong>
          ) : (
            <span>
              Turn {state.turn}: {label(state.activePlayer)}
              {timerApplies && <b className={[styles.clock, clockLeft <= 10 ? styles.clockLow : ''].join(' ')}> {formatClock(clockLeft)}</b>}
              {choiceOptions.length > 0 ? ' - choose one option' : ''}
              {boardZone ? ' - drag it (or click) onto your board; it lands in the gap you pick, between minions or at either end' : ''}
              {areaZone ? ' - drag it (or click) onto the play area to cast it' : ''}
              {aimable.length > 0 ? ' - drop it on a target, or click one (Esc, right-click or clicking the selection again cancels)' : ''}
            </span>
          )}
          {message && <span className={styles.error}>{message}</span>}
          {canNukeHero && (
            <button
              type="button"
              className={styles.attackHero}
              title={titleIf(a11y, 'Attack the enemy hero with every ready minion, left to right, then end your turn (Shift+Space)')}
              onClick={onNukeHero}
            >
              Attack hero
            </button>
          )}
        </div>
          <section className={styles.side}>
          <div
            className={[styles.row, boardZone ? styles.zone : ''].join(' ')}
            style={minionRowStyle}
            onClick={(e) => playFromArea(e, 'board')}
            onMouseMove={(e) => boardZone && setHoverGap(gapAt(e.currentTarget, e.clientX))}
            onMouseLeave={() => setHoverGap(null)}
            onDragOver={(e) => {
              if (!boardZone) return;
              e.preventDefault();
              setHoverGap(gapAt(e.currentTarget, e.clientX));
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoverGap(null);
            }}
            onDrop={(e) => {
              if (!boardZone) return;
              e.preventDefault();
              if (dragIndex !== null) {
                e.stopPropagation();
                dropChoiceCard({ boardIndex: gapAt(e.currentTarget, e.clientX) });
              } else playFromArea(e, 'board', true);
              setHoverGap(null);
            }}
          >
            {withGhosts(
              myBoard.map((m, i) => (
                <Fragment key={m.instanceId}>
                  {gapMarker === i && <div data-gap className={styles.gapSpacer} />}
                  {renderMinion(me, m)}
                </Fragment>
              )),
              ghosts,
              me,
              renderGhost
            )}
            {gapMarker === myBoard.length && <div data-gap className={styles.gapSpacer} />}
          </div>
          </section>
        </div>

        <section ref={bottomRef} className={[styles.side, styles.bottom].join(' ')}>
          {renderHero(me, true)}
          <div
            className={[styles.row, styles.hand].join(' ')}
            ref={handRef}
            style={{ ['--hand-zoom' as string]: zoomNow, ['--hand-sink' as string]: `${handSink}px` }}
          >
            {state.players[me].hand.map((c, i) => renderHandCard(byId.get(c.cardId), i, c.instanceId))}
          </div>
          {a11y && (
          <div className={styles.controls}>
            {untargetedPlays.map((a, i) => (
              <button key={i} type="button" className={styles.primary} onClick={() => dispatch(a)}>
                Play {selectedCard?.name}
                {a.type === 'PlayCard' && a.boardIndex !== undefined && state.players[me].board.length > 0
                  ? a.boardIndex === 0
                    ? ' (far left)'
                    : ' (far right)'
                  : ''}
              </button>
            ))}
          </div>
          )}
        </section>
      </div>

      <aside className={styles.deckView}>
        <h2>
          Deck <small>{state.players[me].deck.length} left</small>
        </h2>
        <div className={styles.deckRows}>
          {deckRows(startDecks[me], state.players[me].deck.map((c) => c.cardId), byId).map((r) => (
            <DeckRow key={r.id} name={r.name} className={[styles.deckRow, r.left === 0 ? styles.deckGone : ''].join(' ')}>
              <span className={styles.deckCost}>{r.cost}</span>
              <span className={styles.deckName}>{r.name}</span>
              <span className={styles.deckCount}>{r.total > 1 ? `${r.left}/${r.total}` : r.left}</span>
            </DeckRow>
          ))}
        </div>
      </aside>

      <aside className={styles.log}>
        <h2>Log</h2>
        <div
          className={styles.logLines}
          ref={logRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            logPinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          }}
        >
          {log.map((lines, i) => (
            <div key={i} className={styles.logBatch}>
              {lines.map((l, j) => (
                <div key={j}>{renderLogLine(l, profile.name, sideColors)}</div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
};
