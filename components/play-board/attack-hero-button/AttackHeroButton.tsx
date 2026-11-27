import { gameConfig } from '../../../app.config';
import { titleIf } from '../accessibility';
import styles from './attack-hero-button.module.scss';

interface Props {
  a11y: boolean;
  onClick: () => void;
}

export const AttackHeroButton = ({ a11y, onClick }: Props) => {
  if (!gameConfig.showAttackHeroButton) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      title={titleIf(
        a11y,
        'Attack the enemy hero with every ready minion, left to right, then end your turn (Shift+Space)',
      )}
    >
      Attack hero
    </button>
  );
};
