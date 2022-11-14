import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import type { BoardProps } from 'boardgame.io/react';
import type { Card, GameState } from '../../types';

import {
  useEndPhase,
  useEndTurnButton,
  useGameOver,
  useWindowSize,
} from '../../hooks';

import { CardModal } from './features/card-modal/CardModal';
import { Zones } from './features/zones/components/Zones/Zones.Wrapper';
import { showCardModal } from './features/card-modal/card-modal.slice';
import { setWindowSize } from './features/windowSize';
import { GameOverOverlay } from './features/game-over';
import { DebugBar, EndTurnButton, Player, PlayerHand } from '../../components';

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
  } = props;

  const yourID = playerID === '0' ? '0' : '1';
  const opponentID = playerID === '0' ? '1' : '0';

  // state
  const [addressBarSize, setAddressBarSize] = useState<number>(0);

  // hooks
  const { height, width } = useWindowSize();
  const endTurnIsDisabled = useEndTurnButton(phase, G.playerTurnDone);
  const dispatch = useDispatch();
  useEndPhase(events, phase, G.playerTurnDone);
  useGameOver(ctx?.gameover);

  /**
   * Uses html.perspective CSS property, which is set to 100vh, to determine
   * a mobile browser's address bar height; such as Android Chrome's URL bar.
   * @see [StackOverflow]{@link https://stackoverflow.com/a/54796813}
   */
  const addressBarCallback = useCallback(() => {
    if (typeof document !== 'undefined') {
      setAddressBarSize(
        parseFloat(getComputedStyle(document.documentElement).perspective) -
          document.documentElement.clientHeight
      );
    }
  }, []);

  useEffect(() => {
    dispatch(setWindowSize({ height, width }));
  }, [height, width]);

  useLayoutEffect(() => {
    addressBarCallback();
  }, [addressBarCallback]);

  const onEndTurnButtonClick = () => {
    return moves.setDone('0');
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

  // React.useEffect(() => {
  //   dispatch(setActionPoints(G.actionPoints));
  // }, [G.actionPoints]);

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
        <div
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '22px',
            position: 'absolute',
            top: 0,
            bottom: 'auto',
            left: 0,
            right: 0,
            zIndex: 1,
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
            {G.playerNames['1']}
          </div>
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
                Hand: <strong>{G.counts['1'].hand}</strong>
              </div>
              <div>&nbsp;|&nbsp;</div>
              <div>
                Deck: <strong>{G.counts['1'].deck}</strong>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            position: 'absolute',
            top: '10px',
            bottom: 'auto',
            left: 0,
            right: 0,
            zIndex: 0,
            maxWidth: '100%',
            padding: '0 1em',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridGap: '0',
              width: '100%',
            }}
          >
            {/* {[...Array.from(Array(G.counts['1'].hand))]?.map((_, idx) => {
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexFlow: 'column nowrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                    textAlign: 'center',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: '#333',
                    borderRadius: '0.25em',
                    background: ctx.currentPlayer === '1' ? 'white' : '#616161',
                    height: '3.5em',
                    width: '2.45em',
                    transform:
                      G.selectedCardIndex['1'] === idx
                        ? 'scale(120%)'
                        : 'scale(80%)',
                    transition: '200ms ease-out',
                  }}
                ></div>
              );
            })} */}
          </div>
        </div>

        <Zones player={yourID} opponent={opponentID} />

        <Player player={G.players[yourID]} />

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
            display: 'flex',
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
