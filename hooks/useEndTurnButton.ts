import { useEffect, useState } from 'react';
import { PlayerID } from '../types';

const useEndTurnButton = (
  ctxPhase: string,
  playerTurnDone: Record<PlayerID, boolean>
): boolean => {
  const [endTurnDisabled, setEndTurnDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (ctxPhase !== 'playCards') setEndTurnDisabled(true);
    if (playerTurnDone['0'] === true) setEndTurnDisabled(true);
    else setTimeout(() => setEndTurnDisabled(false), 2000);
  }, [ctxPhase, playerTurnDone]);

  return endTurnDisabled;
};

export default useEndTurnButton;
