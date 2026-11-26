import dynamic from 'next/dynamic';
import type { FunctionComponent } from 'react';
import { PlayLayout } from '../../components/play-board/PlayLayout';

// The board starts its game from the clock, so it renders on the client only.
const PlayBoard = dynamic(
  () =>
    import('../../components/play-board/PlayBoard').then((m) => m.PlayBoard),
  {
    ssr: false,
  },
);

/**
 * The offline board: a game against the AI or hot-seat on this computer, with
 * no server. (`/play` is the online lobby.) The layout is the board lab's
 * saved "wip" preset (see `PlayLayout`).
 */
const LocalPlayPage: FunctionComponent = () => (
  <PlayLayout>
    <PlayBoard />
  </PlayLayout>
);

export default LocalPlayPage;
