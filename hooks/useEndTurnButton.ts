import { useEffect, useState } from 'react';
import { gameConfig } from '../app.config';
import type { PlayerID } from '../types';

const { asynchronousTurns } = gameConfig;
const gameUsesAsyncTurns = asynchronousTurns === true;
const gameUsesDefaultTurns = asynchronousTurns === false;

const useEndTurnButton = (
  ctxPhase: string,
  currentPlayer: PlayerID,
  playerTurnDone: Record<PlayerID, boolean>,
  playerId: PlayerID
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (gameUsesAsyncTurns) {
      if (ctxPhase !== 'playCards') setEndTurnDisabled(true);
      if (playerTurnDone[playerId] === true) setEndTurnDisabled(true);
      else setTimeout(() => setEndTurnDisabled(false), 2000);
    } else if (gameUsesDefaultTurns) {
      if (currentPlayer === playerId) {
        if (playerTurnDone[playerId] === true) setEndTurnDisabled(true);
        else setEndTurnDisabled(false);
      } else setEndTurnDisabled(true);
    }
  }, [ctxPhase, currentPlayer, playerTurnDone, playerId]);

  return endTurnDisabled;
};

export default useEndTurnButton;
