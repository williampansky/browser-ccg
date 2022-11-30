import { Ctx } from 'boardgame.io';
import { Mechanics } from '../../../enums';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import { getContextualPlayerIds } from '../../../utils';
import {
  initEventMechanics,
  initOnPlayMechanics,
  initOnTurnEndMechanics,
} from '../../mechanics';

export interface InitGameMechanic {
  G: GameState;
  ctx: Ctx;
  zone: Zone;
  zoneIdx: number;
  card: Card;
  cardIdx: number;
  player: PlayerID;
}

export function initOnPlay(
  { G, ctx, zone, zoneIdx, card, cardIdx, player }: InitGameMechanic,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const revealedThisTurn = card.revealedOnTurn === G.turn;
  const hasOnPlay = card.mechanics?.includes(Mechanics.OnPlay);
  const hasNotTriggered = card.booleans.onPlayWasTriggered === false;

  if (revealedThisTurn && hasOnPlay && hasNotTriggered) {
    initOnPlayMechanics(
      G,
      ctx,
      G.gameConfig,
      zone,
      zoneIdx,
      card,
      cardIdx,
      player,
      opponent
    );

    // G.zones[zoneIdx].sides[player][cardIdx].booleans.onPlayWasTriggered = true;
  }

  if (callback) return callback;
}

export function initEvent(
  { G, ctx, zone, zoneIdx, card, cardIdx, player }: InitGameMechanic,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const hasEvent = card.mechanics?.includes(Mechanics.Event);

  if (hasEvent) {
    initEventMechanics(
      G,
      ctx,
      G.gameConfig,
      zone,
      zoneIdx,
      card,
      cardIdx,
      player,
      opponent
    );
  }

  if (callback) return callback;
}

export function initTurnEnd(
  { G, ctx, zone, zoneIdx, card, cardIdx, player }: InitGameMechanic,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const hasTurnEnd = card.mechanics?.includes(Mechanics.OnTurnEnd);

  if (hasTurnEnd) {
    initOnTurnEndMechanics(
      G,
      ctx,
      G.gameConfig,
      zone,
      zoneIdx,
      card,
      cardIdx,
      player,
      opponent
    );
  }

  if (callback) return callback;
}
