import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLatestPropsOnEffect } from 'bgio-effects/react';

import type { BoardProps } from 'boardgame.io/react';
import type { Card, GameConfig, GameState, PlayerID } from '../../../types';
import type { RootState as Root } from '../../../store';

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
import { Ctx } from 'boardgame.io';
import { gt } from 'lodash';
import { setDiscardedCard } from '../../../features';

interface PropsOnEffect {
  G: GameState;
  ctx: Ctx;
}

export interface GameProps extends BoardProps<GameState> {}

export const Board = (props: GameProps) => {
  const {
    moves,
    moves: { deselectCard, playCard, selectCard, setDone, healMinion },
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
      playedCards,
      playerTurnDone,
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
  const endTurnIsDisabled = useEndTurnButton(
    phase,
    playerTurnDone,
    yourID,
    currentPlayer
  );

  // moves
  const onEndTurnButtonClick = () => setTimeout(() => setDone(yourID), 1500);
  const onCardClick = (obj: Card) => dispatch(showCardModal(obj));
  const onCardSelect = (pl: PlayerID, uuid: string) => selectCard(uuid);
  const onCardSlotDrop = (zNum: number) => playCard(zNum);

  const onCardDeselect = useCallback(() => {
    if (lastMoveMade !== 'playCard') {
      return setTimeout(() => deselectCard(), 100);
    }
  }, [lastMoveMade]);

  const onHealMinionClick = useCallback(
    (targetPlayer?: PlayerID, cardToHeal?: Card) => {
      if (targetPlayer && cardToHeal)
        return healMinion(
          cardToHeal,
          playedCards[yourID][playedCards[yourID].length - 1],
          targetPlayer
        );
      else
        return console.error(
          `ERROR: onHealMinionClick(${targetPlayer}, ${cardToHeal})`
        );
    },
    [currentPlayer, playedCards]
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
          turnsPerGame={gameConfig.numerics.numberOfSingleTurnsPerGame}
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
