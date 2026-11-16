import { cropBox, parseArtName, outputPath, OUTPUTS } from '../crop';

describe('parseArtName', () => {
  it('reads a card id and the set folder from a master file name', () => {
    expect(parseArtName('CORE_117.png')).toEqual({ id: 'CORE_117', set: 'CORE', num: '117' });
    expect(parseArtName('prime_029.JPG')).toEqual({ id: 'PRIME_029', set: 'PRIME', num: '029' });
    expect(parseArtName('PRIME_099a.webp')).toEqual({ id: 'PRIME_099a', set: 'PRIME', num: '099a' });
  });
  it('refuses anything that is not a card master', () => {
    expect(parseArtName('notes.txt')).toBeNull();
    expect(parseArtName('117.png')).toBeNull();
    expect(parseArtName('CORE_117-final.png')).toBeNull();
    expect(parseArtName('TOKEN_001.png')).toBeNull();
  });
});

describe('outputPath', () => {
  it('puts each file where /play reads it (SET_CORE/117-DECK.jpg)', () => {
    expect(outputPath({ id: 'CORE_117', set: 'CORE', num: '117' }, 'deck')).toBe('public/images/sets/SET_CORE/117-DECK.jpg');
    expect(outputPath({ id: 'PRIME_029', set: 'PRIME', num: '029' }, 'card')).toBe('public/images/sets/SET_PRIME/029-CARD.jpg');
    expect(outputPath({ id: 'PRIME_029', set: 'PRIME', num: '029' }, 'minion')).toBe('public/images/sets/SET_PRIME/029-MINION.jpg');
  });
});

describe('cropBox', () => {
  it('takes the whole of a square master for a square output', () => {
    expect(cropBox(1000, 1000, 1)).toEqual({ left: 0, top: 0, width: 1000, height: 1000 });
  });
  it('cuts a full-width strip for the deck (8:1), centred on the focus height', () => {
    const b = cropBox(1000, 1000, 8, { x: 0.5, y: 0.5, zoom: 1 });
    expect(b).toEqual({ left: 0, top: 438, width: 1000, height: 125 });
  });
  it('cuts a full-height portrait for the minion (4:5), centred on the focus width', () => {
    const b = cropBox(1000, 1000, 4 / 5, { x: 0.5, y: 0.5, zoom: 1 });
    expect(b).toEqual({ left: 100, top: 0, width: 800, height: 1000 });
  });
  it('keeps the box inside the picture however far the focus is pushed', () => {
    expect(cropBox(1000, 1000, 8, { x: 0, y: 0, zoom: 1 })).toMatchObject({ left: 0, top: 0 });
    const far = cropBox(1000, 1000, 8, { x: 1, y: 1, zoom: 1 });
    expect(far.top + far.height).toBe(1000);
    const side = cropBox(1000, 1000, 4 / 5, { x: 1, y: 1, zoom: 1 });
    expect(side.left + side.width).toBe(1000);
  });
  it('zooms in by shrinking the box, around the focus', () => {
    const b = cropBox(1000, 1000, 8, { x: 0.5, y: 0.5, zoom: 2 });
    expect(b).toEqual({ left: 250, top: 469, width: 500, height: 63 });
  });
  it('never zooms out past the whole picture', () => {
    expect(cropBox(1000, 1000, 1, { x: 0.5, y: 0.5, zoom: 0.5 })).toEqual({ left: 0, top: 0, width: 1000, height: 1000 });
  });
  it('fits a master that is not square (here wide) by its height', () => {
    expect(cropBox(2000, 1000, 1)).toEqual({ left: 500, top: 0, width: 1000, height: 1000 });
  });
});

describe('OUTPUTS', () => {
  it('match the sizes the game reads', () => {
    expect(OUTPUTS.card).toMatchObject({ width: 1000, height: 1000 });
    expect(OUTPUTS.deck).toMatchObject({ width: 600, height: 75 });
    expect(OUTPUTS.minion).toMatchObject({ width: 640, height: 800 });
  });
});
