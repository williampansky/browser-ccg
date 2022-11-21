import { v4 as uuid } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Card, CardId, Deck, Decks } from '../../types';
import { gameConfig } from '../../app.config';
import { getDeckbuilderDeckLength } from '../../utils';

const { numerics: { cardsPerDeck } } = gameConfig;

declare type DeckSlot = number;
interface AddCard {
  card: Card;
  deckSlot: number;
}
interface RemoveCard {
  cardId: CardId;
  deckSlot: number;
}
interface SetDeckName {
  name: string;
  deckSlot: number;
}

const blankDeckItem = (idx: number): Deck => {
  return {
    name: '',
    cards: [],
    deckSlot: idx
  }
}

const blankDecksObj: Decks = {
  1: blankDeckItem(1),
  2: blankDeckItem(2),
  3: blankDeckItem(3),
  4: blankDeckItem(4),
  5: blankDeckItem(5),
  6: blankDeckItem(6),
  7: blankDeckItem(7),
  8: blankDeckItem(8),
  9: blankDeckItem(9),
  10: blankDeckItem(10)
};

function sortArray(arr: Card[]) {
  return arr.sort((a: Card, b: Card) => {
    if (a.baseCost > b.baseCost) return 1;
    if (a.baseCost < b.baseCost) return -1;
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 1;
  });
}

const getInitialState = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('decks')) {
    return JSON.parse(localStorage.getItem('decks')!);
  }

  return blankDecksObj;
}

export const decksSlice = createSlice({
  name: 'decks',
  initialState: getInitialState(),
  reducers: {
    // prettier-ignore
    addCard(state, { payload }: PayloadAction<AddCard>) {
      const { card, deckSlot } = payload;
      const { id, key } = card;

      if (getDeckbuilderDeckLength(state[deckSlot].cards) === cardsPerDeck) {
        return; // decks limited to numerics.cardsPerDeck
      } else if (state[deckSlot].cards.find((c: Card) => c.key === key && c.elite === true)) {
        return; // can only add single entry of elite cards
      } else if (state[deckSlot].cards.find((c: Card) => c.id === id)) {
        if (state[deckSlot].cards.filter((c: Card) => c.id === id).length === 2) {
          return; // decks have non-elite limit of two
        } else {
          const cardObj = state[deckSlot].cards.find((c: Card) => c.id === id);
          const newCardObj = { ...cardObj, amount: 2 };
          const newArray = state[deckSlot].cards.filter((c: Card) => c.id !== id);
          state[deckSlot].cards = sortArray([...newArray, newCardObj]);
        }
      } else {
        state[deckSlot].cards = sortArray([
          ...state[deckSlot].cards,
          { ...card, amount: 1 }
        ]);
      }
    },
    deleteDeck(state, { payload }: PayloadAction<DeckSlot>) {
      const deckSlot = payload;
      state[deckSlot] = blankDeckItem(deckSlot);
    },
    editDeck(state, { payload }: PayloadAction<DeckSlot>) {
      // console.log('editDeckName');
    },
    newDeck(state, { payload }: PayloadAction<DeckSlot>) {
      const deckSlot = payload;
      state[deckSlot] = {
        ...blankDeckItem(deckSlot),
        name: `Deck Slot ${deckSlot}`,
        uuid: uuid()
      };
    },
    removeCard(state, { payload }: PayloadAction<RemoveCard>) {
      const { deckSlot, cardId } = payload;
      if (state[deckSlot].cards.find((c: Card) => c.id === cardId && c.amount === 1)) {
        const newArray = state[deckSlot].cards.filter((c: Card) => c.id !== cardId);
        state[deckSlot].cards = sortArray([...newArray]);
      } else {
        const cardObj = state[deckSlot].cards.find((c: Card) => c.id === cardId);
        const newCardObj = { ...cardObj, amount: 1 };
        const newArray = state[deckSlot].cards.filter((c: Card) => c.id !== cardId);
        state[deckSlot].cards = sortArray([...newArray, newCardObj]);
      }
    },
    setDeckName(state, { payload }: PayloadAction<SetDeckName>) {
      const { deckSlot, name } = payload;
      state[deckSlot].name = name;
    },
  },
});

// prettier-ignore
export const {
  addCard,
  editDeck,
  newDeck,
  removeCard,
  deleteDeck,
  setDeckName,
} = decksSlice.actions;
export default decksSlice.reducer;
