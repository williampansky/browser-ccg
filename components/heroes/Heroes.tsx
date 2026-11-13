import { useEffect, useState } from 'react';
import { heroes } from '../../engine/heroes';
import type { HeroInfo } from '../../engine/heroes';
import { heroImage } from '../play-board/hero-images';
import styles from './heroes.module.scss';

const ARCHETYPES: Record<string, string> = { MELEE: 'Melee', RANGED: 'Ranged', HYBRID: 'Hybrid' };
const isPlaceholder = (text: string) => /lorem ipsum/i.test(text);

/** Everything a hero's skill row shows. Cooldown is undefined for an ultimate (once per game). */
export const skillMeta = (cost: number, cooldown?: number) => `${cost} energy · ${cooldown ? `cooldown ${cooldown}` : 'once per game'}`;

/** A grid of the playable heroes; click one for its portrait, story and skills. */
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
        {list.map((h) => (
          <button key={h.id} type="button" className={styles.tile} onClick={() => setViewing(h.id)} aria-label={h.name}>
            <img src={heroImage(h.id, 'avatar')} alt="" className={styles.portrait} />
            <span className={styles.name}>{h.name}</span>
            <span className={styles.arch}>{ARCHETYPES[h.archetype] ?? h.archetype}</span>
          </button>
        ))}
      </div>
      {open && <HeroDetail hero={open} onClose={() => setViewing(null)} />}
    </div>
  );
};

const HeroDetail = ({ hero, onClose }: { hero: HeroInfo; onClose: () => void }) => (
  <div className={styles.backdrop} onClick={onClose}>
    <div className={styles.detail} role="dialog" aria-label={hero.name}>
      <img src={heroImage(hero.id, 'avatar')} alt="" className={styles.bigPortrait} />
      <div className={styles.text}>
        <h2>{hero.name}</h2>
        <p className={styles.meta}>{ARCHETYPES[hero.archetype] ?? hero.archetype} hero</p>
        {hero.shortDescription && !isPlaceholder(hero.shortDescription) && <p className={styles.blurb}>{hero.shortDescription}</p>}
        <h3>Skills</h3>
        <ul className={styles.skills}>
          {hero.skills.map((s) => (
            <li key={s.index} className={s.cooldown === undefined ? styles.ultimate : ''}>
              <img src={heroImage(hero.id, `skill-${s.index + 1}`)} alt="" />
              <div>
                <strong>{s.name}</strong>
                <small>{skillMeta(s.cost, s.cooldown)}</small>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {hero.lore && <div className={styles.lore} dangerouslySetInnerHTML={{ __html: hero.lore }} />}
        {hero.artistName && (
          <p className={styles.credit}>
            Art: {hero.artistUrl ? <a href={hero.artistUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{hero.artistName}</a> : hero.artistName}
          </p>
        )}
        <p className={styles.closeHint}>Click anywhere or press Esc to close</p>
      </div>
    </div>
  </div>
);
