import React, { useCallback, useLayoutEffect, useState } from 'react';
import Component from './components/Player.dev';

const App = () => {
  const [addressBarSize, setAddressBarSize] = useState(0);

  /**
   * Uses html.perspective CSS property, which is set to 100vh, to determine
   * a mobile browser's address bar height; such as Android Chrome's URL bar.
   * @see [StackOverflow]{@link https://stackoverflow.com/a/54796813}
   */

  const addressBarCallback = useCallback(() => {
    if (typeof document !== 'undefined') {
      setAddressBarSize(
        parseFloat(getComputedStyle(document.documentElement).perspective) -
          document.documentElement.clientHeight
      );
    }
  }, []);

  useLayoutEffect(() => {
    addressBarCallback();
  }, [addressBarCallback]);

  return (
    <React.Fragment>
      <div className="addressBarSize">{addressBarSize}</div>
      <div id="wrap" style={{ height: `calc(100vh - ${addressBarSize}px)` }}>
        <Component />
      </div>
    </React.Fragment>
  );
};

export default App;
