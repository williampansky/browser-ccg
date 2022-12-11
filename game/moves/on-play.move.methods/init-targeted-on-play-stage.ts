import type { Ctx } from 'boardgame.io';
import type { Card, GameState } from '../../../types';
import {
  determineAttackableMinions,
  determineBuffableMinions,
  determineDestroyableMinions,
  determineHealableMinions,
  determinePlayableCards,
  noAttackableMinionsAvailable,
  noBuffableMinionsAvailable,
  noDestroyableMinionsAvailable,
  noHealableMinionsAvailable,
  unsetPlayableCards,
} from '../../../utils';
import { core031, core050, core110 } from '../../mechanics';
import core126 from '../../mechanics/core-mechanics-by-key/mechanic.core.126';

/**
 *
 */
const initTargetedOnPlayBuffStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;

  // prettier-ignore
  switch (card.key) {
    case 'SET_CORE_031': core031.init(G, currentPlayer, card); break;
    case 'SET_CORE_110': core110.init(G, currentPlayer, card); break;
    default: determineBuffableMinions(G, currentPlayer); break;
  }

  const noTargetsAvailable = noBuffableMinionsAvailable(G, currentPlayer);
  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('buffMinion');
  }
};

/**
 *
 */
const initTargetedOnPlayDamageStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;

  // prettier-ignore
  switch (card.key) {
    // case 'SET_CORE_126': core050.init(G, currentPlayer, card); break;
    default: determineAttackableMinions(G, currentPlayer); break;
  }

  const noTargetsAvailable = noAttackableMinionsAvailable(G, currentPlayer);
  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('attackMinion');
  }
};

/**
 *
 */
const initTargetedOnPlayDestroyStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;

  // prettier-ignore
  switch (card.key) {
    case 'SET_CORE_126': core126.init(G, ctx, currentPlayer, card); break;
    default: determineDestroyableMinions(G, currentPlayer); break;
  }

  const noTargetsAvailable = noDestroyableMinionsAvailable(G, currentPlayer);
  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('destroyMinion');
  }
};

/**
 *
 */
const initTargetedOnPlayHealStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;
  determineHealableMinions(G, currentPlayer);
  const noTargetsAvailable = noHealableMinionsAvailable(G, currentPlayer);

  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('healMinion');
  }
};

export {
  initTargetedOnPlayBuffStage,
  initTargetedOnPlayDamageStage,
  initTargetedOnPlayDestroyStage,
  initTargetedOnPlayHealStage,
}
