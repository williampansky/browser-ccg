import { ThemeSample } from '../components/ui-theme/ThemeSample';
import { UiThemePicker } from '../components/ui-theme/UiThemePicker';
import { UI_THEMES } from '../components/ui-theme/ui-themes';

/**
 * PROTOTYPE page (dev only, not linked): every interface theme side by side, each sample in its own `data-ui-theme` box, plus the picker that
 * switches the whole site (this page's chrome included). Use `?ui=<id>` on any page to try a theme there. See `components/ui-theme/ui-themes.ts`.
 */
export default function ThemeLab() {
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
    </div>
  );
}
