import type { Ctx } from 'boardgame.io';
import type { Card, GameState } from '../../../types';

import {
  determineAttackableMinions,
  determineBuffableMinions,
  determineDebuffableMinions,
  determineDestroyableMinions,
  determineHealableMinions,
  determinePlayableCards,
  noAttackableMinionsAvailable,
  noBuffableMinionsAvailable,
  noDebuffableMinionsAvailable,
  noDestroyableMinionsAvailable,
  noHealableMinionsAvailable,
  unsetPlayableCards,
} from '../../../utils';

import core031 from '../../mechanics/core-mechanics-by-key/mechanic.core.031';
import core056 from '../../mechanics/core-mechanics-by-key/mechanic.core.056';
import core110 from '../../mechanics/core-mechanics-by-key/mechanic.core.110';
import core123 from '../../mechanics/core-mechanics-by-key/mechanic.core.123';
import core126 from '../../mechanics/core-mechanics-by-key/mechanic.core.126';
import core129 from '../../mechanics/core-mechanics-by-key/mechanic.core.129';

/**
 * Make sure to also add the card key to the switch statement
 * in `init-targeted-on-play-stage.ts`
 */
const initTargetedOnPlayBuffStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;

  // prettier-ignore
  switch (card.key) {
    case 'SET_CORE_031': core031.init(G, currentPlayer, card); break;
    case 'SET_CORE_110': core110.init(G, currentPlayer, card); break;
    case 'SET_CORE_123': core123.init(G, currentPlayer, card); break;
    case 'SET_CORE_129': core129.init(G, currentPlayer, card); break;
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
const initTargetedOnPlayDebuffStage = (G: GameState, ctx: Ctx, card: Card) => {
  const { currentPlayer } = ctx;

  // prettier-ignore
  switch (card.key) {
    case 'SET_CORE_056': core056.init(G, ctx, card); break;
    default: determineDebuffableMinions(G, currentPlayer); break;
  }

  const noTargetsAvailable = noDebuffableMinionsAvailable(G, currentPlayer);
  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('debuffMinion');
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
  initTargetedOnPlayDebuffStage,
  initTargetedOnPlayDamageStage,
  initTargetedOnPlayDestroyStage,
  initTargetedOnPlayHealStage,
};
