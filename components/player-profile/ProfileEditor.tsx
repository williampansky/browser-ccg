import React, { useEffect, useRef, useState } from 'react';
import {
  cleanName,
  MAX_NAME_LENGTH,
  normalizeProfile,
  PlayerProfile,
  THEMES,
} from './profile';
import { Field, TextInput } from '../ui';
import styles from './profile-editor.module.scss';
import cx from '../../utils/cx';

interface Props {
  profile: PlayerProfile;
  /** Called with a valid profile on every change */
  onChange: (next: PlayerProfile) => void;
}

/**
 * The player's name and colour theme. The text box keeps what you type; the
 * saved name is the cleaned-up version of it.
 */
export const ProfileEditor = ({ profile, onChange }: Props) => {
  const [draft, setDraft] = useState(profile.name);
  const isEditing = useRef(false);

  // If the saved profile changes underneath
  // (loaded after the first render), show it.
  useEffect(() => {
    if (!isEditing.current) setDraft(profile.name);
  }, [profile.name]);

  return (
    <div className={styles.profile} aria-label="Your profile">
      <Field label="Your name">
        <TextInput
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
          id="profileName"
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => {
            isEditing.current = true;
            setDraft(e.target.value);
            onChange(normalizeProfile({ ...profile, name: e.target.value }));
          }}
          onBlur={() => {
            isEditing.current = false;
            setDraft(cleanName(draft));
          }}
          onFocus={() => {
            isEditing.current = true;
          }}
          onKeyDown={(e) => e.stopPropagation()}
          spellCheck={false}
          value={draft}
        />
      </Field>
      <Field as="div" label="Your color" labelId="profile-theme-label">
        <div
          className={styles.swatches}
          role="radiogroup"
          aria-labelledby="profile-theme-label"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={profile.theme === t.id}
              aria-label={t.label}
              title={t.label}
              className={cx(
                styles.swatch,
                profile.theme === t.id ? styles.on : '',
              )}
              style={{ ['--swatch' as string]: t.color } as React.CSSProperties}
              onClick={() =>
                onChange(normalizeProfile({ ...profile, theme: t.id }))
              }
            />
          ))}
        </div>
      </Field>
    </div>
  );
};
