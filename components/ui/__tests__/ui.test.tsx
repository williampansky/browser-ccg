import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Button, Checkbox, SegmentedControl, Select, TextInput, Toggle } from '..';

let root: HTMLDivElement;
beforeEach(() => {
  root = document.createElement('div');
  document.body.appendChild(root);
});
afterEach(() => {
  ReactDOM.unmountComponentAtNode(root);
  root.remove();
});
const render = (el: React.ReactElement) => act(() => void ReactDOM.render(el, root));
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));

describe('shared interface controls', () => {
  it('Button defaults to type=button and carries the variant class', () => {
    render(<Button variant="danger">Go</Button>);
    const b = root.querySelector('button')!;
    expect(b.type).toBe('button');
    expect(b.className).toBe('ui-btn ui-btn--danger');
  });

  it('Select and TextInput use the shared field class and keep their own', () => {
    render(
      <>
        <Select aria-label="s" className="x" />
        <TextInput aria-label="t" type="search" />
      </>
    );
    expect(root.querySelector('select')!.className).toBe('ui-field x');
    expect(root.querySelector('input')!.className).toBe('ui-field');
    expect(root.querySelector('input')!.type).toBe('search');
  });

  it('Checkbox reports the new value', () => {
    const seen: boolean[] = [];
    render(<Checkbox checked={false} onChange={(c) => seen.push(c)}>Entourage</Checkbox>);
    click(root.querySelector('input')!);
    expect(seen).toEqual([true]);
    expect(root.textContent).toBe('Entourage');
  });

  it('Toggle is a switch whose state is aria-checked and flips on click', () => {
    const seen: boolean[] = [];
    render(<Toggle label="Sound" checked onChange={(on) => seen.push(on)} />);
    const t = root.querySelector('[role=switch]')!;
    expect(t.getAttribute('aria-checked')).toBe('true');
    click(t);
    expect(seen).toEqual([false]);
  });

  it('SegmentedControl marks the chosen option, picks by value (not string) and skips disabled ones', () => {
    const seen: unknown[] = [];
    render(
      <SegmentedControl label="Opponent" value={true} onChange={(v) => seen.push(v)} options={[{ label: 'Greedy', value: true }, { label: 'Random', value: false }, { label: 'Off', value: true, disabled: true }]} />
    );
    const radios = Array.from(root.querySelectorAll('[role=radio]'));
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'true']);
    click(radios[1]);
    click(radios[2]); // disabled: no event
    expect(seen).toEqual([false]);
    expect(root.querySelector('[role=radiogroup]')!.getAttribute('aria-label')).toBe('Opponent');
  });
});

describe('themed screens use the shared controls', () => {
  // Raw form controls in these files would skip the interface theme; build them from components/ui instead.
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const files = ['collection/Collection.tsx', 'deck-builder/DeckBuilder.tsx', 'player-profile/ProfileEditor.tsx', 'ui-theme/UiThemePicker.tsx', 'ui-theme/ThemeSample.tsx'];
  it.each(files)('%s has no raw <select>, <input> or <textarea>', (f) => {
    const src = fs.readFileSync(path.join(__dirname, '../..', f), 'utf8');
    expect(src).not.toMatch(/<(select|input|textarea)\b/);
  });
});
