import { heroArtLayers } from './hero-images';
import styles from './hero-bust.module.scss';
import cx from '../../utils/cx';

/**
 * PROTOTYPE hero display ("option 1"): an arched portrait window that rises
 * above a base plate, so the head stands out from the
 * bar. Health and armor are gems at the plate's corners. Not used by /play yet;
 * see pages/hero-lab.tsx.
 */
export const HeroBust = ({
  heroId,
  name,
  health,
  maxHealth = 30,
  armor = 0,
  team = 'green',
  active = false,
  turnTag = '',
  width = 230,
}: {
  heroId: string;
  name: string;
  health: number;
  maxHealth?: number;
  armor?: number;
  team?: 'green' | 'red';
  active?: boolean;
  turnTag?: string;
  width?: number;
}) => {
  const tone =
    health <= maxHealth / 3
      ? styles.low
      : health < maxHealth
        ? styles.hurt
        : '';
  return (
    <div
      className={cx(
        styles.bust,
        team === 'red' ? styles.red : '',
        active ? styles.active : '',
      )}
      style={{ ['--w' as string]: `${width}px` }}
      aria-label={`${name}: ${health} health, ${armor} armor`}
    >
      <div
        className={styles.arch}
        style={{ backgroundImage: heroArtLayers(heroId, 'avatar') }}
      />
      <div className={styles.plate}>
        <span
          className={cx(styles.name, name.length > 8 ? styles.longName : '')}
        >
          {name}
        </span>
        {turnTag && <span className={styles.turn}>{turnTag}</span>}
      </div>
      <span className={cx(styles.gem, styles.hp, tone)}>{health}</span>
      {armor > 0 && (
        <span className={cx(styles.gem, styles.armor)}>{armor}</span>
      )}
    </div>
  );
};
