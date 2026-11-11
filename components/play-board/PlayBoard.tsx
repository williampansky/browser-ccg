import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Action,
  applyAction,
  buildDeck,
  chooseRandomAction,
  getCardDef,
  Card,
  createGame,
  createSeededRng,
  GameState,
  legalActions,
  loadHsCards,
  MinionInstance,
  playablePool,
  PlayerId,
  Rng,
  TargetRef,
} from '../../engine';
import { deckRows } from './deck-rows';
import { describeEvents } from './describe-events';
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
/** Card name in the log with an instant tooltip (fixed-position, so the scrolling log can't clip it). */
const LogCard = ({ name }: { name: string }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const tip = tipByName.get(name);
  return (
    <strong
      className={styles.logCard}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: r.right + 8, y: r.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <em>{name}</em>
      {pos && tip && (
        <span className={styles.logTip} style={{ left: pos.x, top: pos.y }}>
          {tip}
        </span>
      )}
    </strong>
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

const newGame = (): { state: GameState; rng: Rng; decks: Record<PlayerId, string[]> } => {
  const rng = createSeededRng(Date.now() % 2147483647);
  const decks = { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) };
  const state = createGame({ decks, firstPlayer: '0', secondPlayerBonusCard: 'GAME_001' }, rng);
  return { state, rng, decks };
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
  const [menuOpen, setMenuOpen] = useState(false);
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
    setLog([['New game. **Player 1** goes first; **Player 2** starts with an extra card (__The Orb__).']]);
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
    window.addEventListener('keydown', key);
    window.addEventListener('contextmenu', rightClick);
    return () => {
      window.removeEventListener('mousemove', move);
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
      setState(result.state);
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
      const action = chooseRandomAction(state, byId, rng);
      const to = targetOf(action);
      if (!to) return dispatch(action);
      const from = action.type === 'Attack' ? `m${action.attackerId}` : `h${AI_PLAYER}`;
      setFoeAim({ action, from, to });
    }, AI_DELAY_MS);
    return () => clearTimeout(timer);
  }, [aiToMove, state, dispatch, foeAim]);
  useEffect(() => {
    if (!foeAim) return;
    const timer = setTimeout(() => {
      dispatch(foeAim.action);
      setFoeAim(null);
    }, AI_AIM_MS);
    return () => clearTimeout(timer);
  }, [foeAim, dispatch]);

  // Space ends the turn (when you can), unless a choice dialog is open.
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

  // Click-to-play: with a minion selected, click your board (left half = far left, right half = far right);
  // with a spell or other card that needs no aim, click anywhere in the play area.
  const playFromArea = (e: React.MouseEvent, zone: 'board' | 'table') => {
    if (over || selection?.kind !== 'hand' || (e.target as HTMLElement).closest('button')) return;
    if (zone === 'board') e.stopPropagation();
    const plain = untargetedPlays.filter((a): a is PlayAction => a.type === 'PlayCard');
    const placed = plain.filter((a) => a.boardIndex !== undefined);
    if (placed.length > 0) {
      if (zone !== 'board') return;
      const box = e.currentTarget.getBoundingClientRect();
      const left = e.clientX < box.left + box.width / 2;
      const pick = placed.find((a) => (a.boardIndex === 0) === left) ?? placed[0];
      dispatch(pick);
    } else if (plain.length > 0) {
      dispatch(plain[0]);
    }
  };

  // Surveying Drone: a dialog showing the cards you can keep, with their stats.
  const droneModal = selectedCard?.id === 'CORE_055' && choiceOptions.length > 0;
  // Every "choose one" card asks in a dialog first, however small the options are.
  const choiceModal = choiceOptions.length > 0 && !droneModal;
  modalOpenRef.current = droneModal || choiceModal;

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
      <button
        key={m.instanceId}
        ref={track(`m${m.instanceId}`)}
        onMouseEnter={() => setHover({ kind: 'minion', instanceId: m.instanceId })}
        onMouseLeave={() => setHover(null)}
        type="button"
        title={card?.text}
        className={[
          styles.minion,
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
      </button>
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
    return (
      <button
        key={index}
        ref={track(`c${index}`)}
        type="button"
        disabled={over || !playable}
        title={playable ? card?.text : `Can't play now. ${card?.text ?? ''}`}
        className={[styles.handCard, playable ? styles.ready : styles.dim, selected ? styles.selected : ''].join(' ')}
        onClick={() => setSelection(selected ? null : { kind: 'hand', index })}
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
                  <button key={c} type="button" className={styles.modalCard} onClick={() => pickChoice(c)}>
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
              {choiceOptions.map((c) => (
                <button key={c} type="button" className={styles.modalCard} onClick={() => pickChoice(c)}>
                  <span className={styles.name}>{choiceLabel(c)}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelection(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className={[styles.table, areaZone ? styles.zone : ''].join(' ')} onClick={(e) => playFromArea(e, 'table')}>
        <section className={styles.side}>
          {renderHero(foe, false)}
          <div className={styles.row}>{state.players[foe].board.map((m) => renderMinion(foe, m))}</div>
        </section>

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
              {boardZone ? ' - click your board to play it (left half: far left, right half: far right)' : ''}
              {areaZone ? ' - click the play area to cast it' : ''}
              {aimable.length > 0 ? ' - pick a target (Esc, right-click or clicking the selection again cancels)' : ''}
            </span>
          )}
          {message && <span className={styles.error}>{message}</span>}
        </div>

        <section className={styles.side}>
          <div className={[styles.row, boardZone ? styles.zone : ''].join(' ')} onClick={(e) => playFromArea(e, 'board')}>
            {state.players[me].board.map((m) => renderMinion(me, m))}
          </div>
          {renderHero(me, true)}
          <div className={styles.row}>
            {state.players[me].hand.map((c, i) => renderHandCard(byId.get(c.cardId), i))}
          </div>
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
            <button type="button" onClick={() => setMenuOpen(true)}>
              Menu
            </button>
          </div>
        </section>
      </div>

      <aside className={styles.deckView}>
        <h2>
          Deck <small>{state.players[me].deck.length} left</small>
        </h2>
        <div className={styles.deckRows}>
          {deckRows(startDecks[me], state.players[me].deck.map((c) => c.cardId), byId).map((r) => (
            <div key={r.id} className={[styles.deckRow, r.left === 0 ? styles.deckGone : ''].join(' ')} title={byId.get(r.id)?.text}>
              <span className={styles.deckCost}>{r.cost}</span>
              <span className={styles.deckName}>{r.name}</span>
              <span className={styles.deckCount}>{r.total > 1 ? `${r.left}/${r.total}` : r.left}</span>
            </div>
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
