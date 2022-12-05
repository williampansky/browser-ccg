import { useSelector } from 'react-redux';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';
import type { RootState } from '../../../store';
import styles from './debug-bar.module.scss';
import { getContextualPlayerIds } from '../../../utils';

interface DebugBarComponent {
  G: GameState;
  ctx: Ctx;
  playerID: PlayerID | null;
  addressBarSize: number;
}

export const DebugBar = ({
  G,
  ctx,
  playerID,
  addressBarSize,
}: DebugBarComponent) => {
  const config = useSelector(({ config }: RootState) => config);
  const curP = ctx.currentPlayer;
  const pID = playerID !== null ? playerID : '0';
  const { opponent } = getContextualPlayerIds(pID);

  return config.gameConfig.debugConfig.showDebugBar ? (
    <div className={styles['component']} data-component='DebugBar'>
      <div>
        addressBarSize: <code>{addressBarSize}px</code>
      </div>

      <div>
        g.turn: <code>{G.turn}</code> / ctx.phase: <code>{ctx?.phase}</code>
      </div>

      <div>
        zone1: <code>{G.zones[0]?.name}</code> / zone2:{' '}
        <code>{G.zones[1]?.name}</code> / zone3: <code>{G.zones[2]?.name}</code>
      </div>

      <div>
        currentPlayer: <code>{curP}</code>
      </div>

      <div>
        selectedCardData: <code>{G.selectedCardData[curP]?.key}</code> / selectedCardIndex: <code>{G.selectedCardIndex[curP]}</code>
      </div>

      <div>
        lastCardPlayed.card: <code>{G.lastCardPlayed?.card?.key}</code> / lastCardPlayed.index: <code>{G.lastCardPlayed?.index}</code>
      </div>

      <div>
        g.counts[opponent] — hand: <code>{G.counts[opponent].hand}</code> /
        deck: <code>{G.counts[opponent].deck}</code> / apC: <code>{G.actionPoints[opponent].current}</code> /
        apT: <code>{G.actionPoints[opponent].total}</code>
      </div>
    </div>
  ) : null;
};
