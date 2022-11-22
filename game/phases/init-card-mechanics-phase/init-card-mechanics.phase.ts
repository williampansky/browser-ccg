import { current } from 'immer';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import { getContextualPlayerIds, logPhaseToConsole } from '../../../utils';
import { firstRevealer } from '../../state';
import { Mechanics } from '../../../enums';
import {
  initEventMechanics,
  initOnPlayMechanics,
  initOnTurnEndMechanics,
} from '../../mechanics';

const initCardMechanicsPhase: PhaseConfig = {
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);

    // prettier-ignore
    G.zones.forEach((zone: Zone, zoneIdx: number) => {
      zone.sides[first].forEach((card: Card, cardIdx: number) => {
        const props: InitGameMechanic = {
          G,
          ctx,
          zone,
          zoneIdx,
          card,
          cardIdx,
          player: first
        };

        const onPlay = (callback?: () => void) => initOnPlay({...props}, callback);
        const onEvent = (callback?: () => void) => initEvent({...props}, callback);
        const turnEnd = (callback?: () => void) => initTurnEnd({...props}, callback);
        
        onPlay(
          onEvent(
            turnEnd()
          )
        );
      });

      zone.sides[second].forEach((card: Card, cardIdx: number) => {
        const props: InitGameMechanic = {
          G,
          ctx,
          zone,
          zoneIdx,
          card,
          cardIdx,
          player: second
        };

        const onPlay = (callback?: () => void) => initOnPlay({...props}, callback);
        const onEvent = (callback?: () => void) => initEvent({...props}, callback);
        const turnEnd = (callback?: () => void) => initTurnEnd({...props}, callback);
        
        onPlay(
          onEvent(
            turnEnd()
          )
        );
      });
    });

    ctx.events?.endPhase();
  },
};

interface InitGameMechanic {
  G: GameState;
  ctx: Ctx;
  zone: Zone;
  zoneIdx: number;
  card: Card;
  cardIdx: number;
  player: PlayerID;
}

function initOnPlay(
  { G, ctx, zone, zoneIdx, card, cardIdx, player }: InitGameMechanic,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const revealedThisTurn = card.revealedOnTurn === G.turn;
  const hasOnPlay = card.mechanics?.includes('ON_PLAY');

  if (revealedThisTurn && hasOnPlay) {
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
  }

  if (callback) return callback;
}

function initEvent(
  { G, ctx, zone, zoneIdx, card, cardIdx, player }: InitGameMechanic,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const hasEvent = card.mechanics?.includes('EVENT');

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

function initTurnEnd(
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

export default initCardMechanicsPhase;
