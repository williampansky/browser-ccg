import dynamic from 'next/dynamic';
import type { FunctionComponent } from 'react';

// The board starts its game from the clock, so it renders on the client only.
const PlayBoard = dynamic(() => import('../../components/play-board/PlayBoard').then((m) => m.PlayBoard), {
  ssr: false,
});

/** Hot-seat board for the new Hearthstone-style engine (see ROADMAP Milestone 2). */
const PlayPage: FunctionComponent = () => <PlayBoard />;

export default PlayPage;
