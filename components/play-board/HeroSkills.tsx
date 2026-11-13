import styles from './hero-skills.module.scss';

export interface SkillView {
  index: number;
  /** Icon image URL */
  icon: string;
  name: string;
  cost: number;
  text: string;
  /** Ready to use right now (your turn, enough energy, off cooldown) */
  usable: boolean;
  /** Own turns left before it is ready again; 0 when ready */
  cooldownLeft: number;
  /** A one-use ultimate that has been used */
  spent: boolean;
  /** Needs a target (shown as an arrow marker) */
  targeted: boolean;
}

interface HeroSkillsProps {
  heroName: string;
  skills: SkillView[];
  selected: number | null;
  /** Skills can be clicked (it is this player's turn and they are the viewer) */
  interactive: boolean;
  /** Ref callback for each skill button */
  nodeRef: (index: number) => (el: HTMLElement | null) => void;
  onPick: (index: number) => void;
}

/**
 * A hero's three skills as buttons under its bar: cost, name, and what is
 * stopping it (cooldown, used, or not enough energy).
 */
export const HeroSkills = ({
  heroName,
  skills,
  selected,
  interactive,
  nodeRef,
  onPick
}: HeroSkillsProps) => {
  const skillStatus = (s: SkillView) => {
    if (s.spent) {
      return 'Used';
    }

    if (s.cooldownLeft > 0) {
      return `Ready in ${s.cooldownLeft}`;
    }

    return '';
  };

  return (
    <div
      className={styles.skills}
      role="group"
      aria-label={`${heroName} skills`}
    >
      <span className={styles.hero}>{heroName}</span>
      {skills.map(s => {
        const status = skillStatus(s);
        return (
          <button
            key={s.index}
            ref={nodeRef(s.index)}
            type="button"
            disabled={!interactive || !s.usable}
            aria-pressed={selected === s.index}
            aria-label={`${s.name}, cost ${s.cost}${status ? `, ${status}` : ''}: ${s.text}`}
            className={[
              styles.skill,
              s.usable && interactive ? styles.ready : '',
              selected === s.index ? styles.selected : '',
              s.spent ? styles.spent : ''
            ].join(' ')}
            onClick={() => onPick(s.index)}
          >
            <img
              className={styles.icon}
              src={s.icon}
              alt=""
              draggable={false}
            />
            <b className={styles.cost}>{s.cost}</b>
            {s.targeted && <i className={styles.target}>⌖</i>}
            {status && (
              <em className={styles.status}>
                {s.spent ? '✕' : s.cooldownLeft}
              </em>
            )}
            <span className={styles.tip}>
              <strong>{s.name}</strong>
              {status && <em> ({status})</em>}
              <br />
              {s.text}
            </span>
          </button>
        );
      })}
    </div>
  );
};
