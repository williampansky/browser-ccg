import { useEffect } from 'react';
import { gameConfig } from '../app.config';

const { numerics } = gameConfig;

/**
 * Injects a `<style>` tag into the document head
 * for global CSS that only applies to the game.
 */
const useGlobalGameStyles = (): void => {
  useEffect(() => {
    const style = document.createElement('style');

    style.textContent = `
      :root {
        --config-actionPointsPerTurn: ${numerics.actionPointsPerTurn};
        --config-actionPointsTotal: ${numerics.actionPointsTotal};
        --config-cardsPerDeck: ${numerics.cardsPerDeck};
        --config-cardsPerHand: ${numerics.cardsPerHand};
        --config-cardsPerStartingHand: ${numerics.cardsPerStartingHand};
        --config-cardsPerTurn: ${numerics.cardsPerTurn};
        --config-numberOfPlayers: ${numerics.numberOfPlayers};
        --config-numberOfSingleTurnsPerGame: ${numerics.numberOfSingleTurnsPerGame};
        --config-numberOfSlotsPerZone: ${numerics.numberOfSlotsPerZone};
        --config-numberOfZones: ${numerics.numberOfZones};
      }

      html {
        perspective: 100vh;
        position: fixed;
        overflow: hidden;
      }
      
      img {
        pointer-events: none;
      }
      
      main {
        width: 100vw;
        max-width: 100vw;
        min-width: 100vw;
        overflow: hidden;
      }
    `;

    document.head.appendChild(style);
  }, []);
};

export default useGlobalGameStyles;
