import { MAX_SOUNDS_PER_ACTION, soundsFor } from '../sounds';
import type { GameEvent } from '../../../engine';

const hit: GameEvent = { type: 'MinionDamaged', player: '0', instanceId: 1, amount: 2 };

describe('soundsFor', () => {
  it('maps events to sounds in order', () => {
    const events: GameEvent[] = [
      { type: 'MinionPlayed', player: '0', instanceId: 1, boardIndex: 0 },
      { type: 'CardPlayed', player: '0', instanceId: 2, cardId: 'X' },
      { type: 'HeroDamaged', player: '1', amount: 3 },
    ];
    expect(soundsFor(events)).toEqual(['cardPlay', 'minion', 'spell', 'hit']);
  });
  it('an attack and gained Armor make no sound of their own (the hit that follows is the sound)', () => {
    expect(soundsFor([{ type: 'MinionAttacked', attackerId: 1, target: { kind: 'hero', player: '1' } }, { type: 'ArmorGained', player: '0', amount: 2 }])).toEqual([]);
  });
  it('never more than a few sounds for one action, and the end of the game keeps its place', () => {
    const many: GameEvent[] = [
      { type: 'MinionPlayed', player: '0', instanceId: 1, boardIndex: 0 },
      { type: 'CardPlayed', player: '0', instanceId: 2, cardId: 'X' },
      { type: 'WeaponEquipped', player: '0', cardId: 'W' },
      { type: 'Healed', target: { kind: 'hero', player: '0' }, amount: 1 },
      hit,
      { type: 'MinionDied', player: '1', instanceId: 3, cardId: 'Y' },
    ];
    expect(soundsFor(many)).toHaveLength(MAX_SOUNDS_PER_ACTION + 1); // the card-play sound is on top of the cap
    expect(soundsFor(many)).toEqual(['cardPlay', 'minion', 'spell', 'weapon']);
    expect(soundsFor([...many, { type: 'GameOver', winner: '0' }])).toEqual(['cardPlay', 'minion', 'spell', 'gameOver']);
  });
  it('plays each sound once per action, however many events cause it', () => {
    expect(soundsFor([hit, hit, hit, { type: 'HeroDamaged', player: '1', amount: 1 }])).toEqual(['hit']);
  });
  it('ignores events with no sound (energy)', () => {
    expect(soundsFor([{ type: 'EnergyGained', player: '0', amount: 1 }])).toEqual([]);
  });
  it('drawing a card has a sound, once however many cards are drawn', () => {
    const drew: GameEvent = { type: 'Drew', player: '0', instanceId: 4 };
    expect(soundsFor([drew, { ...drew, instanceId: 5 }])).toEqual(['draw']);
  });
  it('playing a minion or a spell from the hand starts with the card-play sound; a summon does not', () => {
    expect(soundsFor([{ type: 'MinionPlayed', player: '0', instanceId: 1, boardIndex: 0 }])[0]).toBe('cardPlay');
    expect(soundsFor([{ type: 'CardPlayed', player: '0', instanceId: 2, cardId: 'X' }])[0]).toBe('cardPlay');
    expect(soundsFor([{ type: 'MinionSummoned', player: '0', instanceId: 1, cardId: 'X' }])).toEqual(['minion']);
  });
  it('a spell, a death and the game ending each get their own sound', () => {
    const events: GameEvent[] = [
      { type: 'CardPlayed', player: '0', instanceId: 2, cardId: 'X' },
      { type: 'MinionDied', player: '1', instanceId: 3, cardId: 'Y' },
      { type: 'GameOver', winner: '0' },
    ];
    expect(soundsFor(events)).toEqual(['cardPlay', 'spell', 'death', 'gameOver']);
  });
  it('marks a new turn', () => {
    expect(soundsFor([{ type: 'TurnStarted', player: '1', turn: 2 }])).toEqual(['turn']);
  });
});
