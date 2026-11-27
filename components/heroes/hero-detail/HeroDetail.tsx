import { ReactEventHandler } from 'react';
import { HeroSkill } from '../../../engine';
import styles from './hero-detail.module.scss';

const isPlaceholder = (text: string) => /lorem ipsum/i.test(text);

/**
 * Everything a hero's skill row shows. Cooldown is undefined for an ultimate
 * (once per game).
 */
export const skillMeta = (cost: number, cooldown?: number) => {
  return `${cost} energy · ${cooldown ? `cooldown ${cooldown}` : 'once per game'}`;
};

/**
 * An overlay modal showing the hero in detail; including skills, cooldowns, etc.
 */
export const HeroDetail = ({
  artistName,
  artistUrl,
  heroArtFallback,
  id,
  imageSrc,
  lore,
  name,
  onClose,
  shortDescription,
  skill1ImageSrc,
  skills,
}: {
  artistName?: string;
  artistUrl?: string;
  heroArtFallback: ReactEventHandler<HTMLImageElement>;
  id: string;
  imageSrc: string;
  lore: string;
  name: string;
  onClose: () => void;
  shortDescription: string;
  skill1ImageSrc: string;
  skills: HeroSkill[];
}) => (
  <div className={styles.backdrop} onClick={onClose}>
    <div className={styles.detail} role="dialog" aria-label={name}>
      <img
        alt=""
        className={styles.bigPortrait}
        onError={heroArtFallback}
        src={imageSrc}
      />

      <div className={styles.text}>
        <h2>{name}</h2>
        <p className={styles.meta}>{id}</p>

        {shortDescription && !isPlaceholder(shortDescription) && (
          <p className={styles.blurb}>{shortDescription}</p>
        )}

        <h3>Skills</h3>
        <ul className={styles.skills}>
          {skills.map((s) => (
            <li
              key={s.index}
              className={s.cooldown === undefined ? styles.ultimate : ''}
            >
              <img alt="" onError={heroArtFallback} src={skill1ImageSrc} />
              <div>
                <strong>{s.name}</strong>
                <small>{skillMeta(s.cost, s.cooldown)}</small>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {lore && (
          <div
            className={styles.lore}
            dangerouslySetInnerHTML={{ __html: lore }}
          />
        )}

        {artistName && (
          <p className={styles.credit}>
            Art:{' '}
            {artistUrl ? (
              <a
                href={artistUrl}
                onClick={(e) => e.stopPropagation()}
                rel="noreferrer"
                target="_blank"
              >
                {artistName}
              </a>
            ) : (
              artistName
            )}
          </p>
        )}

        <p className={styles.closeHint}>Click anywhere or press Esc to close</p>
      </div>
    </div>
  </div>
);
