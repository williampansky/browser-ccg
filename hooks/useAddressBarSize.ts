import { useCallback, useEffect, useState } from 'react';

/**
 * Uses html.perspective CSS property, which is set to 100vh, to determine
 * a mobile browser's address bar height; such as Android Chrome's URL bar.
 * @see [StackOverflow]{@link https://stackoverflow.com/a/54796813}
 */
const useAddressBarSize = (): number => {
  const [addressBarSize, setAddressBarSize] = useState<number>(0);

  const addressBarCallback = useCallback(() => {
    if (typeof document !== 'undefined') {
      setAddressBarSize(
        parseFloat(getComputedStyle(document.documentElement).perspective) -
          document.documentElement.clientHeight
      );
    }
  }, []);

  useEffect(() => {
    addressBarCallback();
  }, [addressBarCallback]);

  return addressBarSize;
};

export default useAddressBarSize;
