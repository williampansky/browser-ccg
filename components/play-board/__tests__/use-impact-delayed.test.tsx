import { createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { setImpactMs } from '../motion';
import { useImpactDelayed } from '../use-impact-delayed';

const Probe = ({ value }: { value: number }) =>
  createElement('b', null, String(useImpactDelayed(value)));

describe('useImpactDelayed', () => {
  const box = document.createElement('div');
  const show = (value: number) =>
    act(() => {
      render(createElement(Probe, { value }), box);
    });

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    unmountComponentAtNode(box);
    jest.useRealTimers();
    setImpactMs(0);
  });

  it('keeps the old number until the hit lands, then shows the new one', () => {
    setImpactMs(1000);
    show(10);
    show(4);
    expect(box.textContent).toBe('10');
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(box.textContent).toBe('10');
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(box.textContent).toBe('4');
  });

  it('shows a rise at once', () => {
    setImpactMs(1000);
    show(4);
    show(9);
    expect(box.textContent).toBe('9');
  });
});
