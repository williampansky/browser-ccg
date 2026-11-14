import { useState } from 'react';
import { Button, Checkbox, Group, Panel, SegmentedControl, Select, TextInput, Toggle } from '../ui';

/**
 * A miniature of the menu built only from the shared controls (`components/ui/`), so it looks however the theme in force says. The theme lab
 * shows one per theme (each in its own `data-ui-theme` box). Add every new shared control here so a theme can be judged on all of them.
 */
export const ThemeSample = ({ title }: { title: string }) => {
  const [sound, setSound] = useState(true);
  const [timer, setTimer] = useState(false);
  const [entourage, setEntourage] = useState(true);
  const [opponent, setOpponent] = useState(true);
  const [cost, setCost] = useState<number | 'all'>('all');
  return (
    <Panel data-ui-sfx style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', width: '22rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{title}</h3>
      <Button variant="primary" style={{ padding: '0.7rem' }}>
        Resume
      </Button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <Button>New game</Button>
        <Button variant="danger">Concede</Button>
        <Button disabled style={{ gridColumn: '1 / -1' }}>
          Disabled
        </Button>
      </div>
      <Group style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.6rem 0.7rem' }}>
        <h4>Settings</h4>
        <Toggle label="Sound" checked={sound} onChange={setSound} />
        <Toggle label="Turn timer" checked={timer} onChange={setTimer} />
        <SegmentedControl label="Opponent" value={opponent} onChange={setOpponent} options={[{ label: 'Greedy', value: true }, { label: 'Random', value: false }]} />
        <SegmentedControl chips ariaLabel="Mana cost" value={cost} onChange={setCost} options={(['all', 1, 2, 3, 4] as const).map((c) => ({ label: c === 'all' ? 'All' : c, value: c }))} />
        <Checkbox checked={entourage} onChange={setEntourage}>
          Entourage
        </Checkbox>
        <TextInput type="search" placeholder="Search name or text" aria-label="Search" />
        <Select aria-label="A drop-down">
          <option>Surprise</option>
          <option>Random starter deck</option>
        </Select>
      </Group>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem' }}>
        <a href="#sample">Home</a>
        <a href="#sample">Deck builder</a>
        <a href="#sample">Cards</a>
      </div>
    </Panel>
  );
};
