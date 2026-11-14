import { useUiTheme } from './useUiTheme';
import { UI_THEMES, uiThemeOf } from './ui-themes';

/** A drop-down of the interface themes with the current one's blurb under it. Used on /profile and in the /play menu. */
export const UiThemePicker = ({ blurb = true }: { blurb?: boolean }) => {
  const [id, setId] = useUiTheme();
  return (
    <label className="ui-field-row">
      <span>Interface theme</span>
      <select className="ui-field" value={id} onChange={(e) => setId(e.target.value)} aria-label="Interface theme">
        {UI_THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      {blurb && <small className="ui-dim">{uiThemeOf(id).blurb}</small>}
    </label>
  );
};
