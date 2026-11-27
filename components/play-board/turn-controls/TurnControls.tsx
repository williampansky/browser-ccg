import styles from './turn-controls.module.scss';
import { EndTurnButton } from '../end-turn-button';
import { AttackHeroButton } from '../attack-hero-button';

interface Props {
  a11y: boolean;
  canNukeHero: boolean;
  endTurnDisabled: boolean;
  myTurn: boolean;
  onAttackHeroClick: () => void;
  onEndTurnClick: () => void;
}

export const TurnControls = ({
  a11y,
  canNukeHero,
  endTurnDisabled,
  myTurn,
  onAttackHeroClick,
  onEndTurnClick,
}: Props) => {
  return (
    <div className={styles.buttonGroup}>
      <div>
        <EndTurnButton
          a11y={a11y}
          disabled={endTurnDisabled}
          myTurn={myTurn}
          onClick={onEndTurnClick}
        />
      </div>

      <div
        className={`${styles.slideWrapper} ${canNukeHero ? styles.open : ''}`}
      >
        <div className={styles.slideInner}>
          <AttackHeroButton a11y={a11y} onClick={onAttackHeroClick} />
        </div>
      </div>
    </div>
  );
};
