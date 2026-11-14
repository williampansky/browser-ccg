import { useEffect, useRef, useState } from 'react';
import { ANIMATED_ICONS, AnimatedIcon, Button, Checkbox, Group, LinkButton, Panel, SegmentedControl, Select, TextInput, Toggle } from '../components/ui';
import { ThemeSample } from '../components/ui-theme/ThemeSample';
import { UiThemePicker } from '../components/ui-theme/UiThemePicker';
import { UI_THEMES } from '../components/ui-theme/ui-themes';

/**
 * PROTOTYPE page (dev only, not linked): every shared interface element (components/ui/) in its states, under the current interface
 * theme, or under all of them side by side ("Compare themes"). `?ui=<id>` sets the theme for the page. Add every new shared control here.
 * "Disable all" shows the disabled look of everything at once.
 */

const Section = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '1.5rem' }}>
    <h3 style={{ margin: '0 0 0.25rem' }}>{title}</h3>
    {note && <p className="ui-dim" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', maxWidth: '38rem' }}>{note}</p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>{children}</div>
  </section>
);

/** Every element, once, under whatever theme its nearest `data-ui-theme` says. */
const Elements = ({ disabled }: { disabled: boolean }) => {
  const [checks, setChecks] = useState({ a: true, b: false });
  const [sw, setSw] = useState({ a: true, b: false });
  const [opp, setOpp] = useState(true);
  const [cost, setCost] = useState<number | 'all'>('all');
  const [size, setSize] = useState('M');
  const [filtered, setFiltered] = useState(false);
  const [rowH, setRowH] = useState<{ row: number; btn: number | null; field: number } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // Live readout of the form row: its height must not change when Clear filters appears.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const h = (el: Element | null) => (el ? Math.round(el.getBoundingClientRect().height * 10) / 10 : null);
    setRowH({ row: h(row) ?? 0, btn: h(row.querySelector('.ui-btn')), field: h(row.querySelector('.ui-field')) ?? 0 });
  }, [filtered]);

  return (
    <div>
      <Section title="Button" note="Default, primary, danger, disabled; and a link that looks like a button.">
        <Button disabled={disabled}>Default</Button>
        <Button variant="primary" disabled={disabled}>Primary</Button>
        <Button variant="danger" disabled={disabled}>Danger</Button>
        <Button disabled>Disabled</Button>
        <LinkButton href="/ui-lab" variant="primary">LinkButton</LinkButton>
        <Button disabled={disabled} style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
          <AnimatedIcon name="regular-plus-sign" size={14} on /> With icon
        </Button>
      </Section>

      <Section title="TextInput and Select">
        <TextInput placeholder="Text" aria-label="Text" disabled={disabled} />
        <TextInput type="search" defaultValue="Search with text (X)" aria-label="Search" disabled={disabled} />
        <TextInput defaultValue="With a value" aria-label="Value" disabled={disabled} />
        <Select aria-label="Select" disabled={disabled}>
          <option>Core + Prime</option>
          <option>Core</option>
        </Select>
        <Select aria-label="Disabled select" disabled>
          <option>Disabled</option>
        </Select>
      </Section>

      <Section title="Checkbox" note="The tick is the animated cross-into-checkmark. Click to watch it draw in.">
        <Checkbox checked={checks.a} onChange={(a) => setChecks({ ...checks, a })} disabled={disabled}>Checked</Checkbox>
        <Checkbox checked={checks.b} onChange={(b) => setChecks({ ...checks, b })} disabled={disabled}>Unchecked</Checkbox>
        <Checkbox checked onChange={() => undefined} disabled>Disabled, checked</Checkbox>
        <Checkbox checked={false} onChange={() => undefined} disabled>Disabled</Checkbox>
      </Section>

      <Section title="Toggle" note="A switch row; the real menu stacks these.">
        <div style={{ width: '16rem' }}>
          <Toggle label="On" checked={sw.a} onChange={(a) => setSw({ ...sw, a })} disabled={disabled} />
          <Toggle label="Off" checked={sw.b} onChange={(b) => setSw({ ...sw, b })} disabled={disabled} />
          <Toggle label="Disabled" checked onChange={() => undefined} disabled />
        </div>
      </Section>

      <Section title="SegmentedControl" note="Labelled (Opponent, Mode) and chips (mana cost, card size). Both are radio groups.">
        <div style={{ width: '20rem' }}>
          <SegmentedControl label="Opponent" disabled={disabled} value={opp} onChange={setOpp} options={[{ label: 'Greedy', value: true }, { label: 'Random', value: false }]} />
        </div>
        <SegmentedControl chips disabled={disabled} ariaLabel="Mana cost" value={cost} onChange={setCost} options={(['all', 0, 1, 2, 3, 4, 5, 6, '7+' as unknown as number] as const).map((c) => ({ label: c === 'all' ? 'All' : c, value: c as number | 'all' }))} />
        <SegmentedControl chips disabled={disabled} ariaLabel="Card size" value={size} onChange={setSize} options={['S', 'M', 'L', 'XL'].map((s) => ({ label: s, value: s }))} />
        <SegmentedControl chips ariaLabel="Disabled" value="a" onChange={() => undefined} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }]} />
      </Section>

      <Section title="Form row (ui-controls)" note="Every control shares one height, and the row keeps it. Toggle the filter: Clear filters appears and nothing may move (watch the readout).">
        <div ref={rowRef} className="ui-controls" style={{ flexBasis: '100%' }}>
          <TextInput type="search" placeholder="Search" aria-label="Row search" defaultValue="clear me" disabled={disabled} />
          <Select aria-label="Row select" disabled={disabled}><option>All types</option><option>Minion</option></Select>
          <SegmentedControl chips ariaLabel="Row cost" value={cost} onChange={setCost} options={(['all', 1, 2] as const).map((c) => ({ label: c === 'all' ? 'All' : c, value: c }))} />
          <Checkbox checked={checks.a} onChange={(a) => setChecks({ ...checks, a })} disabled={disabled}>Entourage</Checkbox>
          {filtered && <Button disabled={disabled} onClick={() => setFiltered(false)}>Clear filters</Button>}
        </div>
        <Checkbox checked={filtered} onChange={setFiltered}>Filtered (shows Clear filters)</Checkbox>
        {rowH && (
          <code style={{ fontSize: '0.8rem' }}>
            row {rowH.row}px · field {rowH.field}px · button {rowH.btn ?? 'none'}
            {rowH.btn !== null && rowH.btn !== rowH.field ? ' ⚠ differs' : ''}
          </code>
        )}
      </Section>

      <Section title="Text, links, panel">
        <div style={{ maxWidth: '24rem' }}>
          <h3 style={{ margin: 0 }}>Heading</h3>
          <p style={{ margin: '0.25rem 0' }}>Body text with <a href="#x">a link</a>.</p>
          <p className="ui-dim" style={{ margin: 0 }}>Secondary text (ui-dim).</p>
        </div>
        <Panel style={{ padding: '1rem', width: '16rem' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Panel</h3>
          <Group style={{ padding: '0.5rem 0.7rem' }}>
            <h4>Group</h4>
            <span>Inside a panel.</span>
          </Group>
        </Panel>
      </Section>
    </div>
  );
};

