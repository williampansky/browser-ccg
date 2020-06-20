import deselectCard from './moves/deselect-card';
import deselectMinion from './moves/deselect-minion';
import playMinionCard from './moves/play-minion-card';
import selectCard from './moves/select-card';
import selectedCardContext from './moves/select-card-context';
import selectMinion from './moves/select-minion';
import attackMinionWithMinion from './moves/attack-minion-with-minion';

export default {
  attackMinionWithMinion: {
    client: false,
    move: (G, ctx, index) => {
      return attackMinionWithMinion(G, ctx, index);
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
