import dynamic from 'next/dynamic';
import type { FunctionComponent } from 'react';
import {
  PLAY_LAYOUT,
  buildLayoutCss,
} from '../../components/play-board/layout-css';

// The board and the socket start from the browser, so client only.
const OnlinePlay = dynamic(
  () =>
    import('../../components/play-board/online/OnlinePlay').then(
      (m) => m.OnlinePlay,
    ),
  { ssr: false },
);

/** Queue for a game against another player (or a bot after a wait). */
const OnlinePage: FunctionComponent = () => (
  <>
    <style>{buildLayoutCss({ ...PLAY_LAYOUT })}</style>
    <OnlinePlay />
  </>
);

export default OnlinePage;
