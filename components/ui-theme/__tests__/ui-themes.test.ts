import fs from 'fs';
import path from 'path';
import { DEFAULT_UI_THEME, NO_FLASH_SCRIPT, themeFromSearch, uiThemeOf, UI_THEMES } from '../ui-themes';
import { uiSoundUrl } from '../ui-sfx';

const root = path.join(__dirname, '../../..');

describe('interface themes', () => {
  it('has unique ids and the first is the default', () => {
    expect(new Set(UI_THEMES.map((t) => t.id)).size).toBe(UI_THEMES.length);
    expect(DEFAULT_UI_THEME).toBe(UI_THEMES[0].id);
  });

  it('falls back to the default for an unknown or missing id', () => {
    expect(uiThemeOf('nope').id).toBe(DEFAULT_UI_THEME);
    expect(uiThemeOf(null).id).toBe(DEFAULT_UI_THEME);
    expect(uiThemeOf('emberhold').id).toBe('emberhold');
  });

  it('reads ?ui= only for a known theme', () => {
    expect(themeFromSearch('?ui=frostforged')).toBe('frostforged');
    expect(themeFromSearch('?ui=bogus')).toBeUndefined();
    expect(themeFromSearch('')).toBeUndefined();
  });

  it('every theme has a SCSS block defining it', () => {
    const scss = fs.readFileSync(path.join(root, 'styles/themes/_themes.scss'), 'utf8');
    for (const t of UI_THEMES) expect(scss).toContain(`[data-ui-theme='${t.id}']`);
  });

  it('every art folder and sound a theme points at exists', () => {
    for (const t of UI_THEMES.filter((x) => x.id !== 'classic')) {
      expect(fs.existsSync(path.join(root, 'public/images/ui', t.id, 'panel_ornate.png'))).toBe(true);
    }
    for (const t of UI_THEMES.filter((x) => x.sfx)) {
      expect(fs.existsSync(path.join(root, 'public', uiSoundUrl(t.sfx as string, 'click')))).toBe(true);
    }
  });

  it('the no-flash script picks the same theme as the app would', () => {
    const run = (search: string, stored: string | null) => {
      const doc = { documentElement: { attr: '', setAttribute(_: string, v: string) { this.attr = v; } } };
      const store: Record<string, string> = stored ? { 'ccg.uiTheme.v1': stored } : {};
      new Function('location', 'localStorage', 'document', NO_FLASH_SCRIPT)(
        { search },
        { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } },
        doc
      );
      return doc.documentElement.attr;
    };
    expect(run('', null)).toBe('classic');
    expect(run('', 'frostforged')).toBe('frostforged');
    expect(run('', 'bogus')).toBe('classic');
    expect(run('?ui=emberhold', 'frostforged')).toBe('emberhold');
    expect(run('?ui=bogus', 'frostforged')).toBe('frostforged');
  });
});
