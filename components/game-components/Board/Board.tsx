import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLatestPropsOnEffect } from 'bgio-effects/react';

import type { Ctx } from 'boardgame.io';
import type { BoardProps } from 'boardgame.io/react';
import type { RootState as Root } from '../../../store';
import type { Card, GameState } from '../../../types';

import {
  useEndPhase,
  useEndTurnButton,
  useGameOver,
  usePrevious,
  useWindowSize,
} from '../../../hooks';

import styles from './TheBoard.module.scss';
import { CardModal } from '../../../features/card-modal/CardModal';
import { showCardModal } from '../../../features/card-modal/card-modal.slice';
import { GameOverOverlay } from '../../../features/game-over';
import {
  BotAiSpinner,
  DebugBar,
  DragLayer,
  EndTurnButton,
  Player,
  PlayerHand,
  TheTurnTextOverlay,
  TheZonesContainer,
  TheDiscardedCardPopup,
} from '../';

import {
  AttackMinionMove,
  BuffMinionMove,
  DebuffMinionMove,
  DeselectCardMove,
  DestroyMinionMove,
  HealMinionMove,
  PlayCardMove,
  SelectCardMove,
} from '../../../game/moves';

interface PropsOnEffect {
  G: GameState;
  ctx: Ctx;
}

export interface GameProps extends BoardProps<GameState> {}

export const Board = (props: GameProps) => {
  const {
    moves,
    moves: {
      attackMinion,
      buffMinion,
      debuffMinion,
      destroyMinion,
      deselectCard,
      playCard,
      selectCard,
      setDone,
      healMinion,
    },
    events,
    events: { endPhase, endTurn },
    reset,
    playerID,
    undo,
  } = props;

  const {
    G,
    G: {
      gameConfig,
      gameConfig: {
        ai: { enableBotAi },
      },
      lastMoveMade,
      lastCardPlayed,
      playedCards,
      playerTurnDone,
      selectedCardData,
      selectedCardIndex,
    },
    ctx,
    ctx: { currentPlayer, phase },
  }: PropsOnEffect = useLatestPropsOnEffect('effects:end');

  // player IDs
  const yourID = playerID === '0' ? '0' : '1';
  const theirID = playerID === '0' ? '1' : '0';

  // hooks
  const dispatch = useDispatch();
  const { height, width } = useWindowSize();
  // useEndPhase(events, phase, playerTurnDone);
  useGameOver(ctx?.gameover);

  // states
  const abSize = useSelector(({ addressBarSize }: Root) => addressBarSize);
  const endTurnIsDisabled = useEndTurnButton(ctx, playerTurnDone, yourID);

  // moves
  const onEndTurnButtonClick = useCallback(() => {
    return setDone({ player: yourID });
  }, []);

  const onCardClick = useCallback((obj: Card) => {
    return dispatch(showCardModal(obj));
  }, []);

  const onCardDeselect = useCallback(({ player }: DeselectCardMove) => {
    return deselectCard({ player });
  }, []);

  const onCardSelect = useCallback(({ player, cardUuid }: SelectCardMove) => {
    return selectCard({ player, cardUuid });
  }, []);

  const onCardSlotDrop = useCallback(({ zoneNumber }: PlayCardMove) => {
    return playCard({ zoneNumber: zoneNumber });
  }, []);

  const onAttackMinionClick = useCallback(
    ({ card, targetPlayer }: AttackMinionMove) => {
      if (card && targetPlayer) return attackMinion({ card, targetPlayer });
      else
        return console.error(
          `ERROR: onAttackMinionClick(${targetPlayer}, ${card})`
        );
    },
    [currentPlayer]
  );

  const onBuffMinionClick = useCallback(
    ({ card, targetPlayer }: BuffMinionMove) => {
      if (card && targetPlayer) return buffMinion({ card, targetPlayer });
      else
        return console.error(
          `ERROR: onBuffMinionClick(${targetPlayer}, ${card})`
        );
    },
    [currentPlayer]
  );

  const onDebuffMinionClick = useCallback(
    ({ card, targetPlayer }: DebuffMinionMove) => {
      if (card && targetPlayer) return debuffMinion({ card, targetPlayer });
      else
        return console.error(
          `ERROR: onDebuffMinionClick(${targetPlayer}, ${card})`
        );
    },
    [currentPlayer]
  );

  const onDestroyMinionClick = useCallback(
    ({ card, targetPlayer }: DestroyMinionMove) => {
      if (card && targetPlayer) return destroyMinion({ card, targetPlayer });
      else
        return console.error(
          `ERROR: onDestroyMinionClick(${targetPlayer}, ${card})`
        );
    },
    [currentPlayer]
  );

  const onHealMinionClick = useCallback(
    ({ card, targetPlayer }: HealMinionMove) => {
      if (card && targetPlayer) return healMinion({ card, targetPlayer });
      else
        return console.error(
          `ERROR: onHealMinionClick(${targetPlayer}, ${card})`
        );
    },
    [currentPlayer]
  );

  return (
    <>
      <CardModal />
      <BotAiSpinner currentPlayer={ctx.currentPlayer} enabled={enableBotAi} />
      <DebugBar G={G} ctx={ctx} playerID={playerID} addressBarSize={abSize} />
      <TheTurnTextOverlay currentPlayer={ctx.currentPlayer} yourID={yourID} />
      <GameOverOverlay playerID={playerID} reset={reset} />

      <TheDiscardedCardPopup
        G={G}
        player={playerID}
        yourID={yourID}
        array={G.players[yourID].cards.discarded}
        arrayLength={G.counts[yourID].discarded}
      />

      <main
        className={styles['component']}
        style={{
          height: height ? height : `calc(100vh - ${abSize}px)`,
          maxHeight: height ? height : `calc(100vh - ${abSize}px)`,
          minHeight: height ? height : `calc(100vh - ${abSize}px)`,
          width: width ? width : `100vw`,
          maxWidth: width ? width : `100vw`,
          minWidth: width ? width : `100vw`,
        }}
      >
        <TheZonesContainer
          ctx={ctx}
          G={G}
          moves={moves}
          theirID={theirID}
          yourID={yourID}
          onAttackMinionClick={onAttackMinionClick}
          onBuffMinionClick={onBuffMinionClick}
          onDebuffMinionClick={onDebuffMinionClick}
          onDestroyMinionClick={onDestroyMinionClick}
          onHealMinionClick={onHealMinionClick}
        />

        {/* {height && width ? (
          <DragLayer height={height - abSize} width={width} />
        ) : null} */}

        <Player
          actionPoints={G.actionPoints[yourID]}
          counts={G.counts[yourID]}
          currentTurn={G.turn}
          endTurnIsDisabled={endTurnIsDisabled}
          onEndTurnButtonClick={onEndTurnButtonClick}
          player={G.players[yourID]}
          turnsPerGame={G.totalTurns}
        />

        <PlayerHand
          G={G}
          ctx={ctx}
          moves={moves}
          onCardClick={onCardClick}
          onCardSelect={onCardSelect}
          onCardDeselect={onCardDeselect}
          onCardSlotDrop={onCardSlotDrop}
          player={yourID}
        />
      </main>
    </>
  );
};
