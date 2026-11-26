import {
  buildDeck,
  createGame,
  createSeededRng,
  loadHsCards,
  playablePool,
} from '../../../../engine';
import type { Action, GameEvent } from '../../../../engine';
import { flipSeats, forSeat } from '../seat-flip';

describe('flipSeats', () => {
  const { cards } = loadHsCards();
  const rng = createSeededRng(3);
  const pool = playablePool(cards);
  const state = createGame(
    {
      decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) },
      firstPlayer: '1',
      heroes: { '0': 'FIGHTER', '1': 'WIZARD' },
    },
    rng,
  );

  it('moves each seat to the other and back again', () => {
    const flipped = flipSeats(state);

    expect(flipped.players['0']).toEqual(state.players['1']);
    expect(flipped.players['1']).toEqual(state.players['0']);
    expect(flipped.activePlayer).toBe('0');
    expect(flipSeats(flipped)).toEqual(state);
  });

  it('flips the seat inside actions and events, and leaves draws alone', () => {
    const action: Action = {
      type: 'Attack',
      attackerId: 4,
      target: { kind: 'hero', player: '1' },
    };
    const event: GameEvent = { type: 'GameOver', winner: 'draw' };

    expect(flipSeats(action)).toEqual({
      ...action,
      target: { kind: 'hero', player: '0' },
    });
    expect(flipSeats(event)).toEqual(event);
    expect(flipSeats({ type: 'Concede', player: '0' })).toEqual({
      type: 'Concede',
      player: '1',
    });
  });

  it('is the identity for seat 0', () => {
    expect(forSeat(state, '0')).toBe(state);
  });
});
