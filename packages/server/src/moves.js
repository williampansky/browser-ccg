import attackMinionWithMinion from './moves/attack-minion-with-minion';
import attackMinionWithOnPlay from './moves/attack-minion-with-onplay';
import attackMinionWithSpell from './moves/attack-minion-with-spell';
import targetMinionWithSpell from './moves/target-minion-with-spell';
import attackPlayerWithMinion from './moves/attack-player-with-minion';
import boards from './state/boards';
import deselectCard from './moves/deselect-card';
import deselectMinion from './moves/deselect-minion';
import playMinionCard from './moves/play-minion-card';
import selectCard from './moves/select-card';
import selectedCardContext from './moves/select-card-context';
import selectMinion from './moves/select-minion';
import playGlobalSpellCard from './moves/play-global-spell-card';
import hoverCard from './moves/hover-card';
import hoverTarget from './moves/hover-target';
import { initTargetedCard } from './moves/index';

export default {
  attackMinionWithMinion: {
    client: false,
    move: (G, ctx, index) => {
      return attackMinionWithMinion(G, ctx, index);
    }
  },
  attackPlayerWithMinion: {
    client: false,
    move: (G, ctx) => {
      return attackPlayerWithMinion(G, ctx);
    }
  },
  attackMinionWithOnPlay: {
    client: false,
    move: (G, ctx, index) => {
      return attackMinionWithOnPlay(G, ctx, index);
    }
  },
  attackMinionWithSpell: {
    client: false,
    move: (G, ctx, index) => {
      return attackMinionWithSpell(G, ctx, index);
    }
  },
  targetMinionWithSpell: {
    client: false,
    move: (G, ctx, index) => {
      return targetMinionWithSpell(G, ctx, index);
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
  hoverCard: {
    client: false,
    redact: true,
    move: (G, ctx, index) => {
      deselectCard(G, ctx);
      return hoverCard(G, ctx, index);
    }
  },
  hoverTarget: {
    client: false,
    redact: true,
    move: (G, ctx, slotObject, index) => {
      return hoverTarget(G, ctx, slotObject, index);
    }
  },
  initTargetedCard: {
    client: false,
    redact: true,
    move: (G, ctx, card, index) => {
      return initTargetedCard(G, ctx, card, index);
    }
  },
  killMinion: {
    client: false,
    move: (G, ctx, player, slotObject, index) => {
      return boards.killMinion(G, ctx, player, slotObject, index);
    }
  },
  killMinionIfHealthIsZero: {
    client: false,
    move: (G, ctx, player, slotObject, index) => {
      return boards.killMinionIfHealthIsZero(G, ctx, player, slotObject, index);
    }
  },
  playGlobalSpellCard: {
    client: false,
    move: (G, ctx, cost, id, set, uuid) => {
      return playGlobalSpellCard(G, ctx, cost, id, set, uuid);
    }
  },
  playMinionCard: {
    client: false,
    move: (G, ctx, index) => {
      return playMinionCard(G, ctx, index);
    }
  },
  resetAttackedMinionIndex: {
    client: false,
    redact: true,
    move: G => {
      G.attackedMinionIndex = null;
    }
  },
  resetMinionIsAttacking: {
    client: false,
    redact: true,
    move: (G, ctx, index) => {
      G.boards[ctx.currentPlayer][index].isAttacking = false;
    }
  },
  resetMinionIsAttackingIndex: {
    client: false,
    redact: true,
    move: (G, ctx, index) => {
      G.boards[ctx.currentPlayer][index].isAttackingMinionIndex = null;
    }
  },
  resetMinionIsAttackingPlayer: {
    client: false,
    redact: true,
    move: (G, ctx, index) => {
      G.boards[ctx.currentPlayer][index].isAttackingPlayer = false;
    }
  },
  selectCard: {
    client: false,
    redact: true,
    move: (G, ctx, cardObject, index) => {
      deselectCard(G, ctx);
      return selectCard(G, ctx, cardObject, index);
    }
  },
  selectCardContext: {
    client: false,
    redact: true,
    move: (G, ctx, string) => {
      return selectedCardContext(G, ctx, string);
    }
  },
  selectMinion: {
    client: false,
    move: (G, ctx, slotObject, index) => {
      return selectMinion(G, ctx, slotObject, index);
    }
  },
  setSlotIsNew: {
    client: true,
    redact: true,
    move: (G, player, index, bool) => {
      if (!player || !index) return;
      else if (!G.boards[player]) return;
      else if (!G.boards[player][index]) return;
      else G.boards[player][index].slotIsNew = bool ? bool : false;
    }
  }
};
