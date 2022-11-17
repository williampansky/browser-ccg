import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import type { BoardProps } from 'boardgame.io/react';
import type { Card, GameState } from '../../../types';

import {
  useAddressBarSize,
  useEndPhase,
  useEndTurnButton,
  useGameOver,
  useWindowSize,
} from '../../../hooks';

import { CardModal } from '../../../features/card-modal/CardModal';
import { Zones } from '../../../features/zones/components/Zones/Zones.Wrapper';
import { showCardModal } from '../../../features/card-modal/card-modal.slice';
import { setWindowSize } from '../../../features/windowSize';
import { GameOverOverlay } from '../../../features/game-over';
import { DebugBar, EndTurnButton, Player, PlayerHand } from '../';

import styles from './board.module.scss';

export interface GameProps extends BoardProps<GameState> {}

export const Board = (props: GameProps) => {
  const {
    G,
    G: { gameConfig },
    ctx,
    ctx: { phase, gameover },
    moves,
    events,
    events: { endPhase },
    reset,
    playerID,
    undo
  } = props;

  const yourID = playerID === '0' ? '0' : '1';
  const opponentID = playerID === '0' ? '1' : '0';

  // hooks
  const { height, width } = useWindowSize();
  const addressBarSize = useAddressBarSize();
  const endTurnIsDisabled = useEndTurnButton(phase, G.playerTurnDone);
  const dispatch = useDispatch();
  useEndPhase(events, phase, G.playerTurnDone);
  useGameOver(ctx?.gameover);

  useEffect(() => {
    dispatch(setWindowSize({ height, width }));
  }, [height, width]);

  const onEndTurnButtonClick = () => {
    return moves.setDone(yourID);
  };

  const onCardClick = (obj: Card) => {
    dispatch(showCardModal(obj));
  };

  const onCardSelect = (playerId: string, uuid: string) => {
    return moves.selectCard(playerId, uuid);
  };

  const onCardDeselect = (playerId: string) => {
    return moves.deselectCard(playerId);
  };

  const onCardSlotDrop = (playerId: string, zoneNumber: number) => {
    return moves.playCard(playerId, zoneNumber);
  };

  return (
    <>
      <DebugBar
        G={G}
        ctx={ctx}
        playerID={playerID}
        addressBarSize={addressBarSize}
      />

      <GameOverOverlay playerID={playerID} reset={reset} />

      <main
        style={{
          height: `calc(100vh - ${addressBarSize}px)`,
          maxHeight: `calc(100vh - ${addressBarSize}px)`,
          minHeight: `calc(100vh - ${addressBarSize}px)`,
          position: 'relative',
        }}
      >
        <CardModal />
        <Zones player={yourID} opponent={opponentID} />
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
          onCardClick={onCardClick}
          onCardSelect={onCardSelect}
          onCardDeselect={onCardDeselect}
          onCardSlotDrop={onCardSlotDrop}
          player={yourID}
        />

        <div
          style={{
            display: 'none',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '22px',
            zIndex: 200,
            position: 'absolute',
            top: 'auto',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.15em',
            background: '#333',
          }}
        >
          <div
            style={{
              paddingRight: '0.25em',
              marginRight: 'auto',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              color: 'white',
            }}
          >
            {G.playerNames['0']}
          </div>
          {/* <ActionPoints player={playerID} /> */}
          <div
            style={{
              padding: '0 0.15em',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                fontSize: 11,
                color: 'white',
                whiteSpace: 'nowrap',
              }}
            >
              <div>
                Hand: <strong>{G.counts['0'].hand}</strong>
              </div>
              <div>&nbsp;|&nbsp;</div>
              <div>
                Deck: <strong>{G.counts['0'].deck}</strong>
              </div>
              <div>&nbsp;|&nbsp;</div>
              <div>
                AP: <strong>{G.actionPoints['0'].current}</strong> /{' '}
                <strong>{G.actionPoints['0'].total}</strong>
              </div>
            </div>
          </div>
          <div
            style={{
              paddingLeft: '0.15em',
              marginLeft: 'auto',
            }}
          >
            <EndTurnButton
              currentTurn={G.turn}
              isDisabled={endTurnIsDisabled}
              onClick={onEndTurnButtonClick}
              turnsPerGame={gameConfig.numerics.numberOfSingleTurnsPerGame}
            />
          </div>
        </div>
      </main>
    </>
  );
};
