import type { StageMap } from 'boardgame.io';
import { aiSetDone } from '../../ai';
import {
  attackMinion,
  buffMinion,
  debuffMinion,
  deselectCard,
  destroyMinion,
  healMinion,
} from '../../moves';

export default <StageMap>{
  attackMinion: {
    moves: {
      aiSetDone,
      deselectCard,
      attackMinion,
    },
  },
  buffMinion: {
    moves: {
      aiSetDone,
      deselectCard,
      buffMinion,
    },
  },
  debuffMinion: {
    moves: {
      aiSetDone,
      deselectCard,
      debuffMinion,
    },
  },
  destroyMinion: {
    moves: {
      aiSetDone,
      deselectCard,
      destroyMinion,
    },
  },
  healMinion: {
    moves: {
      aiSetDone,
      deselectCard,
      healMinion,
    },
  },
};
