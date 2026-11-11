/** Test helpers: tiny hand-made cards and state tweaks. Not used by the engine itself. */
import { produce } from 'immer';
import type { Card, CardCatalog } from '../cards/types';
import { createMinion } from '../rules/minion';
import type { GameState, MinionInstance, PlayerId } from '../state/types';

interface MinionOpts {
  cost?: number;
  attack?: number;
  health?: number;
  mechanics?: string[];
}

const baseCard = (id: string, type: Card['type'], cost: number, mechanics: string[]): Card => ({
  id,
  source: 'core',
  name: id,
  type,
  cost,
  rarity: 'FREE',
  set: 'SET_TEST',
  mechanics,
  numbers: {},
  textTemplate: '',
  text: '',
  entourage: [],
  isToken: false,
  elite: false,
  active: true,
  collectible: true,
});

export const minionCard = (id: string, o: MinionOpts = {}): Card => ({
  ...baseCard(id, 'minion', o.cost ?? 1, o.mechanics ?? []),
  attack: o.attack ?? 1,
  health: o.health ?? 1,
});

export const spellCard = (id: string, cost = 1): Card => baseCard(id, 'spell', cost, []);

export const catalogOf = (...cards: Card[]): CardCatalog => new Map(cards.map((c) => [c.id, c]));

/** Appends a card to a player's hand. */
export const putInHand = (state: GameState, player: PlayerId, cardId: string): GameState =>
  produce(state, (g) => {
    g.players[player].hand.push({ instanceId: g.nextInstanceId++, cardId });
  });

/** Puts a ready-to-attack minion (played on turn 0) on a player's board; tweak it with `patch`. */
export const putOnBoard = (
  state: GameState,
  player: PlayerId,
  card: Card,
  patch: Partial<MinionInstance> = {}
): GameState =>
  produce(state, (g) => {
    const m = createMinion(card, g.nextInstanceId++, 0);
    g.players[player].board.push({ ...m, ...patch });
  });

export const setEnergy = (state: GameState, player: PlayerId, current: number, total = current): GameState =>
  produce(state, (g) => {
    g.players[player].energy = { current, total };
  });
