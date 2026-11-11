import type { CardCatalog, GameEvent, GameState, TargetRef } from '../../engine';

/** Finds a card name for an instance id, looking in every state given (an instance may have died). */
export const nameOfInstance = (id: number, catalog: CardCatalog, ...states: GameState[]): string => {
  for (const s of states) {
    for (const p of ['0', '1'] as const) {
      const pl = s.players[p];
      const found = [...pl.board, ...pl.hand, ...pl.deck].find((x) => x.instanceId === id);
      if (found) return catalog.get(found.cardId)?.name ?? found.cardId;
    }
  }
  return `minion #${id}`;
};

/** Log markup: `**Player 1**` is a player (coloured by side), `__Card__` is a card name (bold italic). */
const who = (p: '0' | '1') => `**Player ${Number(p) + 1}**`;
const card = (name: string) => `__${name}__`;

/** Turns the events of one action into short log lines. Events with no player-facing meaning are skipped. */
export const describeEvents = (
  events: GameEvent[],
  catalog: CardCatalog,
  before: GameState,
  after: GameState
): string[] => {
  const name = (id: number) => card(nameOfInstance(id, catalog, before, after));
  const cardName = (id: string) => card(catalog.get(id)?.name ?? id);
  const target = (t: TargetRef) => (t.kind === 'hero' ? `${who(t.player)}'s hero` : name(t.instanceId));
  const lines: string[] = [];
  for (const e of events) {
    switch (e.type) {
      case 'TurnStarted':
        lines.push(`--- Turn ${e.turn}: ${who(e.player)} ---`);
        break;
      case 'MinionPlayed':
        lines.push(`${who(e.player)} plays ${name(e.instanceId)}`);
        break;
      case 'CardPlayed':
        lines.push(`${who(e.player)} casts ${cardName(e.cardId)}`);
        break;
      case 'WeaponEquipped':
        lines.push(`${who(e.player)} equips ${cardName(e.cardId)}`);
        break;
      case 'MinionSummoned':
        if (!events.some((x) => x.type === 'MinionPlayed' && x.instanceId === e.instanceId)) {
          lines.push(`${cardName(e.cardId)} is summoned for ${who(e.player)}`);
        }
        break;
      case 'MinionAttacked':
        lines.push(`${name(e.attackerId)} attacks ${target(e.target)}`);
        break;
      case 'WeaponAttacked':
        lines.push(`Hero attacks ${target(e.target)} with its weapon`);
        break;
      case 'MinionDamaged':
        lines.push(`  ${name(e.instanceId)} takes ${e.amount}`);
        break;
      case 'HeroDamaged':
        lines.push(`  ${who(e.player)}'s hero takes ${e.amount}`);
        break;
      case 'Healed':
        lines.push(`  ${target(e.target)} heals ${e.amount}`);
        break;
      case 'BubblePopped':
        lines.push(`  ${name(e.instanceId)}'s Bubble pops`);
        break;
      case 'Fatigue':
        lines.push(`${who(e.player)} has no cards left: fatigue ${e.damage}`);
        break;
      case 'Burned':
        lines.push(`${who(e.player)}'s hand is full: a card is burned`);
        break;
      case 'Discarded':
        lines.push(`${who(e.player)} discards a card`);
        break;
      case 'ArmorGained':
        lines.push(`  ${who(e.player)} gains ${e.amount} armor`);
        break;
      case 'WeaponBroke':
        lines.push(`${who(e.player)}'s weapon breaks`);
        break;
      case 'MinionDied':
        lines.push(`  ${cardName(e.cardId)} dies`);
        break;
      case 'GameOver':
        lines.push(e.winner === 'draw' ? 'Draw!' : `${who(e.winner)} wins!`);
        break;
      default:
        break;
    }
  }
  return lines;
};