export default function UiLab() {
  const [compare, setCompare] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem 1rem 6rem' }}>
      <h1 style={{ marginTop: 0 }}>UI lab</h1>
      <div className="ui-controls" style={{ marginBottom: '1.25rem' }}>
        <div style={{ width: '16rem' }}><UiThemePicker blurb={false} /></div>
        <Checkbox checked={compare} onChange={setCompare}>Compare themes</Checkbox>
        <Checkbox checked={disabled} onChange={setDisabled}>Disable all</Checkbox>
      </div>

      {compare ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          {UI_THEMES.map((t) => (
            <div key={t.id} data-ui-theme={t.id} style={{ padding: '1rem', background: 'var(--ui-page-bg)', color: 'var(--ui-page-text)', borderRadius: 8, flex: '1 1 30rem', minWidth: 0 }}>
              <h2 style={{ marginTop: 0 }}>{t.label}</h2>
              <Elements disabled={disabled} />
            </div>
          ))}
        </div>
      ) : (
        <Elements disabled={disabled} />
      )}

      <h2>Menu sample</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        {(compare ? UI_THEMES : [null]).map((t) => (
          <div key={t?.id ?? 'now'} data-ui-theme={t?.id} style={t ? { padding: '1rem', background: 'var(--ui-page-bg)', borderRadius: 8 } : undefined}>
            <ThemeSample title={t?.label ?? 'Menu'} />
          </div>
        ))}
      </div>

      <h2>Animated icons</h2>
      <p style={{ maxWidth: '40rem' }}>They start shown. Click one to play it back (to nothing) and again to play it forward. They take the text colour, so a theme can tint them.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {ANIMATED_ICONS.map((i) => (
          <Button
            key={i.id}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '9rem', fontSize: '0.75rem' }}
            onClick={() => setOn({ ...on, [i.id]: on[i.id] === false })}
          >
            <AnimatedIcon name={i.id} size={56} on={on[i.id] !== false} loop={i.id.startsWith('dots') || i.id.startsWith('parallel-dots')} />
            {i.label} ({i.frames})
          </Button>
        ))}
      </div>
    </div>
  );
}
