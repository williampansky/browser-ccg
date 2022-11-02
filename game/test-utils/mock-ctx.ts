import { EffectsCtxMixin } from 'bgio-effects/dist/types';
import { ActivePlayers, Ctx, PlayerID } from 'boardgame.io';
import { getRandomNumberBetween } from '../../utils';
import bgioEffectsConfig from '../config.bgio-effects';

export interface MockCtxOptions {
  activePlayers?: null | ActivePlayers;
  currentPlayer?: PlayerID;
  effects?: any;
  gameover?: any;
  numMoves?: number;
  numPlayers?: number;
  phase: string;
  playOrder?: Array<PlayerID>;
  playOrderPos?: number;
  turn?: number;
  random?: any;
}

const mockCtx = (opts?: MockCtxOptions) => {
  const random = (): number => {
    const rand = getRandomNumberBetween(0, 20);
    const number = rand;
    return number;
  };

  return {
    activePlayers: opts?.activePlayers || null,
    effects: opts?.effects || {
      effectsEnd: () => {},
      revealZone: () => {},
      revealCard: () => {},
    },
    currentPlayer: opts?.currentPlayer || '0',
    numPlayers: opts?.numPlayers || 1,
    numMoves: opts?.numMoves,
    phase: opts?.phase || '',
    playOrder: opts?.playOrder || ['0'],
    playOrderPos: opts?.playOrderPos || 0,
    turn: opts?.turn || 0,
    gameover: opts?.gameover,
    random: {
      Shuffle: (array: any) => {
        return array
          .map((a: any) => ({ sort: Math.random(), value: a }))
          .sort((a: any, b: any) => a.sort - b.sort)
          .map((a: any) => a.value);
      },
      D4: () => getRandomNumberBetween(1, 4),
      D6: () => getRandomNumberBetween(1, 6),
      D10: () => getRandomNumberBetween(1, 10),
      D12: () => getRandomNumberBetween(1, 12),
      D20: () => getRandomNumberBetween(1, 20),
      Die: () => random(),
      Number: () => random(),
    },
  } as Ctx & EffectsCtxMixin<typeof bgioEffectsConfig>;
};

export default mockCtx;
