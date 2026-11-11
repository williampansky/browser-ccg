import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Action,
  applyAction,
  buildDeck,
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
import styles from './play-board.module.scss';

type Selection = { kind: 'hand'; index: number } | { kind: 'minion'; id: number } | { kind: 'hero' };

const { cards, byId } = loadHsCards();
const pool = playablePool(cards);
const otherPlayer = (p: PlayerId): PlayerId => (p === '0' ? '1' : '0');
const label = (p: PlayerId) => `Player ${Number(p) + 1}`;
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
  const rngRef = useRef<Rng | null>(null);

  const start = useCallback(() => {
    const g = newGame();
    rngRef.current = g.rng;
    setState(g.state);
    setLog([['New game. Player 1 goes first; Player 2 starts with an extra card (The Orb).']]);
    setSelection(null);
    setMessage('');
  }, []);

  // Start on the client only: the deck shuffle uses the clock, which would not match server rendering.
  useEffect(start, [start]);

  const actions = useMemo(() => (state ? legalActions(state, state.activePlayer, byId) : []), [state]);

  if (!state || !rngRef.current) return <main className={styles.page}>Loading...</main>;

  const me = state.activePlayer;
  const foe = otherPlayer(me);
  const over = state.status === 'over';

  const dispatch = (action: Action) => {
    const result = applyAction(state, action, { rng: rngRef.current as Rng, catalog: byId });
    if ('error' in result) {
      setMessage(`Not allowed: ${result.error}`);
      return;
    }
    setMessage('');
    setSelection(null);
    setState(result.state);
    setLog((old) => [...old, describeEvents(result.events, byId, state, result.state)].slice(-100));
  };

  // What the current selection can aim at.
  const optionsFor = (sel: Selection | null): Action[] => {
    if (!sel) return [];
    if (sel.kind === 'hand') return actions.filter((a) => a.type === 'PlayCard' && a.handIndex === sel.index);
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
          {owner === me ? ' (your turn)' : ''}
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

  return (
    <main className={styles.page}>
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
              Turn {state.turn}: {label(me)}
              {aimable.length > 0 ? ' - pick a target (click the selection again to cancel)' : ''}
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
            <button type="button" disabled={over} className={styles.primary} onClick={() => dispatch({ type: 'EndTurn' })}>
              End turn
            </button>
            <button type="button" disabled={over} onClick={() => dispatch({ type: 'Concede' })}>
              Concede
            </button>
            <button type="button" onClick={start}>
              New game
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
