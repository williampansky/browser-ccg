import dynamic from 'next/dynamic';
import type { FunctionComponent } from 'react';
import { PlayLayout } from '../../components/play-board/PlayLayout';

// The board and the socket start from the browser, so client only.
const OnlinePlay = dynamic(
  () =>
    import('../../components/play-board/online/OnlinePlay').then(
      (m) => m.OnlinePlay,
    ),
  { ssr: false },
);

/**
 * Where you choose a hero and deck and queue for a game against another player
 * (or a bot after a wait, or straight away if you ask for one).
 */
const PlayPage: FunctionComponent = () => (
  <PlayLayout>
    <OnlinePlay />
  </PlayLayout>
);

export default PlayPage;
