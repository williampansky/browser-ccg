import styles from './ZoneName.module.scss';

interface Props {
  name: string;
  effectText?: string;
}

export const ZoneName = ({ name, effectText }: Props) => {
  return (
    <div className={styles['component']}>
      <div className={styles['zone-name']}>{name}</div>
      {effectText && (
        <div className={styles['zone-power-text']}>{effectText}</div>
      )}
    </div>
  );
};
