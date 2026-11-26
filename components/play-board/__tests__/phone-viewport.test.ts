import { boardViewportContent, NORMAL_VIEWPORT } from '../phone-viewport';

describe('boardViewportContent', () => {
  it('scales a landscape phone to a desktop-sized window of its shape', () => {
    const content = boardViewportContent({
      shortSide: 390,
      aspect: 2.5,
      isPortrait: false,
    });
    expect(content).toBe('width=1900, user-scalable=no, viewport-fit=cover');
  });

  it('keeps the board wide enough for the log and deck list', () => {
    const content = boardViewportContent({
      shortSide: 480,
      aspect: 1.33,
      isPortrait: false,
    });
    expect(content).toContain('width=1200');
  });

  it('caps the width on very wide windows', () => {
    const content = boardViewportContent({
      shortSide: 360,
      aspect: 4,
      isPortrait: false,
    });
    expect(content).toContain('width=2400');
  });

  it('leaves portrait phones and tablets on the normal viewport', () => {
    const portrait = { shortSide: 390, aspect: 0.5, isPortrait: true };
    const tablet = { shortSide: 820, aspect: 1.4, isPortrait: false };
    expect(boardViewportContent(portrait)).toBe(NORMAL_VIEWPORT);
    expect(boardViewportContent(tablet)).toBe(NORMAL_VIEWPORT);
  });
});
