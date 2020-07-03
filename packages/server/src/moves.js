import attackMinionWithMinion from './moves/attack-minion-with-minion';
import attackPlayerWithMinion from './moves/attack-player-with-minion';
import boards from './state/boards';
import deselectCard from './moves/deselect-card';
import deselectMinion from './moves/deselect-minion';
import playMinionCard from './moves/play-minion-card';
import selectCard from './moves/select-card';
import selectedCardContext from './moves/select-card-context';
import selectMinion from './moves/select-minion';
import playGlobalSpellCard from './moves/play-global-spell-card';

export default {
  attackMinionWithMinion: {
    client: false,
    move: (G, ctx, index) => {
      return attackMinionWithMinion(G, ctx, index);
    }
  },
  attackPlayerWithMinion: {
    client: false,
    move: (G, ctx, index) => {
      return attackPlayerWithMinion(G, ctx, index);
    }
  },
  deselectCard: {
    client: false,
    move: (G, ctx) => {
      return deselectCard(G, ctx);
    }
  },
  deselectMinion: {
    client: false,
    move: (G, ctx) => {
      return deselectMinion(G, ctx);
    }
  },
  killMinion: {
    client: false,
    move: (G, ctx, player, slotObject, index) => {
      return boards.killMinion(G, ctx, player, slotObject, index);
    }
  },
  playGlobalSpellCard: {
    client: false,
    move: (G, ctx, uuid, cardId, cardCost) => {
      return playGlobalSpellCard(G, ctx, uuid, cardId, cardCost);
    }
  },
  playMinionCard: {
    client: false,
    move: (G, ctx, index) => {
      return playMinionCard(G, ctx, index);
    }
  },
  selectCard: {
    client: false,
    move: (G, ctx, cardObject, index) => {
      deselectCard(G, ctx);
      return selectCard(G, ctx, cardObject, index);
    }
  },
  selectCardContext: {
    client: false,
    move: (G, ctx, string) => {
      return selectedCardContext(G, ctx, string);
    }
  },
  selectMinion: {
    client: false,
    move: (G, ctx, slotObject, index) => {
      return selectMinion(G, ctx, slotObject, index);
    }
  }
};
