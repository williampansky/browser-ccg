import { useEffect } from 'react';
import { gameConfig } from '../app.config';

const { numerics, mechanics, zonesConfig } = gameConfig;

/**
 * Injects a `<style>` tag into the document head
 * to convert config entries into CSS variables.
 */
const useConfigCssVariables = (): void => {
  useEffect(() => {
    const style = document.createElement('style');

    style.textContent = `
      :root {
        ${Object.entries(numerics).map((k) => {
          return `--config-${k[0]}: ${k[1]};`
        }).toString().replace(/\,/g, '')}
        
        ${Object.entries(mechanics).map((k) => {
          return `--config-${k[0]}: ${k[1]};`
        }).toString().replace(/\,/g, '')}
        
        ${Object.entries(zonesConfig).map((k) => {
          return `--config-${k[0]}: ${k[1]};`
        }).toString().replace(/\,/g, '')}
      }
      `;
      // --config-actionPointsPerTurn: ${numerics.actionPointsPerTurn};
      // --config-actionPointsTotal: ${numerics.actionPointsTotal};
      // --config-cardsPerDeck: ${numerics.cardsPerDeck};
      // --config-cardsPerHand: ${numerics.cardsPerHand};
      // --config-cardsPerStartingHand: ${numerics.cardsPerStartingHand};
      // --config-cardsPerTurn: ${numerics.cardsPerTurn};
      // --config-numberOfPlayers: ${numerics.numberOfPlayers};
      // --config-numberOfSingleTurnsPerGame: ${numerics.numberOfSingleTurnsPerGame};
      // --config-numberOfSlotsPerZone: ${numerics.numberOfSlotsPerZone};
      // --config-numberOfZones: ${numerics.numberOfZones};

    document.head.appendChild(style);
  }, []);
};

export default useConfigCssVariables;
