import { HIDDEN_CARD, redactFor } from '../redact';
import { makeMatch } from '../test-helpers';

describe('redactFor', () => {
  const { state } = makeMatch();

  it('keeps the viewer own hand and deck', () => {
    const view = redactFor(state, '0');

    expect(view.players['0'].hand).toEqual(state.players['0'].hand);
    expect(view.players['0'].deck).toEqual(state.players['0'].deck);
  });

  it('hides which cards are in the opponent hand and deck, not how many', () => {
    const view = redactFor(state, '0');
    const foe = view.players['1'];

    expect(foe.hand).toHaveLength(state.players['1'].hand.length);
    expect(foe.deck).toHaveLength(state.players['1'].deck.length);
    expect(
      [...foe.hand, ...foe.deck].every((card) => card.cardId === HIDDEN_CARD),
    ).toBe(true);
  });

  it('does not leak a card id anywhere in the opponent hidden zones', () => {
    const json = JSON.stringify(redactFor(state, '0').players['1']);
    const ownIds = state.players['1'].hand.map((card) => card.cardId);

    ownIds.forEach((id) => expect(json).not.toContain(`"${id}"`));
  });

  it('never mutates the real state', () => {
    const before = JSON.stringify(state);
    redactFor(state, '1');

    expect(JSON.stringify(state)).toBe(before);
  });
});
