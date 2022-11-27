import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setWindowSize as setWindowSizeToStore } from '../features/windowSize';

interface WindowSize {
  height?: number;
  width?: number;
}

/**
 * Returns `{ height, width }` of window on resize event,
 * also takes care of dispatching to redux store.
 * @example const { height, width } = useWindowSize();
 */
export default function useWindowSize() {
  const dispatch = useDispatch();
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<WindowSize>({
    height: undefined,
    width: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });

      // Set window width/height to redux store
      dispatch(setWindowSizeToStore({
        height: window.innerHeight,
        width: window.innerWidth,
      }));
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
