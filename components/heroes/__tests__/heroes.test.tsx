import { act } from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';
import { heroes } from '../../../engine/heroes';
import { Heroes } from '../Heroes';

let root: HTMLDivElement;
beforeEach(() => {
  root = document.createElement('div');
  document.body.appendChild(root);
  act(() => {
    render(<Heroes />, root);
  });
});
afterEach(() => {
  unmountComponentAtNode(root);
  root.remove();
});

const tile = (name: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);

describe('Heroes page', () => {
  it('shows a tile per playable hero', () => {
    for (const h of heroes()) expect(tile(h.name)).not.toBeNull();
  });

  it('opens an overlay with the three skills, and Escape closes it', () => {
    const hero = heroes()[0];
    act(() => {
      tile(hero.name)!.click();
    });
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    for (const s of hero.skills) expect(root.textContent).toContain(s.name);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });
});
