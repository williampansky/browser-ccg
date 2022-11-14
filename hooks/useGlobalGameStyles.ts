import { useEffect } from 'react';

/**
 * Injects a `<style>` tag into the document head
 * for global CSS that only applies to the game.
 */
const useGlobalGameStyles = (): void => {
  useEffect(() => {
    const style = document.createElement('style');

    style.textContent = `
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
