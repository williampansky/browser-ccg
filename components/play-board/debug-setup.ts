import { produce } from 'immer';
import { Card, CardCatalog, GameState, PlayerId } from '../../engine';
import { createMinion } from '../../engine/rules/minion';

export interface DebugSetup {
  boards: Record<PlayerId, string[]>;
  weapons: Record<PlayerId, string | undefined>;
  /** Energy to start with (current and total), 0-10; unset leaves the game's own value. */
  energy?: Record<PlayerId, number | undefined>;
}

/**
 * Debug setup: puts the listed minions on each board (left to right, ready to attack, no warcry or aura run) and
 * equips a weapon and sets energy. Ids that are not in the catalog, or not a minion / weapon, are skipped. Board size is capped at 7.
 */
export const applyDebugSetup = (state: GameState, setup: DebugSetup, catalog: CardCatalog): GameState =>
  produce(state, (g) => {
    (['0', '1'] as PlayerId[]).forEach((p) => {
      const side = g.players[p];
      for (const id of setup.boards[p]) {
        const card: Card | undefined = catalog.get(id);
        if (!card || card.type !== 'minion' || side.board.length >= 7) continue;
        side.board.push(createMinion(card, g.nextInstanceId++, 0, g.nextPlaySeq++));
      }
      const e = setup.energy?.[p];
      if (e !== undefined) side.energy = { current: e, total: e };
      const w = setup.weapons[p] ? catalog.get(setup.weapons[p]!) : undefined;
      if (w && w.type === 'weapon') {
        side.weapon = { instanceId: g.nextInstanceId++, cardId: w.id, attack: w.attack ?? 0, durability: w.health ?? 0 };
      }
    });
  });
