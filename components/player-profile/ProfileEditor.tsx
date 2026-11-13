import React, { useEffect, useState } from 'react';
import { cleanName, MAX_NAME_LENGTH, normalizeProfile, PlayerProfile, THEMES } from './profile';
import styles from './profile-editor.module.scss';

interface Props {
  profile: PlayerProfile;
  /** Called with a valid profile on every change */
  onChange: (next: PlayerProfile) => void;
}

/** The player's name and colour theme. The text box keeps what you type; the saved name is the cleaned-up version of it. */
export const ProfileEditor = ({ profile, onChange }: Props) => {
  const [draft, setDraft] = useState(profile.name);
  // If the saved profile changes underneath (loaded after the first render), show it.
  useEffect(() => setDraft(profile.name), [profile.name]);
  return (
    <section className={styles.editor} aria-label="Your profile">
      <label className={styles.field}>
        <span>Your name</span>
        <input
          type="text"
          value={draft}
          maxLength={MAX_NAME_LENGTH}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(normalizeProfile({ ...profile, name: e.target.value }));
          }}
          onBlur={() => setDraft(cleanName(draft))}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </label>
      <div className={styles.field}>
        <span id="profile-theme-label">Your color</span>
        <div className={styles.swatches} role="radiogroup" aria-labelledby="profile-theme-label">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={profile.theme === t.id}
              aria-label={t.label}
              title={t.label}
              className={[styles.swatch, profile.theme === t.id ? styles.on : ''].join(' ')}
              style={{ ['--swatch' as string]: t.color } as React.CSSProperties}
              onClick={() => onChange(normalizeProfile({ ...profile, theme: t.id }))}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
