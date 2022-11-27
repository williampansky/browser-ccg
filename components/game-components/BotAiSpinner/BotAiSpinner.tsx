import type { PlayerID } from '../../../types';
import { ImSpinner10 } from 'react-icons/im';
import styles from './bot-ai-spinner.module.scss';

interface Props {
  currentPlayer: PlayerID;
  enabled: boolean;
}

export const BotAiSpinner = ({ currentPlayer, enabled }: Props) => {
  return enabled ? (
    <div
      className={styles['component']}
      data-component='BotAiSpinner'
      style={{
        display: currentPlayer === '1' ? 'block' : 'none',
      }}
    >
      <ImSpinner10 className='bccg-spinner' />
    </div>
  ) : null;
};
