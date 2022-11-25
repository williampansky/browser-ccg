import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImSpinner10 } from 'react-icons/im';

import type { BoardProps } from 'boardgame.io/react';
import type { Card, GameState } from '../../../types';
import type { RootState } from '../../../store';

import {
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
    undo,
  } = props;

  // player IDs
  const yourID = playerID === '0' ? '0' : '1';
  const theirID = playerID === '0' ? '1' : '0';

  // hooks
  const endTurnIsDisabled = useEndTurnButton(
    phase,
    ctx.currentPlayer,
    G.playerTurnDone,
    yourID
  );
  const { height, width } = useWindowSize();
  const dispatch = useDispatch();
  useEndPhase(events, phase, G.playerTurnDone);
  useGameOver(ctx?.gameover);

  // states
  const abSize = useSelector(({ addressBarSize }: RootState) => addressBarSize);

  useEffect(() => {
    dispatch(setWindowSize({ height, width }));
  }, [height, width]);

  const onEndTurnButtonClick = () => {
    if (gameConfig.asynchronousTurns) return moves.setDone(yourID);
    
    moves.setDone(yourID);
    if (ctx.playOrderPos === 1) {
      events?.endTurn!({ next: theirID });
      return events?.endPhase!();
    }

    else return events?.endTurn!({ next: theirID });
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
      <DebugBar G={G} ctx={ctx} playerID={playerID} addressBarSize={abSize} />
      <GameOverOverlay playerID={playerID} reset={reset} />

      {/* @todo fix later */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 'auto',
        left: 0,
        right: 'auto',
        margin: '1em',
        pointerEvents: 'none',
        display: ctx?.currentPlayer === '1' ? 'block' : 'none'
      }}>
        <ImSpinner10 className='bccg-spinner' />
      </div>

      <main
        style={{
          height: `calc(100vh - ${abSize}px)`,
          maxHeight: `calc(100vh - ${abSize}px)`,
          minHeight: `calc(100vh - ${abSize}px)`,
          position: 'relative',
        }}
      >
        <CardModal />
        <Zones yourID={yourID} theirID={theirID} />
        <Player
          actionPoints={G.actionPoints[yourID]}
          counts={G.counts[yourID]}
          currentTurn={G.turn}
          endTurnIsDisabled={endTurnIsDisabled}
          onEndTurnButtonClick={onEndTurnButtonClick}
          player={G.players[yourID]}
          turnsPerGame={gameConfig.numerics.numberOfSingleTurnsPerGame}
        />

        {G.players[yourID] && (
          <PlayerHand
            G={G}
            ctx={ctx}
            onCardClick={onCardClick}
            onCardSelect={onCardSelect}
            onCardDeselect={onCardDeselect}
            onCardSlotDrop={onCardSlotDrop}
            player={yourID}
          />
        )}

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
