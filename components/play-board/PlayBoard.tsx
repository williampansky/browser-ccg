import { produce } from 'immer';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Action,
  applyAction,
  buildDeck,
  chooseGreedyAction,
  chooseRandomAction,
  getCardDef,
  Card,
  createGame,
  createSeededRng,
  GameEvent,
  GameState,
  legalActions,
  loadHsCards,
  MinionInstance,
  playablePool,
  PlayerId,
  Rng,
  TargetRef,
} from '../../engine';
import { gapIndex } from './board-position';
import { isAccessible, setAccessible, titleIf } from './accessibility';
import { fanDrop, fanRotation, HAND_CARD_HEIGHT, handSink as computeHandSink, handZoom } from './hand-fan';
import { applyDebugSetup, DebugSetup } from './debug-setup';
import { nukeHero } from './nuke-hero';
import { CardFace } from './CardFace';
import { HeroBar } from './HeroBar';
import { deckRows } from './deck-rows';
import { describeEvents } from './describe-events';
import { isMuted, playSounds, setMuted, soundsFor } from './sounds';
import { targetLinePath, TargetLineStyle } from './target-line';
import styles from './play-board.module.scss';

type Mode = 'ai' | 'hotseat';
type PlayAction = Extract<Action, { type: 'PlayCard' }>;
const AI_PLAYER: PlayerId = '1';
const AI_DELAY_MS = 800;
/** How long the AI's aiming arrow shows before a targeted action happens. */
const AI_AIM_MS = 1100;
/** 'curve' or 'straight'; both are supported by `targetLinePath`. */
const TARGET_LINE_STYLE: TargetLineStyle = 'curve';

type Selection = { kind: 'hand'; index: number; choice?: number } | { kind: 'minion'; id: number } | { kind: 'hero' };

