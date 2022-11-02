import '../styles/site.scss';
import type { AppProps } from 'next/app';

/**
 * Stops NextJS from breaking the dev page due to the
 * bgio/socketio.js bot actions null error.
 */
export const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })
  
  window.addEventListener('unhandledrejection', event => {
    if (event?.reason?.message === "Cannot read properties of null (reading 'payload')") {
      event.stopImmediatePropagation()
    }
  })
`

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
