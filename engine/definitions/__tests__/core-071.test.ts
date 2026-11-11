import { legalActions } from '../../rules/legal-actions';
import { catalog, hero, mref, run, setup, withWeapon } from '../../testing/real-cards';
import type { GameState } from '../../state/types';

// CORE_071: "Disable anyone attacked by this minion"
const ok = (r: ReturnType<typeof run>): GameState => {
  if ('error' in r) throw new Error(r.error);
  return r.state;
};
const nextTurn = (s: GameState) => ok(run(s, { type: 'EndTurn' }));
const attackers = (s: GameState) => legalActions(s, s.activePlayer, catalog).filter((a) => a.type === 'Attack');

describe('CORE_071', () => {
  it('a minion it attacks cannot attack on its owner\'s next turn, but can the turn after', () => {
    let s = setup('CORE_016', { mine: [[1, 9, 'CORE_071']], theirs: [[1, 9]] });
    s = ok(run(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: mref(s, '1', 0) }));
    s = nextTurn(s); // player 1's turn: the victim is disabled
    expect(s.activePlayer).toBe('1');
    expect(attackers(s)).toHaveLength(0);
    s = nextTurn(nextTurn(s)); // player 1 again
    expect(s.activePlayer).toBe('1');
    expect(attackers(s).length).toBeGreaterThan(0);
  });
  it('a hero it attacks cannot attack with its weapon on its next turn, but can the turn after', () => {
    let s = withWeapon(setup('CORE_016', { mine: [[1, 9, 'CORE_071']] }), '1');
    s = ok(run(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: hero('1') }));
    s = nextTurn(s);
    expect(legalActions(s, '1', catalog).some((a) => a.type === 'WeaponAttack')).toBe(false);
    expect(run(s, { type: 'WeaponAttack', target: hero('0') })).toHaveProperty('error');
    s = nextTurn(nextTurn(s));
    expect(legalActions(s, '1', catalog).some((a) => a.type === 'WeaponAttack')).toBe(true);
  });
});
