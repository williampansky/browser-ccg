import { useEffect } from 'react';
import { gameConfig } from '../app.config';
import { PlayerID } from '../types';

const useEndPhase = (
  events: any,
  ctxPhase: string,
  playerTurnDone: Record<PlayerID, boolean>
): void => {
  if (gameConfig.asynchronousTurns === true) {
    useEffect(() => {
      const isPlayCardsPhase = ctxPhase === 'playCards';
      const player0Done = playerTurnDone['0'] === true;
      const player1Done = playerTurnDone['1'] === true;
  
      if (isPlayCardsPhase && player0Done && player1Done) events?.endPhase!();
    }, [ctxPhase, playerTurnDone]);
  }
};

export default useEndPhase;
