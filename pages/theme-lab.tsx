import { useState } from 'react';
import { ANIMATED_ICONS, AnimatedIcon } from '../components/ui';
import { ThemeSample } from '../components/ui-theme/ThemeSample';
import { UiThemePicker } from '../components/ui-theme/UiThemePicker';
import { UI_THEMES } from '../components/ui-theme/ui-themes';

/**
 * PROTOTYPE page (dev only, not linked): every interface theme side by side, each sample in its own `data-ui-theme` box, plus the picker that
 * switches the whole site (this page's chrome included). Use `?ui=<id>` on any page to try a theme there. See `components/ui-theme/ui-themes.ts`.
 */
export default function ThemeLab() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem 1rem 6rem' }}>
      <h1 style={{ marginTop: 0 }}>Theme lab</h1>
      <div style={{ maxWidth: '24rem', marginBottom: '1rem' }}>
        <UiThemePicker />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        {UI_THEMES.map((t) => (
          <div key={t.id} data-ui-theme={t.id} style={{ padding: '1rem', background: 'var(--ui-page-bg)', color: 'var(--ui-page-text)', borderRadius: 8 }}>
            <ThemeSample title={t.label} />
            <p style={{ maxWidth: '22rem' }}>{t.blurb}</p>
          </div>
        ))}
      </div>
      <h2>Animated icons</h2>
      <p style={{ maxWidth: '40rem' }}>Click one to play it forward, click again to play it back. They take the text colour, so a theme can tint them.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {ANIMATED_ICONS.map((i) => (
          <button
            key={i.id}
            type="button"
            className="ui-btn"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '9rem', fontSize: '0.75rem' }}
            onClick={() => setOn({ ...on, [i.id]: !on[i.id] })}
          >
            <AnimatedIcon name={i.id} size={56} on={!!on[i.id]} loop={i.id.startsWith('dots') || i.id.startsWith('parallel-dots')} />
            {i.label} ({i.frames})
          </button>
        ))}
      </div>
    </div>
  );
}
