import { produce } from 'immer';
import type { CardCatalog, GameEvent, GameState, PlayerId } from '../engine';
import { getCardDef } from '../engine';

/** The card id every card the viewer may not see is given. */
export const HIDDEN_CARD = '';

/**
 * The state as `seat` may see it: the opponent's hand and deck keep their
 * size and instance ids but lose which card is which, and a face-down Mystery
 * loses its card. Everything on the board stays, it is public. Never mutates.
 */
export const redactFor = (state: GameState, seat: PlayerId): GameState => {
  const foe: PlayerId = seat === '0' ? '1' : '0';

  return produce(state, (draft) => {
    const foePlayer = draft.players[foe];
    foePlayer.hand.forEach((card) => {
      card.cardId = HIDDEN_CARD;
      delete card.costDelta;
      delete card.rushOnPlay;
    });
    foePlayer.deck.forEach((card) => {
      card.cardId = HIDDEN_CARD;
      delete card.costDelta;
      delete card.rushOnPlay;
    });
    if (foePlayer.mystery) foePlayer.mystery.cardId = HIDDEN_CARD;
    // Not public: what is coming back next turn (a card id list).
    if (foePlayer.returning)
      foePlayer.returning = foePlayer.returning.map(() => HIDDEN_CARD);
  });
};

/** The category label of `seat`'s opponent's Mystery, if it has one. */
export const foeMysteryCategory = (
  state: GameState,
  seat: PlayerId,
  catalog: CardCatalog,
): string | undefined => {
  const foe: PlayerId = seat === '0' ? '1' : '0';
  const mystery = state.players[foe].mystery;
  const card = mystery && catalog.get(mystery.cardId);

  return (card && getCardDef(card)?.mystery?.category) || undefined;
};

/**
 * The events as `seat` may see them. A Mystery played face down names its card
 * in the event; only its owner may know it until it fires.
 */
export const redactEvents = (
  events: GameEvent[],
  seat: PlayerId,
): GameEvent[] =>
  events.map((event) => {
    const isFoeMystery =
      event.type === 'CardPlayed' && event.mystery && event.player !== seat;

    return isFoeMystery ? { ...event, cardId: HIDDEN_CARD } : event;
  });
