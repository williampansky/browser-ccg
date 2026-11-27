import { useEffect, useState } from 'react';
import { heroes } from '../../engine/heroes';
import {
  heroArtFallback,
  heroArtRef,
  heroImage,
} from '../play-board/hero-images';
import { HeroDetail } from './hero-detail';
import styles from './heroes.module.scss';

const ARCHETYPES: Record<string, string> = {
  MELEE: 'Melee',
  RANGED: 'Ranged',
  HYBRID: 'Hybrid',
};

/**
 * A grid of the playable heroes; click one for its portrait, story and skills.
 */
export const Heroes = () => {
  const list = heroes();
  const [viewing, setViewing] = useState<string | null>(null);
  const open = list.find((h) => h.id === viewing);

  useEffect(() => {
    if (!viewing) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [viewing]);

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {list
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((h) => (
            <button
              key={h.id}
              type="button"
              className={styles.tile}
              onClick={() => setViewing(h.id)}
              aria-label={h.name}
            >
              <img
                ref={heroArtRef}
                alt=""
                className={styles.portrait}
                onError={heroArtFallback}
                src={heroImage(h.id, 'avatar')}
              />
              <span className={styles.name}>{h.name}</span>
              <span className={styles.arch}>
                {ARCHETYPES[h.archetype] ?? h.archetype}
              </span>
            </button>
          ))}
      </div>

      {open && (
        <HeroDetail
          artistName={open?.artistName}
          artistUrl={open?.artistUrl}
          heroArtFallback={heroArtFallback}
          id={open.id}
          imageSrc={heroImage(open.id, 'avatar')}
          lore={open.lore}
          name={open.name}
          onClose={() => setViewing(null)}
          shortDescription={open.shortDescription}
          skill1ImageSrc={heroImage(open.id, `skill-1`)}
          skills={open.skills}
        />
      )}
    </div>
  );
};
