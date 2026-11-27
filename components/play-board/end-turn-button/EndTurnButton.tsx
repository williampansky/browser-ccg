import { titleIf } from "../accessibility";
import styles from './end-turn-button.module.scss';

export const EndTurnButton = ({
  a11y,
  disabled,
  myTurn,
  onClick,
}: {
  a11y: boolean;
  disabled: boolean;
  myTurn: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className={styles.button}
      disabled={disabled}
      onClick={onClick}
      title={titleIf(a11y, 'Space')}
      type="button"
    >
      {myTurn ? 'End turn' : 'Their turn'}
    </button>
  );
};
