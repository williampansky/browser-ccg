import { useEffect, useState } from 'react';
import { gameConfig } from '../app.config';
import type { PlayerID } from '../types';

const { asynchronousTurns } = gameConfig;
const gameUsesAsyncTurns = asynchronousTurns === true;
const gameUsesDefaultTurns = asynchronousTurns === false;

const useEndTurnButtonAsync = (
  ctxPhase: string,
  playerTurnDone: Record<PlayerID, boolean>,
  playerId: PlayerID,
  currentPlayer: PlayerID,
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (ctxPhase !== 'playCards') setEndTurnDisabled(true);
    if (playerTurnDone[playerId] === true) setEndTurnDisabled(true);
    else setTimeout(() => setEndTurnDisabled(false), 2000);
  }, [ctxPhase, playerTurnDone]);

  return endTurnDisabled;
};

const useEndTurnButtonDefault = (
  ctxPhase: string,
  playerTurnDone: Record<PlayerID, boolean>,
  playerId: PlayerID,
  currentPlayer: PlayerID,
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (ctxPhase !== 'playCards') {
      setEndTurnDisabled(true);
    } else if (currentPlayer === playerId) {
      setEndTurnDisabled(false);
    } else {
      setEndTurnDisabled(true);
    }
  }, [ctxPhase, currentPlayer, playerTurnDone, playerId]);

  return endTurnDisabled;
};

const useEndTurnButtonExtended = (
  ctxPhase: string,
  playerTurnDone: Record<PlayerID, boolean>,
  playerId: PlayerID,
  currentPlayer: PlayerID,
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (currentPlayer === playerId) {
      if (ctxPhase !== 'playCard') setEndTurnDisabled(true);
      else setEndTurnDisabled(false);
    } else {
      setEndTurnDisabled(true);
    }
  }, [ctxPhase, currentPlayer, playerTurnDone, playerId]);

  return endTurnDisabled;
};

// export default gameUsesAsyncTurns
//   ? useEndTurnButtonAsync
//   : useEndTurnButtonDefault;
export default useEndTurnButtonExtended;
