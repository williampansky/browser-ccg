import { useState } from 'react';

/**
 * A miniature of the menu built only from the shared `ui-*` pieces, so it looks however the theme in force says. The theme lab shows one
 * per theme (each in its own `data-ui-theme` box); `?ui=` or the pickers change the whole page.
 */
export const ThemeSample = ({ title }: { title: string }) => {
  const [sound, setSound] = useState(true);
  const [timer, setTimer] = useState(false);
  const [opponent, setOpponent] = useState<'Greedy' | 'Random'>('Greedy');
  return (
    <div className="ui-panel" data-ui-sfx style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', width: '22rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{title}</h3>
      <button type="button" className="ui-btn ui-btn--primary" style={{ padding: '0.7rem' }}>
        Resume
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <button type="button" className="ui-btn">New game</button>
        <button type="button" className="ui-btn ui-btn--danger">Concede</button>
        <button type="button" className="ui-btn" disabled style={{ gridColumn: '1 / -1' }}>Disabled</button>
      </div>
      <section className="ui-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.6rem 0.7rem' }}>
        <h4>Settings</h4>
        <button type="button" role="switch" aria-checked={sound} className="ui-toggle" onClick={() => setSound(!sound)}>
          <span>Sound</span>
          <i aria-hidden="true" />
        </button>
        <button type="button" role="switch" aria-checked={timer} className="ui-toggle" onClick={() => setTimer(!timer)}>
          <span>Turn timer</span>
          <i aria-hidden="true" />
        </button>
        <div className="ui-seg" role="radiogroup" aria-label="Opponent">
          <span>Opponent</span>
          {(['Greedy', 'Random'] as const).map((o) => (
            <button key={o} type="button" role="radio" aria-checked={opponent === o} onClick={() => setOpponent(o)}>
              {o}
            </button>
          ))}
        </div>
        <label className="ui-field-row">
          <span>A drop-down</span>
          <select className="ui-field">
            <option>Surprise</option>
            <option>Random starter deck</option>
          </select>
        </label>
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem' }}>
        <a href="#sample">Home</a>
        <a href="#sample">Deck builder</a>
        <a href="#sample">Cards</a>
      </div>
    </div>
  );
};
