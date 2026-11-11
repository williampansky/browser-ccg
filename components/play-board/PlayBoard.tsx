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
import { describeEvents } from './describe-events';
import { targetLinePath, TargetLineStyle } from './target-line';
import styles from './play-board.module.scss';

type Mode = 'ai' | 'hotseat';
type PlayAction = Extract<Action, { type: 'PlayCard' }>;
const AI_PLAYER: PlayerId = '1';
const AI_DELAY_MS = 800;
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

const newGame = (): { state: GameState; rng: Rng } => {
  const rng = createSeededRng(Date.now() % 2147483647);
  const state = createGame(
    { decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) }, firstPlayer: '0', secondPlayerBonusCard: 'GAME_001' },
    rng
  );
  return { state, rng };
};

/** Hot-seat board: the active player is always at the bottom, the other player's hand is hidden. */
export const PlayBoard = () => {
  const [state, setState] = useState<GameState | null>(null);
  /** One entry per action, so lines stay in order within an action while the newest action is on top. */
  const [log, setLog] = useState<string[][]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<Mode>('ai');
  const rngRef = useRef<Rng | null>(null);
  // Targeting line: where the pointer is, which character it is over, and the DOM nodes to draw between.
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
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
    setLog([['New game. Player 1 goes first; Player 2 starts with an extra card (The Orb).']]);
    setSelection(null);
    setMessage('');
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
      setState(result.state);
      setLog((old) => [...old, describeEvents(result.events, byId, state, result.state)].slice(-100));
    },
    [state]
  );

  // The viewer is who sits at the bottom: always Player 1 against the AI, the active player in hot-seat.
  const viewer: PlayerId = !state ? '0' : mode === 'ai' ? '0' : state.activePlayer;
  const aiToMove = !!state && mode === 'ai' && state.status === 'playing' && state.activePlayer === AI_PLAYER;

  // The AI takes one action per tick, so you can follow what it does.
  useEffect(() => {
    if (!aiToMove || !state || !rngRef.current) return;
    const rng = rngRef.current;
    const timer = setTimeout(() => dispatch(chooseRandomAction(state, byId, rng)), AI_DELAY_MS);
    return () => clearTimeout(timer);
  }, [aiToMove, state, dispatch]);

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
  const targetOf = (a: Action): TargetRef | undefined =>
    a.type === 'PlayCard' || a.type === 'Attack' || a.type === 'WeaponAttack' ? a.target : undefined;
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

  const renderMinion = (owner: PlayerId, m: MinionInstance) => {
    const card = byId.get(m.cardId);
    const selected = selection?.kind === 'minion' && selection.id === m.instanceId;
    const aim = isAimable({ kind: 'minion', instanceId: m.instanceId });
    const sick = m.playedOnTurn === state.turn && !m.keywords.rush && owner === me;
    const tags = [
      m.keywords.guard && 'Guard',
      m.keywords.rush && 'Rush',
      m.keywords.bubble && 'Bubble',
      m.keywords.hidden && 'Hidden',
      m.keywords.doubleAttack && 'x2 attack',
      m.keywords.noAttack && 'No attack',
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
        ].join(' ')}
        onClick={() => clickMinion(owner, m)}
      >
        <span className={styles.name}>{card?.name ?? m.cardId}</span>
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
        </span>
        <span className={styles.text}>{card?.text}</span>
      </button>
    );
  };

  // The targeting line: from the selected card, minion or hero to the character under the pointer
  // (green when it is a legal target) or else to the pointer itself (grey).
  const sourceKey =
    selection?.kind === 'hand' ? `c${selection.index}` : selection?.kind === 'minion' ? `m${selection.id}` : selection ? `h${me}` : null;
  const sourceEl = sourceKey ? nodes.current.get(sourceKey) : undefined;
  const overTarget = hover && isAimable(hover) ? nodes.current.get(targetKey(hover)) : undefined;
  const lineFrom = sourceEl && aimable.length > 0 ? centerOf(sourceEl) : null;
  const lineTo = overTarget ? centerOf(overTarget) : pointer;

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
      <div className={styles.table}>
        <section className={styles.side}>
          {renderHero(foe, false)}
          <div className={styles.row}>{state.players[foe].board.map((m) => renderMinion(foe, m))}</div>
        </section>

        <div className={styles.middle}>
          {over ? (
            <strong className={styles.banner}>
              {state.winner === 'draw' ? 'Draw!' : `${label(state.winner as PlayerId)} wins!`}
            </strong>
          ) : (
            <span>
              Turn {state.turn}: {label(state.activePlayer)}
              {choiceOptions.length > 0 ? ' - choose one option' : ''}
              {aimable.length > 0 ? ' - pick a target (Esc, right-click or clicking the selection again cancels)' : ''}
            </span>
          )}
          {message && <span className={styles.error}>{message}</span>}
        </div>

        <section className={styles.side}>
          <div className={styles.row}>{state.players[me].board.map((m) => renderMinion(me, m))}</div>
          {renderHero(me, true)}
          <div className={styles.row}>
            {state.players[me].hand.map((c, i) => renderHandCard(byId.get(c.cardId), i))}
          </div>
          <div className={styles.controls}>
            {choiceOptions.map((c) => (
              <button key={`choice-${c}`} type="button" className={styles.primary} onClick={() => pickChoice(c)}>
                {choiceLabel(c)}
              </button>
            ))}
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
            <button
              type="button"
              disabled={over || !myTurn}
              className={styles.primary}
              onClick={() => dispatch({ type: 'EndTurn' })}
            >
              End turn
            </button>
            <button type="button" disabled={over || !myTurn} onClick={() => dispatch({ type: 'Concede' })}>
              Concede
            </button>
            <button type="button" onClick={start}>
              New game
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'ai' ? 'hotseat' : 'ai');
                setTimeout(start, 0);
              }}
            >
              Mode: {mode === 'ai' ? 'vs AI' : 'hot-seat'} (click to switch)
            </button>
          </div>
        </section>
      </div>

      <aside className={styles.log}>
        <h2>Log</h2>
        <div className={styles.logLines}>
          {[...log].reverse().map((lines, i) => (
            <div key={i} className={styles.logBatch}>
              {lines.map((l, j) => (
                <div key={j}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
};
