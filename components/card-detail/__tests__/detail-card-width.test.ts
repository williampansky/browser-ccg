import { detailCardWidth } from '../detail-card-width';
import { FACE_HEIGHT, FACE_WIDTH } from '../../play-board/card-face-model';

describe('detailCardWidth', () => {
  it('fills the window height on a wide screen, but never gets huge', () => {
    const w = detailCardWidth(1600, 900);
    expect(w * (FACE_HEIGHT / FACE_WIDTH)).toBeGreaterThan(900 - 200);
    expect(w * (FACE_HEIGHT / FACE_WIDTH)).toBeLessThanOrEqual(900);
    expect(detailCardWidth(3000, 2000)).toBe(560);
  });

  it('is limited by the height on a short window', () => {
    expect(detailCardWidth(1600, 600)).toBeLessThan(detailCardWidth(1600, 900));
  });

  it('is limited by the width on a narrow screen (the text goes below), and has a floor', () => {
    expect(detailCardWidth(400, 1000)).toBe(400 - 104);
    expect(detailCardWidth(200, 300)).toBe(240);
  });

  it('leaves room for the text column beside the card on a mid-width screen', () => {
    expect(detailCardWidth(800, 2000)).toBe(800 - 104 - 340);
  });
});
