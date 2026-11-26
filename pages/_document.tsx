import { Html, Head, Main, NextScript } from 'next/document';
import { NO_FLASH_SCRIPT } from '../components/ui-theme/ui-themes';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Lets a phone install the game as an app with no browser bar. */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Sets the saved interface theme before the first paint (no flash of the default). */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
