import { Ctx } from 'boardgame.io';
import { useEffect, useState } from 'react';
import type { PlayerID } from '../types';

const useEndTurnButtonExtended = (
  ctx: Ctx,
  playerTurnDone: Record<PlayerID, boolean>,
  playerId: PlayerID
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (ctx.currentPlayer === playerId) {
      if (ctx.phase !== 'playCard') setEndTurnDisabled(true);
      else if (ctx.activePlayers !== null) setEndTurnDisabled(true);
      else setEndTurnDisabled(false);
    } else {
      setEndTurnDisabled(true);
    }
  }, [
    ctx.phase,
    ctx.activePlayers,
    ctx.currentPlayer,
    playerTurnDone,
    playerId,
  ]);

  return endTurnDisabled;
};

export default useEndTurnButtonExtended;
