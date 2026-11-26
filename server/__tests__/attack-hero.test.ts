import { produce } from 'immer';
import type { PlayerId } from '../../engine';
import { createSeededRng } from '../../engine';
import { nukeHero } from '../../components/play-board/nuke-hero';
import { catalog, makeMatch } from '../test-helpers';

/**
 * "Attack hero" works its swings out on the player's screen and, online, sends
 * them to the server as ordinary actions. The server must accept the same
 * sequence and end up where the screen expected, with the turn passed.
 */
describe('Attack hero sent to the server as actions', () => {
  const coreMinion = Array.from(catalog.values()).find(
    (card) => card.type === 'minion' && card.source === 'core' && !card.isToken,
  );

  it('is accepted action by action and passes the turn', () => {
    if (!coreMinion) throw new Error('no minion card in the catalog');
    const match = makeMatch(11);
    const me: PlayerId = match.state.activePlayer;
    // Two minions that have been in play a turn, and an empty enemy board
    match.state = produce(match.state, (g) => {
      const turn = g.turn;
      [1, 2].forEach((n) => {
        g.players[me].board.push({
          instanceId: 9000 + n,
          cardId: coreMinion.id,
          attack: 2,
          health: 3,
          maxHealth: 3,
          playedOnTurn: turn - 2,
          attacksThisTurn: 0,
          keywords: {
            guard: false,
            rush: false,
            bubble: false,
            doubleAttack: false,
            hidden: false,
            noAttack: false,
          },
          playSeq: n,
          auraAttack: 0,
          auraRush: false,
          tempAttack: 0,
        });
      });
      g.players[me === '0' ? '1' : '0'].board = [];
    });
    const foe: PlayerId = me === '0' ? '1' : '0';
    const before = match.state.players[foe].health;
    const result = nukeHero(match.state, me, createSeededRng(5), catalog);

    expect(result.steps.length).toBeGreaterThan(0);
    result.steps.forEach((step) => {
      expect(match.submit(me, step.action, 1000)).not.toHaveProperty('error');
    });
    expect(match.state.players[foe].health).toBe(before - 4);
    expect(match.submit(me, { type: 'EndTurn' }, 1000)).not.toHaveProperty(
      'error',
    );
    expect(match.state.activePlayer).toBe(foe);
  });
});
