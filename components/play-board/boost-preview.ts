import type { CardCatalog } from '../../engine/cards/types';
import { createSeededRng } from '../../engine/rng';
import { applyAction } from '../../engine/rules/apply-action';
import type { GameState, MinionInstance, PlayerId } from '../../engine/state/types';

/** How long the pointer rests on a hand card before the preview shows (ms). */
export const BOOST_PREVIEW_DELAY_MS = 900;

const better = (b: MinionInstance, a: MinionInstance): boolean =>
  a.attack > b.attack ||
  a.maxHealth > b.maxHealth ||
  a.health > b.health ||
  (Object.keys(a.keywords) as (keyof typeof a.keywords)[]).some((k) => a.keywords[k] && !b.keywords[k]);

/**
 * Which of `player`'s minions already on the board would be made better if hand card `handIndex` were played now
 * (more Attack or Health, or a new keyword). It plays the card on a throwaway copy, so every aura, On Play effect and
 * "your Sprites get +1 Attack" rule is covered without per-card data. Cards that need a target are not previewed
 * (the legal-target highlight already covers them).
 */
export const boostedMinions = (state: GameState, player: PlayerId, handIndex: number, catalog: CardCatalog): number[] => {
  if (state.activePlayer !== player || state.status === 'over' || !state.players[player].hand[handIndex]) return [];
  const result = applyAction(state, { type: 'PlayCard', handIndex }, { rng: createSeededRng(1), catalog });
  if ('error' in result) return [];
  const after = result.state.players[player].board;
  return state.players[player].board
    .filter((m) => {
      const a = after.find((x) => x.instanceId === m.instanceId);
      return !!a && better(m, a);
    })
    .map((m) => m.instanceId);
};
