import { heroImage } from './hero-images';
import styles from './hero-bust.module.scss';

/**
 * PROTOTYPE hero display ("option 1"): an arched portrait window that rises above a base plate, so the head stands out from the
 * bar. Health and armor are gems at the plate's corners. Not used by /play yet; see pages/hero-lab.tsx.
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
  const tone = health <= maxHealth / 3 ? styles.low : health < maxHealth ? styles.hurt : '';
  return (
    <div
      className={[styles.bust, team === 'red' ? styles.red : '', active ? styles.active : ''].join(' ')}
      style={{ ['--w' as string]: `${width}px` }}
      aria-label={`${name}: ${health} health, ${armor} armor`}
    >
      <div className={styles.arch} style={{ backgroundImage: `url(${heroImage(heroId, 'avatar')})` }} />
      <div className={styles.plate}>
        <span className={[styles.name, name.length > 8 ? styles.longName : ''].join(' ')}>{name}</span>
        {turnTag && <span className={styles.turn}>{turnTag}</span>}
      </div>
      <span className={[styles.gem, styles.hp, tone].join(' ')}>{health}</span>
      {armor > 0 && <span className={[styles.gem, styles.armor].join(' ')}>{armor}</span>}
    </div>
  );
};
