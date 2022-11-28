import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLatestPropsOnEffect } from 'bgio-effects/react';

import type { BoardProps } from 'boardgame.io/react';
import type { Card, GameConfig, GameState, PlayerID } from '../../../types';
import type { RootState as Root } from '../../../store';

import {
  useEndPhase,
  useEndTurnButton,
  useGameOver,
  useWindowSize,
} from '../../../hooks';

import styles from './TheBoard.module.scss';
import { CardModal } from '../../../features/card-modal/CardModal';
import { Zones } from '../../../features/zones/components/Zones/Zones.Wrapper';
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
} from '../';
import { Ctx } from 'boardgame.io';

interface PropsOnEffect {
  G: GameState;
  ctx: Ctx;
}

export interface GameProps extends BoardProps<GameState> {}

export const Board = (props: GameProps) => {
  const {
    ctx: { phase },
    moves,
    moves: { deselectCard, playCard, selectCard, setDone },
    events,
    events: { endPhase, endTurn },
    reset,
    playerID,
    undo,
  } = props;

  const { G, ctx }: PropsOnEffect = useLatestPropsOnEffect('effects:end');
  const {
    gameConfig,
    gameConfig: {
      ai: { enableBotAi },
    },
  } = G;

  // player IDs
  const yourID = playerID === '0' ? '0' : '1';
  const theirID = playerID === '0' ? '1' : '0';

  // hooks
  const dispatch = useDispatch();
  const { height, width } = useWindowSize();
  useEndPhase(events, phase, G.playerTurnDone);
  useGameOver(ctx?.gameover);

  // states
  const abSize = useSelector(({ addressBarSize }: Root) => addressBarSize);
  const endTurnIsDisabled = useEndTurnButton(
    phase,
    G.playerTurnDone,
    yourID,
    ctx.currentPlayer
  );

  // moves
  const onEndTurnButtonClick = () => setDone(yourID);
  const onCardClick = (obj: Card) => dispatch(showCardModal(obj));
  const onCardSelect = (pl: PlayerID, uuid: string) => selectCard(pl, uuid);
  const onCardDeselect = (pl: PlayerID) => deselectCard(pl);
  const onCardSlotDrop = (pl: PlayerID, zNum: number) => playCard(pl, zNum);

  return (
    <>
      <CardModal />
      <BotAiSpinner currentPlayer={ctx.currentPlayer} enabled={enableBotAi} />
      <DebugBar G={G} ctx={ctx} playerID={playerID} addressBarSize={abSize} />
      <TheTurnTextOverlay currentPlayer={ctx.currentPlayer} yourID={yourID} />
      <GameOverOverlay playerID={playerID} reset={reset} />

      <main
        className={styles['component']}
        style={{
          height: height ? height : `calc(100vh - ${abSize}px)`,
          maxHeight: height ? height : `calc(100vh - ${abSize}px)`,
          minHeight: height ? height : `calc(100vh - ${abSize}px)`,
        }}
      >
        <Zones yourID={yourID} theirID={theirID} moves={moves} />

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
