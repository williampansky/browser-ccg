import { Fragment } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';

import type { AppProps } from 'next/app';

import { store } from '../store';
import '../node_modules/magic.css/dist/magic.min.css';
import '../styles/site.scss';

/**
 * Stops NextJS from breaking the dev page due to the
 * bgio/socketio.js bot actions null error.
 * @see https://github.com/vercel/next.js/discussions/13387#discussioncomment-101564
 */
export const noOverlayWorkaroundScript = `
  function isGame() {
    var hrefIsGame = window.location.href.includes("/play");
    if (hrefIsGame) return true;
    return false;
  }

  function isFromBgioSocket(message, source) {
    var msgString = "Cannot read properties of null (reading 'payload')";
    var stackString = "boardgame.io/dist/esm/socketio";

    if (message === msgString && source.includes(stackString)) return true;
    return false;
  }

  window.addEventListener('error', function(event) {
    event.stopImmediatePropagation();
  });
  
  window.addEventListener('unhandledrejection', function(event) {
    var message = event && event.reason && event.reason.message;
    var stack = event && event.reason && event.reason.stack;

    if (isGame() && isFromBgioSocket(message, stack)) {
      event.stopImmediatePropagation();
    }
  });
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Provider store={store}>
        <Head>
          {process.env.NODE_ENV !== 'production' && (
            <script
              dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
            />
          )}
        </Head>
        <Component {...pageProps} />
      </Provider>
    </Fragment>
  );
}
