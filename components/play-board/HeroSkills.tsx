import styles from './hero-skills.module.scss';

export interface SkillView {
  index: number;
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
  nodeRef: (index: number) => (el: HTMLElement | null) => void;
  onPick: (index: number) => void;
}

/** A hero's three skills as buttons under its bar: cost, name, and what is stopping it (cooldown, used, or not enough energy). */
export const HeroSkills = ({ heroName, skills, selected, interactive, nodeRef, onPick }: HeroSkillsProps) => (
  <div className={styles.skills} role="group" aria-label={`${heroName} skills`}>
    <span className={styles.hero}>{heroName}</span>
    {skills.map((s) => {
      const status = s.spent ? 'Used' : s.cooldownLeft > 0 ? `Ready in ${s.cooldownLeft}` : '';
      return (
        <button
          key={s.index}
          ref={nodeRef(s.index)}
          type="button"
          disabled={!interactive || !s.usable}
          aria-pressed={selected === s.index}
          className={[styles.skill, s.usable && interactive ? styles.ready : '', selected === s.index ? styles.selected : '', s.spent ? styles.spent : ''].join(' ')}
          onClick={() => onPick(s.index)}
        >
          <b className={styles.cost}>{s.cost}</b>
          <span className={styles.name}>
            {s.name}
            {s.targeted ? ' ⌖' : ''}
          </span>
          {status && <em className={styles.status}>{status}</em>}
          <span className={styles.tip}>{s.text}</span>
        </button>
      );
    })}
  </div>
);
