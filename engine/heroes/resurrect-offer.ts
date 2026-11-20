import type { CardCatalog } from '../cards/types';
import { createSeededRng } from '../rng';
import type { SkillOption } from '../effects/types';
import type { GameState, PlayerId } from '../state/types';

/** How many of a player's most recent deaths the Cleric's Resurrect looks at. */
export const RECENT_DEAD = 5;
/** Chance (out of 100) that one of the two offered minions is the strongest of the enemy's recent dead instead. */
export const ENEMY_OFFER_PERCENT = 15;

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
/** A small stable hash of a string, used to seed the offer. */
const hash = (text: string): number => {
  let h = FNV_OFFSET;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), FNV_PRIME) >>> 0;
  return h;
};

const stats = (catalog: CardCatalog, id: string): number => {
  const c = catalog.get(id);
  return (c?.attack ?? 0) + (c?.health ?? 0);
};

/**
 * What the Cleric's Resurrect offers right now: two minions picked at random from this player's last `RECENT_DEAD` deaths
 * (different cards where it can), with a small chance one of them is the strongest of the enemy's last `RECENT_DEAD`
 * deaths instead. Each minion comes back with Guard or with Bubble, so every minion is two options (Guard first).
 *
 * The "random" pick is a function of the turn number and both graveyards, so asking twice in a turn gives the same offer
 * (the legal actions and the skill itself must agree, and a bot can try it on a copy of the game), and it changes whenever
 * something dies or the turn passes. Nothing is stored in the game state.
 */
export const resurrectOptions = (state: GameState, player: PlayerId, catalog: CardCatalog): SkillOption[] => {
  const foe: PlayerId = player === '0' ? '1' : '0';
  const mine = (state.players[player].graveyard ?? []).slice(-RECENT_DEAD);
  const theirs = (state.players[foe].graveyard ?? []).slice(-RECENT_DEAD);
  if (mine.length === 0) return [];
  const rng = createSeededRng(hash(`${state.turn}|${player}|${mine.join(',')}|${theirs.join(',')}`));

  // Two picks from my recent dead: different cards first, then repeats if there are not two different ones.
  const pool = [...mine];
  const picks: { cardId: string; from: PlayerId }[] = [];
  while (picks.length < 2 && pool.length > 0) {
    const fresh = pool.filter((id) => !picks.some((p) => p.cardId === id));
    const from = fresh.length > 0 ? fresh : pool;
    const id = from[rng.int(from.length)];
    pool.splice(pool.indexOf(id), 1);
    picks.push({ cardId: id, from: player });
  }

  // The rare enemy minion: only if it is stronger than the weakest pick, and then it takes that pick's place (or the free second slot).
  const roll = rng.int(100);
  if (roll < ENEMY_OFFER_PERCENT && theirs.length > 0) {
    const best = theirs.reduce((a, b) => (stats(catalog, b) > stats(catalog, a) ? b : a));
    const weakest = picks.reduce((a, b) => (stats(catalog, b.cardId) < stats(catalog, a.cardId) ? b : a));
    if (picks.length < 2) picks.push({ cardId: best, from: foe });
    else if (stats(catalog, best) > stats(catalog, weakest.cardId)) picks[picks.indexOf(weakest)] = { cardId: best, from: foe };
  }

  return picks.flatMap(({ cardId, from }) => {
    const name = catalog.get(cardId)?.name ?? cardId;
    return (['GUARD', 'BUBBLE'] as const).map((keyword) => ({
      label: `${name} with ${keyword === 'GUARD' ? 'Guard' : 'Bubble'}`,
      cardId,
      from,
      keyword,
    }));
  });
};
