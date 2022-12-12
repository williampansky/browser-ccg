import type { StageMap } from 'boardgame.io';
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
      deselectCard,
      attackMinion,
    },
  },
  buffMinion: {
    moves: {
      deselectCard,
      buffMinion,
    },
  },
  debuffMinion: {
    moves: {
      deselectCard,
      debuffMinion,
    },
  },
  destroyMinion: {
    moves: {
      deselectCard,
      destroyMinion,
    },
  },
  healMinion: {
    moves: {
      deselectCard,
      healMinion,
    },
  },
};
