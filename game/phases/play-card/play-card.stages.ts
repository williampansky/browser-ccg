import type { StageMap } from 'boardgame.io';
import {
  attackMinion,
  buffMinion,
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
