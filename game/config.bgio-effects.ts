import {
  DiscardCardEffects,
  RevealCardEffects,
  RevealZoneEffects,
} from '../types';

const bgioEffectsConfig = {
  effects: {
    fxEnd: {
      create: ({ ...value }: any) => value,
      duration: 0,
    },
    revealZone: {
      duration: 0.5,
      create: ({ ...value }: RevealZoneEffects) => {
        return {
          zone: value.zone,
          zoneNumber: value.zoneNumber,
        };
      },
    },
    discardCard: {
      duration: 2,
      create: ({ ...value }: DiscardCardEffects) => {
        const { card, cardIdx, player, newHand } = value;
        return {
          card,
          cardIdx,
          player,
          newHand,
        };
      },
    },
    revealCard: {
      duration: 0.5,
      create: ({ ...value }: RevealCardEffects) => {
        const { card, zoneNumber, slotIndex, player } = value;
        return {
          card,
          zoneNumber,
          slotIndex,
          player,
        };
      },
    },
  },
};

export default bgioEffectsConfig;
