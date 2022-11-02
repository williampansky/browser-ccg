import type { ReactElement } from 'react';
import styles from './zone-name.module.scss';

interface ZoneNameComponent {
  name: string;
  effectText?: string;
}

export const ZoneName = ({
  name,
  effectText,
}: ZoneNameComponent): ReactElement => {
  return (
    <div className={styles['component']}>
      <div className={styles['zone-name']}>{name}</div>
      {effectText && (
        <div className={styles['zone-power-text']}>{effectText}</div>
      )}
    </div>
  );
};
