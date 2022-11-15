import { useSelector } from 'react-redux';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';
import type { RootState } from '../../../store';
import styles from './debug-bar.module.scss';

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
  const pID = playerID !== null ? playerID : '0';

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
        selectedCardData: <code>{G.selectedCardData[pID]?.id}</code>
      </div>

      <div>
        selectedCardIndex: <code>{G.selectedCardIndex[pID]}</code>
      </div>
    </div>
  ) : null;
};
