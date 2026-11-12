import { soundsFor } from '../sounds';
import type { GameEvent } from '../../../engine';

const hit: GameEvent = { type: 'MinionDamaged', player: '0', instanceId: 1, amount: 2 };

describe('soundsFor', () => {
  it('maps events to sounds in order', () => {
    const events: GameEvent[] = [
      { type: 'MinionPlayed', player: '0', instanceId: 1, boardIndex: 0 },
      { type: 'MinionAttacked', attackerId: 1, target: { kind: 'hero', player: '1' } },
      { type: 'HeroDamaged', player: '1', amount: 3 },
    ];
    expect(soundsFor(events)).toEqual(['minion', 'attack', 'hit']);
  });
  it('plays each sound once per action, however many events cause it', () => {
    expect(soundsFor([hit, hit, hit, { type: 'HeroDamaged', player: '1', amount: 1 }])).toEqual(['hit']);
  });
  it('ignores events with no sound (draws, energy)', () => {
    expect(soundsFor([{ type: 'Drew', player: '0', instanceId: 4 }, { type: 'EnergyGained', player: '0', amount: 1 }])).toEqual([]);
  });
  it('a spell, a death and the game ending each get their own sound', () => {
    const events: GameEvent[] = [
      { type: 'CardPlayed', player: '0', instanceId: 2, cardId: 'X' },
      { type: 'MinionDied', player: '1', instanceId: 3, cardId: 'Y' },
      { type: 'GameOver', winner: '0' },
    ];
    expect(soundsFor(events)).toEqual(['spell', 'death', 'gameOver']);
  });
  it('marks a new turn', () => {
    expect(soundsFor([{ type: 'TurnStarted', player: '1', turn: 2 }])).toEqual(['turn']);
  });
});