const { cards, byId } = loadHsCards();
const pool = playablePool(cards);
const otherPlayer = (p: PlayerId): PlayerId => (p === '0' ? '1' : '0');
const playerLabel = (p: PlayerId, mode: Mode) => `Player ${Number(p) + 1}${mode === 'ai' && p === AI_PLAYER ? ' (AI)' : ''}`;
/** CORE_012 -> /images/sets/SET_CORE/012-CARD.jpg, GAME_001 -> /images/sets/SET_GAME/001-CARD.jpg. */
const artUrlOf = (id?: string): string | undefined => {
  const m = id?.match(/^(CORE|GAME)_(.+)$/);
  return m ? `url(/images/sets/SET_${m[1]}/${m[2]}-CARD.jpg)` : undefined;
};
/** The art of a card. With `fallbackId`, that card's art is a second background layer: it shows when the first image is missing (404). */
const artStyle = (id?: string, fallbackId?: string): React.CSSProperties | undefined => {
  const layers = [artUrlOf(id), id !== fallbackId ? artUrlOf(fallbackId) : undefined].filter(Boolean);
  return layers.length ? { backgroundImage: layers.join(', ') } : undefined;
};
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
const useTip = (tip: string | undefined, side: 'left' | 'right' = 'right') => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPos({ x: side === 'right' ? r.right + 8 : r.left - 8, y: r.top });
    },
    onMouseLeave: () => setPos(null),
  };
  const node =
    pos && tip ? (
      <span
        className={styles.logTip}
        style={{ left: pos.x, top: pos.y, transform: side === 'left' ? 'translateX(-100%)' : undefined }}
      >
        {tip}
      </span>
    ) : null;
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
/** A board minion: hovering shows its printed card next to its current stats. */
const MinionTip = ({ card, m, className, onClick, children, nodeRef, ...rest }: any) => {
  const printed = card ? `${tipByName.get(card.name)}` : undefined;
  const { handlers, node } = useTip(printed && `${printed}\nNow: ${m.attack}/${m.health} (max ${m.maxHealth})`);
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
const renderLogLine = (line: string) =>
  line.split(/(\*\*.+?\*\*|__.+?__)/g).map((part, i) => {
    if (part.startsWith('**')) {
      const text = part.slice(2, -2);
      return (
        <strong key={i} className={text === 'Player 1' ? styles.logMe : styles.logFoe}>
          {text}
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
  a.type === 'PlayCard' || a.type === 'Attack' || a.type === 'WeaponAttack' ? a.target : undefined;

/**
 * Debug URL params for /play (read on every new game): `?first=0|1` picks who goes first (Player 1 = 0),
 * `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand (in hand order),
 * `?b0=CORE_027,...` and `?b1=...` put ready minions on that player's board, `?w0=CORE_076` and `?w1=...` equip a weapon,
 * `?e0=10` and `?e1=...` set that player's energy (current and total, 0-10).
 */
const debugParams = (): { first?: PlayerId; hands: Record<PlayerId, string[]>; setup: DebugSetup } => {
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
    setup: {
      boards: { '0': list('b0'), '1': list('b1') },
      weapons: { '0': weapon('w0'), '1': weapon('w1') },
      energy: { '0': energy('e0'), '1': energy('e1') },
    },
  };
};

const newGame = (): { state: GameState; rng: Rng; decks: Record<PlayerId, string[]>; first: PlayerId } => {
  const rng = createSeededRng(Date.now() % 2147483647);
  const decks = { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) };
  const dbg = debugParams();
  const randomFirst: PlayerId = rng.int(2) === 0 ? '0' : '1';
  const first: PlayerId = dbg.first ?? randomFirst;
  let state = createGame({ decks, firstPlayer: first, secondPlayerBonusCard: 'GAME_001' }, rng);
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
  return { state, rng, decks, first };
};

/** Hot-seat board: the active player is always at the bottom, the other player's hand is hidden. */
export const PlayBoard = () => {
  const [state, setState] = useState<GameState | null>(null);
  /** One entry per action, oldest first. */
  const [log, setLog] = useState<string[][]>([]);
  /** Each player's deck list at the start, for the deck tracker on the right. */
  const [startDecks, setStartDecks] = useState<Record<PlayerId, string[]>>({ '0': [], '1': [] });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<Mode>('ai');
  const [smartAi, setSmartAi] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  /** The spell just cast, shown briefly in the middle of the board. */
  const [castFx, setCastFx] = useState<{ card: Card; owner: PlayerId; n: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => setSoundOn(!isMuted()), []);
  /** Accessibility mode (one menu option for now): hover titles, a visible focus outline and explicit "Play" buttons after
   *  selecting a card. Off by default; saved. More settings will be split out of it later. */
  const [a11y, setA11y] = useState(false);
  useEffect(() => setA11y(isAccessible()), []);
  const rngRef = useRef<Rng | null>(null);
  // The log shows the newest line at the bottom and stays pinned there unless you scroll up to read older events.
  const logRef = useRef<HTMLDivElement | null>(null);
  const logPinned = useRef(true);
  // Targeting line: where the pointer is, which character it is over, and the DOM nodes to draw between.
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  /** The AI's pending targeted action: shown as an arrow first (a card from hand starts at the hero, so it stays hidden). */
  const [foeAim, setFoeAim] = useState<{ action: Action; from: string; to: TargetRef } | null>(null);
  const [hover, setHover] = useState<TargetRef | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const track = (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };
  const label = (p: PlayerId) => playerLabel(p, mode);

  const start = useCallback(() => {
    const g = newGame();
    rngRef.current = g.rng;
    setState(g.state);
    setStartDecks(g.decks);
    const [a, b] = g.first === '0' ? ['Player 1', 'Player 2'] : ['Player 2', 'Player 1'];
    setLog([[`New game. **${a}** goes first; **${b}** starts with an extra card (__The Orb__).`]]);
    setSelection(null);
    setMessage('');
    setFoeAim(null);
  }, []);

  // While something is selected: follow the pointer (for the targeting line), and let Escape or a
  // right-click cancel the selection.
  const hasSelection = selection !== null;
  useEffect(() => {
    if (!hasSelection) {
      setPointer(null);
      return;
    }
    const move = (e: MouseEvent) => setPointer({ x: e.clientX, y: e.clientY });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null);
    };
    const rightClick = (e: MouseEvent) => {
      e.preventDefault(); // no browser context menu while cancelling
      setSelection(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('dragover', move); // a native drag suppresses mousemove
    window.addEventListener('keydown', key);
    window.addEventListener('contextmenu', rightClick);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('dragover', move);
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
        if (played?.type === 'spell') setCastFx({ card: played, owner: state.activePlayer, n: Date.now() });
      }
      setState(result.state);
      playSounds(soundsFor(result.events));
      setLog((old) => [...old, describeEvents(result.events, byId, state, result.state)].slice(-100));
    },
    [state]
  );

  // The viewer is who sits at the bottom: always Player 1 against the AI, the active player in hot-seat.
  const viewer: PlayerId = !state ? '0' : mode === 'ai' ? '0' : state.activePlayer;
  const aiToMove = !!state && mode === 'ai' && state.status === 'playing' && state.activePlayer === AI_PLAYER;

  // The AI takes one action per tick, so you can follow what it does. A targeted action first shows an aiming arrow.
  useEffect(() => {
    if (!aiToMove || !state || !rngRef.current || foeAim) return;
    const rng = rngRef.current;
    const timer = setTimeout(() => {
      const action = (smartAi ? chooseGreedyAction : chooseRandomAction)(state, byId, rng);
      const to = targetOf(action);
      if (!to) return dispatch(action);
      const from = action.type === 'Attack' ? `m${action.attackerId}` : `h${AI_PLAYER}`;
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
  /** Where a choose-one card was dropped; picking its option in the dialog then plays it there. */
  const [pendingDrop, setPendingDrop] = useState<{ boardIndex?: number; target?: TargetRef } | null>(null);
  useEffect(() => {
    if (!selection) setPendingDrop(null);
  }, [selection]);
  const modalOpenRef = useRef(false);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
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
    (sum, m) => sum + (getCardDef(byId.get(m.cardId)!)?.spellDamage ?? 0),
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
    const lines = result.steps.map((s) => describeEvents(s.events, byId, s.before, cur));
    const heard = result.steps.flatMap((s) => s.events);
    if (cur.status === 'playing') {
      const r = applyAction(cur, { type: 'EndTurn' }, { rng: rngRef.current, catalog: byId });
      if (!('error' in r)) {
        lines.push(describeEvents(r.events, byId, cur, r.state));
        heard.push(...r.events);
        cur = r.state;
      }
    }
    setSelection(null);
    (document.activeElement as HTMLElement | null)?.blur?.();
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
    const base = def?.choices?.[choice]?.label ?? `Option ${choice + 1}`;
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
      setHover(t);
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

  const renderMinion = (owner: PlayerId, m: MinionInstance) => {
    const card = byId.get(m.cardId);
    const selected = selection?.kind === 'minion' && selection.id === m.instanceId;
    const aim = isAimable({ kind: 'minion', instanceId: m.instanceId });
    const sick = m.playedOnTurn === state.turn && !m.keywords.rush && owner === me;
    const tags = [
      m.keywords.guard && 'Guard',
      m.keywords.rush && 'Stampede',
      m.keywords.bubble && 'Bubble',
      m.keywords.hidden && 'Concealed',
      m.keywords.doubleAttack && 'Onslaught',
      m.keywords.noAttack && "Can't attack",
      m.disabledOnTurn !== undefined && m.disabledOnTurn >= state.turn && 'Disabled',
      m.expiresOnTurn !== undefined && 'Expiring',
      sick && 'zzz',
    ].filter(Boolean);
    return (
      <MinionTip
        key={m.instanceId}
        card={card}
        m={m}
        nodeRef={track(`m${m.instanceId}`)}
        onMouseEnter={() => setHover({ kind: 'minion', instanceId: m.instanceId })}
        onMouseLeave={() => setHover(null)}
        {...dropOnTarget({ kind: 'minion', instanceId: m.instanceId })}
        {...(!over && owner === me && canAttack(m) ? dragFrom({ kind: 'minion', id: m.instanceId }) : {})}
        style={artStyle(m.cardId)}
        className={[
          styles.minion,
          styles.art,
          m.keywords.guard ? styles.guard : '',
          owner === me && canAttack(m) ? styles.ready : '',
          selected ? styles.selected : '',
          aim ? styles.aim : '',
          aim && hover?.kind === 'minion' && hover.instanceId === m.instanceId ? styles.aimHover : '',
        ].join(' ')}
        onClick={() => clickMinion(owner, m)}
      >
        <span className={styles.name}>{card?.name ?? m.cardId}</span>
        {card?.race && card.race !== 'NONE' && <span className={styles.race}>{(card.raceName ?? card.race).toLowerCase()}</span>}
        <span className={styles.stats}>
          <span className={styles.atk}>{m.attack}</span>
          <span className={m.health < m.maxHealth ? styles.hurt : styles.hp}>{m.health}</span>
        </span>
        <span className={styles.tags}>{tags.join(' · ')}</span>
      </MinionTip>
    );
  };

  const renderHero = (owner: PlayerId, isMe: boolean) => {
    const p = state.players[owner];
    const weapon = p.weapon && byId.get(p.weapon.cardId);
    const aim = isAimable({ kind: 'hero', player: owner });
    const isAi = mode === 'ai' && owner === AI_PLAYER;
    return (
      <HeroBar
        name={label(owner)}
        emblem={isAi ? 'AI' : owner === '0' ? '1' : '2'}
        team={owner === '0' ? 'green' : 'red'}
        turnTag={owner === state.activePlayer ? (isAi ? 'thinking...' : 'your turn') : ''}
        active={owner === state.activePlayer && !over}
        health={p.health}
        armor={p.armor}
        energy={p.energy}
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
  };

  const handCount = state.players[me].hand.length;
  const renderHandCard = (card: Card | undefined, index: number) => {
    const playable = actions.some((a) => a.type === 'PlayCard' && a.handIndex === index);
    const selected = selection?.kind === 'hand' && selection.index === index;
    // "Choose one" cards are dragged without selecting (selecting opens the dialog); the drop opens it, then the pick plays it there.
    const isChoice = actions.some((a) => a.type === 'PlayCard' && a.handIndex === index && a.choice !== undefined);
    const draggable = !over && playable;
    return (
      <button
        key={index}
        ref={track(`c${index}`)}
        style={{ ['--fan-rot' as string]: `${fanRotation(index, handCount)}deg`, ['--fan-drop' as string]: `${fanDrop(index, handCount)}px` }}
        type="button"
        aria-disabled={over || !playable}
        title={titleIf(a11y, playable ? card?.text : `Can't play now. ${card?.text ?? ''}`)}
        className={[styles.handSlot, playable ? styles.slotReady : styles.slotDim, selected ? styles.slotSelected : '', draggedHand === index ? styles.slotDragged : ''].join(' ')}
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
            // The ghost is a plain clone at rest size, held by its centre. The browser's own snapshot is of the card as hovered
            // (lifted and scaled 1.5x) and keeps the grab offset from that bigger card, which put the ghost far above the cursor.
            const clone = e.currentTarget.cloneNode(true) as HTMLElement;
            clone.removeAttribute('id');
            clone.style.cssText = 'position:fixed;left:-1000px;top:0;transform:none;transition:none;animation:none;filter:none;opacity:1;visibility:visible;';
            document.body.appendChild(clone);
            e.dataTransfer.setDragImage(clone, HAND_CARD_WIDTH / 2, (HAND_CARD_WIDTH * 1.4) / 2);
            setTimeout(() => clone.remove(), 0);
          }
          // Select after the drag has begun: re-rendering the dragged card inside dragstart can cancel it.
          // The card is hidden in the hand only when a ghost replaces it; one that aims with the arrow stays put, selected,
          // so it does not vanish while the arrow is active (playtest 2026-11-12).
          setTimeout(() => {
            if (!aimsAtTarget) setDraggedHand(index);
            if (isChoice) setDragIndex(index);
            else setSelection({ kind: 'hand', index });
          }, 0);
        }}
        onDragEnd={() => {
          setDragging(false);
          if (!isChoice) setSelection(null); // a dropped choose-one card has just opened its dialog: keep that
          setDragIndex(null);
          setDraggedHand(null);
          setHover(null);
          setHoverGap(null);
        }}
      >
        {card && <CardFace card={card} width={HAND_CARD_WIDTH} spellDamage={mySpellDamage} />}
      </button>
    );
  };

  // The targeting line: from the selected card, minion or hero to the pointer (green over a legal target, else grey).
  const sourceKey =
    selection?.kind === 'hand' ? `c${selection.index}` : selection?.kind === 'minion' ? `m${selection.id}` : selection ? `h${me}` : null;
  const sourceEl = sourceKey ? nodes.current.get(sourceKey) : undefined;
  // The arrow always follows the pointer; a legal target under it is shown by highlighting that target.
  const overTarget = hover && isAimable(hover) ? nodes.current.get(targetKey(hover)) : undefined;
  const lineFrom = sourceEl && aimable.length > 0 ? centerOf(sourceEl) : null;
  const lineTo = pointer;

  const foeFromEl = foeAim ? nodes.current.get(foeAim.from) : undefined;
  const foeToEl = foeAim ? nodes.current.get(targetKey(foeAim.to)) : undefined;
  const foeFrom = foeFromEl ? centerOf(foeFromEl) : null;
  const foeTo = foeToEl ? centerOf(foeToEl) : null;

  return (
    <main className={[styles.page, a11y ? styles.a11y : ''].join(' ')}>
      {lineFrom && lineTo && (
        <svg className={styles.targetLine} aria-hidden="true">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={overTarget ? '#3ddc84' : '#bbb'} />
            </marker>
          </defs>
          <path
            d={targetLinePath(lineFrom, lineTo, TARGET_LINE_STYLE)}
            fill="none"
            stroke={overTarget ? '#3ddc84' : '#bbb'}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={overTarget ? undefined : '8 6'}
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}
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
      <button type="button" className={styles.menuButton} onClick={() => setMenuOpen(true)}>
        Menu
      </button>
      {menuOpen && (
        <div className={styles.modalBackdrop} onClick={() => setMenuOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Menu</h3>
            <button type="button" onClick={() => setMenuOpen(false)}>
              Resume
            </button>
            <button type="button" disabled={over || !myTurn} onClick={() => { setMenuOpen(false); dispatch({ type: 'Concede' }); }}>
              Concede
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); start(); }}>
              New game
            </button>
            <button
              type="button"
              onClick={() => {
                setAccessible(!a11y);
                setA11y(!a11y);
              }}
            >
              Accessibility mode: {a11y ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMuted(soundOn);
                setSoundOn(!soundOn);
              }}
            >
              Sound: {soundOn ? 'on' : 'off'}
            </button>
            <button type="button" onClick={() => setSmartAi(!smartAi)}>
              AI: {smartAi ? 'greedy (looks one move ahead)' : 'random'} (click to switch)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'ai' ? 'hotseat' : 'ai');
                setMenuOpen(false);
                setTimeout(start, 0);
              }}
            >
              Mode: {mode === 'ai' ? 'vs AI' : 'hot-seat'} (click to switch, starts a new game)
            </button>
          </div>
        </div>
      )}
      {droneModal && (
        <div className={styles.modalBackdrop} onClick={() => setSelection(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
            <button type="button" onClick={() => setSelection(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {choiceModal && (
        <div className={styles.modalBackdrop} onClick={() => setSelection(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
            <button type="button" onClick={() => setSelection(null)}>
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
        {areaZone && <div className={[styles.castArea, areaHot ? styles.castAreaHot : ''].join(' ')} style={{ height: areaHeight }} />}
        <section className={[styles.side, styles.top].join(' ')}>
          <div className={styles.backs}>
            {state.players[foe].hand.map((_, i) => (
              <div
                key={i}
                className={[styles.cardBack, foeAim?.action.type === 'PlayCard' && foeAim.action.handIndex === i ? styles.backPicked : ''].join(' ')}
              />
            ))}
          </div>
          {renderHero(foe, false)}
        </section>

        <div className={styles.center}>
          <div className={styles.row}>{state.players[foe].board.map((m) => renderMinion(foe, m))}</div>
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
            {myBoard.map((m, i) => (
              <Fragment key={m.instanceId}>
                {gapMarker === i && <div data-gap className={styles.gapSpacer} />}
                {renderMinion(me, m)}
              </Fragment>
            ))}
            {gapMarker === myBoard.length && <div data-gap className={styles.gapSpacer} />}
          </div>
          </section>
        </div>

        <section ref={bottomRef} className={[styles.side, styles.bottom].join(' ')}>
          {renderHero(me, true)}
          <div
            className={[styles.row, styles.hand].join(' ')}
            ref={handRef}
            style={{ ['--hand-zoom' as string]: handZoom(handWidth, handCount, HAND_CARD_WIDTH), ['--hand-sink' as string]: `${handSink}px` }}
          >
            {state.players[me].hand.map((c, i) => renderHandCard(byId.get(c.cardId), i))}
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
                <div key={j}>{renderLogLine(l)}</div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
};
