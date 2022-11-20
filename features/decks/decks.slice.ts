import { v4 as uuid } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Card, Deck, Decks } from '../../types';
import { gameConfig } from '../../app.config';

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

function sortArray(arr: any) {
  return arr.sort((a: any, b: any) => {
    if (a.cost > b.cost) return 1;
    if (a.cost < b.cost) return -1;
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
    addCard(state, { payload }) {
      const { card, deckSlot } = payload;
      const { key } = card;

      if (state[deckSlot].cards.length === gameConfig.numerics.cardsPerDeck) {
        return; // decks limited to numerics.cardsPerDeck
      } else if (state[deckSlot].cards.find((c: Card) => c.key === key && c.elite === true)) {
        return; // can only add single entry of elite cards
      } else if (state[deckSlot].cards.filter((c: Card) => c.key === key).length === 2) {
        return; // decks have non-elite limit of two
      } else {
        const cardObj = {
          ...card,
          uuid: uuid()
        };

        state[deckSlot].cards = sortArray([
          ...state[deckSlot].cards,
          { ...cardObj }
        ]);
      }
    },
    deleteDeck(state, { payload }) {
      const deckSlot = payload;
      state[deckSlot] = blankDeckItem(deckSlot);
    },
    editDeck(state, { payload }) {
      const { deckSlot } = payload;
      // console.log('editDeckName');
    },
    newDeck(state, { payload }) {
      const deckSlot = payload;
      state[deckSlot] = {
        ...blankDeckItem(deckSlot),
        name: `Deck Slot ${deckSlot}`,
        uuid: uuid()
      }
      // state[deckSlot] = {
      //   name: `Deck Slot ${deckSlot}`,
      //   cards: [],
      //   deckSlot,
      //   uuid: uuid()
      // };
    },
    removeCard(state, { payload }) {
      const { deckSlot, cardId, cardUuid } = payload;
      const newArray = state[deckSlot].cards.filter((c: Card) => c.uuid !== cardUuid);
      state[deckSlot].cards = sortArray([...newArray]);
      // if (state[deckSlot].cards.filter((c: Card) => c.id === cardId).length === 2) {
      //   const newArray = state[deckSlot].cards.filter((c: Card) => c.uuid !== cardUuid);
      //   state[deckSlot].cards = sortArray([...newArray]);
      // } else {
      //   const newArray = state[deckSlot].cards.filter((c: Card) => c.id !== cardId);
      //   state[deckSlot].cards = sortArray([...newArray]);
      // }
    },
    setDeckName(state, { payload }) {
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
