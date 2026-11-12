import type { Draft } from 'immer';
import type { CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import type { GameState, PlayerId } from '../state/types';
import { minionDef } from './minion';

/**
 * Recomputes every aura. Each minion remembers how much Attack its auras currently give it
 * (`auraAttack`, already included in `attack`) and whether its Rush is on loan (`auraRush`); this
 * works out what they should be now and applies only the difference. So an aura vanishes cleanly
 * when its minion dies or moves out of reach, without touching buffs. Call inside `produce`.
 */
export const recomputeAuras = (g: Draft<GameState>, catalog: CardCatalog, defs: DefLookup = getCardDef): void => {
  const players: PlayerId[] = ['0', '1'];
  const sources = players.flatMap((owner) =>
    g.players[owner].board.flatMap((source, index) => {
      const auras = minionDef(source, catalog, defs)?.auras;
      return auras ? [{ owner, source, index, auras }] : [];
    })
  );

  for (const owner of players) {
    g.players[owner].board.forEach((target, targetIndex) => {
      let attack = 0;
      let rush = false;
      for (const s of sources) {
        if (s.source === target) continue;
        const sameSide = s.owner === owner;
        const distance = sameSide ? Math.abs(s.index - targetIndex) : Infinity;
        const targetRace = catalog.get(target.cardId)?.race;
        for (const aura of s.auras) {
          if (!aura.affects({ source: s.source, target, sameSide, distance, targetRace })) continue;
          attack += aura.attack ?? 0;
          rush = rush || !!aura.rush;
        }
      }
      target.attack += attack - target.auraAttack;
      target.auraAttack = attack;
      if (rush && !target.keywords.rush) {
        target.keywords.rush = true;
        target.auraRush = true;
      } else if (!rush && target.auraRush) {
        target.keywords.rush = false;
        target.auraRush = false;
      }
    });
  }
};
