import { Html, Head, Main, NextScript } from 'next/document';
import { NO_FLASH_SCRIPT } from '../components/ui-theme/ui-themes';

export default function Document() {
  return (
    <Html>
      <Head>
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
