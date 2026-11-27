import { useEffect, useState } from 'react';
import { ProfileEditor } from './ProfileEditor';
import {
  DEFAULT_PROFILE,
  foeTheme,
  loadProfile,
  normalizeProfile,
  PlayerProfile,
  saveProfile,
  themeOf,
} from './profile';
import { UiThemePicker } from '../ui-theme/UiThemePicker';
import styles from './profile-page.module.scss';
import { LinkButton, Panel } from '../ui';

/**
 * Edits the player profile. Everything is saved as you type, in this browser
 * (`loadProfile` / `saveProfile`).
 */
export const ProfilePage = () => {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);

  // Only save once the stored profile has been read, or the first render would
  // overwrite it with the default.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  const change = (next: PlayerProfile) => {
    const clean = normalizeProfile(next);
    setProfile(clean);
    if (loaded) saveProfile(clean);
  };

  return (
    <div className={styles.page}>
      <h1>Profile</h1>
      <Panel as="section" aria-label="Profile" className={styles.panel}>
        <ProfileEditor profile={profile} onChange={change} />
        <UiThemePicker blurb={false} />
      </Panel>
      <Panel as="section" aria-label="Preview" className={styles.preview}>
        <span
          className={styles.side}
          style={
            {
              ['--side' as string]: themeOf(profile.theme).color,
            } as React.CSSProperties
          }
        >
          {profile.name}
        </span>
        <span className={styles.vs}>vs</span>
        <span
          className={styles.side}
          style={
            {
              ['--side' as string]: foeTheme(profile.theme).color,
            } as React.CSSProperties
          }
        >
          Opponent
        </span>
      </Panel>
      <p className={styles.note}>
        Saved in this browser only. The name and color show on the hero bar, the
        turn banner and the log in a game.
      </p>
      <LinkButton href="/play" variant="primary">
        Play
      </LinkButton>
    </div>
  );
};
