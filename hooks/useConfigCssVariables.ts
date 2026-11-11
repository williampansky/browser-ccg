import { useEffect } from 'react';
import { gameConfig } from '../app.config';

const { numerics } = gameConfig;

/**
 * Injects a `<style>` tag into the document head
 * to convert config entries into CSS variables.
 */
const useConfigCssVariables = (): void => {
  useEffect(() => {
    const style = document.createElement('style');

    style.textContent = `
      :root {
        ${Object.entries(numerics)
          .map(([key, value]) => `--config-${key}: ${value};`)
          .join('\n        ')}
      }
      `;

    document.head.appendChild(style);
  }, []);
};

export default useConfigCssVariables;
