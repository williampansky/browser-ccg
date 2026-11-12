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
const artStyle = (id?: string): React.CSSProperties | undefined => {
  const m = id?.match(/^(CORE|GAME)_(.+)$/);
  return m ? { backgroundImage: `url(/images/sets/SET_${m[1]}/${m[2]}-CARD.jpg)` } : undefined;
};
/** Zoom for the hand so `n` cards (9rem wide, 0.5rem apart) fit `width` px on one row. */
const handScale = (width: number, n: number) => (width > 0 && n > 0 ? Math.min(1, (width + 8) / (n * (144 + 8))) : 1);
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
      c.race && c.race !== 'NONE' ? ` ${c.race.toLowerCase()}` : ''
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
/** Hovering a hand card shows an enlarged copy above it, readable at a glance. */
const HandPreview = ({ card, children }: { card?: Card; children: (h: { onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void; onMouseLeave: () => void }) => React.ReactNode }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      {children({
        onMouseEnter: (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: r.left + r.width / 2, y: r.top });
        },
        onMouseLeave: () => setPos(null),
      })}
      {pos && card && (
        <div className={[styles.handPreview, typeClass(card.type), styles.art].join(' ')} style={{ left: pos.x, top: pos.y, ...artStyle(card.id) }}>
          <span className={styles.cost}>{card.cost}</span>
          <strong>{card.name}</strong>
          <span className={styles.type}>
            {card.type}
            {card.type === 'minion' || card.type === 'weapon' ? ` ${card.attack}/${card.health}` : ''}
            {card.race && card.race !== 'NONE' ? ` · ${card.race.toLowerCase()}` : ''}
          </span>
          <span className={styles.previewText}>{plain(card.text)}</span>
        </div>
      )}
    </>
  );
};
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
 * `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand (in hand order).
 */
const debugParams = (): { first?: PlayerId; hands: Record<PlayerId, string[]> } => {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const list = (k: string) => (q.get(k) ?? '').split(',').map((x) => x.trim()).filter((id) => byId.has(id));
  const f = q.get('first');
  return { first: f === '0' || f === '1' ? f : undefined, hands: { '0': list('p0'), '1': list('p1') } };
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
  /** Accessibility: explicit "Play" buttons after selecting a card (off by default; clicking the board plays it). */
  /** The spell just cast, shown briefly in the middle of the board. */
  const [castFx, setCastFx] = useState<{ card: Card; owner: PlayerId; n: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => setSoundOn(!isMuted()), []);
  const [playButtons, setPlayButtons] = useState(false);
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
  useEffect(() => {
    const el = handRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHandWidth(el.clientWidth));
    ro.observe(el);
    setHandWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [state === null]);

  // Space ends the turn (when you can), unless a choice dialog is open.
  const [hoverGap, setHoverGap] = useState<number | null>(null);
  const modalOpenRef = useRef(false);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
  const canEndTurn = !!state && state.status === 'playing' && !aiToMove;
  useEffect(() => {
    if (!canEndTurn) return;
    const down = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.repeat || modalOpenRef.current || menuOpenRef.current) return;
      e.preventDefault(); // no page scroll, and no click on a focused button
      dispatch({ type: 'EndTurn' });
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
  const isAimable = (t: TargetRef) => aimable.some((x) => sameTarget(x, t));

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

  // "Attack hero": with no enemy minions in the way, every ready minion hits the enemy hero, left to right.
  const heroHits = actions.filter(
    (a): a is Extract<Action, { type: 'Attack' }> => a.type === 'Attack' && a.target.kind === 'hero' && a.target.player === foe
  );
  const canAttackHero = !over && myTurn && state.players[foe].board.length === 0 && heroHits.length > 0;
  const attackHero = () => {
    if (!canAttackHero || !rngRef.current) return;
    const ctx = { rng: rngRef.current, catalog: byId };
    let cur = state;
    const lines: string[][] = [];
    const heard: GameEvent[] = [];
    const run = (action: Action) => {
      const r = applyAction(cur, action, ctx);
      if ('error' in r) return false;
      lines.push(describeEvents(r.events, byId, cur, r.state));
      heard.push(...r.events);
      cur = r.state;
      return true;
    };
    // Left to right; a minion keeps swinging while it can (Onslaught attacks twice).
    for (const m of state.players[me].board) {
      for (let swings = 0; swings < 4 && cur.status === 'playing'; swings++) {
        const hit = legalActions(cur, me, byId).find(
          (a) => a.type === 'Attack' && a.attackerId === m.instanceId && a.target.kind === 'hero' && a.target.player === foe
        );
        if (!hit || !run(hit)) break;
      }
    }
    if (cur === state) return;
    if (cur.status === 'playing') run({ type: 'EndTurn' });
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
    if (plays.length > 0 && plays.every((a) => !a.target)) dispatch(plays[0]);
    else setSelection({ ...selection, choice });
  };

  // Drop zones: what a click would play right now (shown as a glow that brightens on hover).
  const placedPlays = untargetedPlays.filter((a) => a.type === 'PlayCard' && a.boardIndex !== undefined);
  const boardZone = placedPlays.length > 0 && !over;
  const areaZone = untargetedPlays.length > 0 && placedPlays.length === 0 && !over;

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
      clickTarget(t);
      setHover(null);
    },
  });

  // Drag an attacker (your minion or hero) onto an enemy: it is selected for the drag, exactly like a click.
  const dragFrom = (sel: Selection) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', 'attack');
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => setSelection(sel), 0);
    },
    onDragEnd: () => {
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
        {card?.race && card.race !== 'NONE' && <span className={styles.race}>{card.race.toLowerCase()}</span>}
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
    return (
      <button
        ref={track(`h${owner}`)}
        onMouseEnter={() => setHover({ kind: 'hero', player: owner })}
        onMouseLeave={() => setHover(null)}
        {...dropOnTarget({ kind: 'hero', player: owner })}
        {...(!over && isMe && heroCanSwing ? dragFrom({ kind: 'hero' }) : {})}
        type="button"
        className={[
          styles.hero,
          aim ? styles.aim : '',
          aim && hover?.kind === 'hero' && hover.player === owner ? styles.aimHover : '',
          selection?.kind === 'hero' && isMe ? styles.selected : '',
          isMe && heroCanSwing ? styles.ready : '',
        ].join(' ')}
        onClick={() => clickHero(owner)}
      >
        <strong>
          {label(owner)}
          {owner === state.activePlayer ? (mode === 'ai' && owner === AI_PLAYER ? ' (thinking...)' : ' (your turn)') : ''}
        </strong>
        <span>
          Health {p.health}/30{p.armor > 0 ? ` + ${p.armor} armor` : ''}
        </span>
        <span>
          Energy {p.energy.current}/{p.energy.total}
        </span>
        <span>
          Deck {p.deck.length} · Hand {p.hand.length}
        </span>
        {p.heroDisabledOnTurn !== undefined && p.heroDisabledOnTurn >= state.turn && (
          <span className={styles.disabledTag}>Disabled: no weapon attack</span>
        )}
        <span>{weapon ? `Weapon: ${weapon.name} ${p.weapon?.attack}/${p.weapon?.durability}` : 'No weapon'}</span>
      </button>
    );
  };

  const renderHandCard = (card: Card | undefined, index: number) => {
    const playable = actions.some((a) => a.type === 'PlayCard' && a.handIndex === index);
    const selected = selection?.kind === 'hand' && selection.index === index;
    // "Choose one" cards ask in a dialog first, so they are click-only.
    const draggable = !over && playable && !actions.some((a) => a.type === 'PlayCard' && a.handIndex === index && a.choice !== undefined);
    return (
      <HandPreview key={index} card={card}>
        {(hover) => (
      <button
        {...hover}
        ref={track(`c${index}`)}
        type="button"
        aria-disabled={over || !playable}
        title={playable ? card?.text : `Can't play now. ${card?.text ?? ''}`}
        style={artStyle(card?.id)}
        className={[styles.handCard, typeClass(card?.type), styles.art, playable ? styles.ready : styles.dim, selected ? styles.selected : ''].join(' ')}
        onClick={() => !over && playable && setSelection(selected ? null : { kind: 'hand', index })}
        draggable={draggable}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', String(index)); // Firefox needs data to start a drag
          e.dataTransfer.effectAllowed = 'move';
          // Select after the drag has begun: re-rendering the dragged card inside dragstart can cancel it.
          setTimeout(() => setSelection({ kind: 'hand', index }), 0);
        }}
        onDragEnd={() => {
          setSelection(null);
          setHover(null);
          setHoverGap(null);
        }}
      >
        <span className={styles.cost}>{card?.cost}</span>
        <span className={styles.name}>{card?.name}</span>
        <span className={styles.type}>
          {card?.type}
          {card?.type === 'minion' || card?.type === 'weapon' ? ` ${card?.attack}/${card?.health}` : ''}
          {card?.race && card.race !== 'NONE' ? ` · ${card.race.toLowerCase()}` : ''}
        </span>
        <span className={styles.text}>{card?.text}</span>
      </button>
        )}
      </HandPreview>
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
    <main className={styles.page}>
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
        <div key={castFx.n} className={[styles.castFx, typeClass(castFx.card.type), styles.art, castFx.owner === me ? styles.castMine : styles.castFoe].join(' ')} style={artStyle(castFx.card.id)}>
          <strong>{castFx.card.name}</strong>
          <span>{plain(castFx.card.text)}</span>
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
            <button type="button" onClick={() => setPlayButtons(!playButtons)}>
              Accessibility: "Play" buttons after selecting a card: {playButtons ? 'on' : 'off'}
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
                      {top?.race && top.race !== 'NONE' ? ` · ${top.race.toLowerCase()}` : ''}
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
                    style={artStyle(opt?.id) ?? artStyle(selectedCard?.id)}
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
        className={[styles.table, areaZone ? styles.zone : ''].join(' ')}
        onClick={(e) => playFromArea(e, 'table')}
        onDragOver={(e) => areaZone && e.preventDefault()}
        onDrop={(e) => {
          if (!areaZone) return;
          e.preventDefault();
          playFromArea(e, 'table', true);
        }}
      >
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
            title="Space"
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
          {canAttackHero && (
            <button
              type="button"
              className={styles.attackHero}
              title="Attack the enemy hero with every ready minion, left to right, then end your turn"
              onClick={attackHero}
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
              playFromArea(e, 'board', true);
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

        <section className={[styles.side, styles.bottom].join(' ')}>
          {renderHero(me, true)}
          <div
            className={[styles.row, styles.hand].join(' ')}
            ref={handRef}
            style={{ ['--hand-zoom' as string]: handScale(handWidth, state.players[me].hand.length) }}
          >
            {state.players[me].hand.map((c, i) => renderHandCard(byId.get(c.cardId), i))}
          </div>
          {playButtons && (
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
