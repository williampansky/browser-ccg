import {
  artUrl,
  deckStripBackground,
  PLACEHOLDER_ART,
} from '../card-face-model';
import { DECK_DEFAULTS, deckRowVars, parseDeckTune } from '../deck-row-tune';

describe('parseDeckTune', () => {
  it('gives the saved defaults with no params', () => {
    expect(parseDeckTune('')).toEqual(DECK_DEFAULTS);
  });

  it('reads numbers, hex colours and 0 / 1 flags from d_<field> params', () => {
    const t = parseDeckTune(
      '?d_rowH=40&d_nameColour=FF0000&d_showArt=0&d_costShow=1',
    );
    expect(t.rowH).toBe(40);
    expect(t.nameColour).toBe('ff0000');
    expect(t.showArt).toBe(false);
    expect(t.costShow).toBe(true);
  });

  it('ignores a bad value and leaves the default', () => {
    const t = parseDeckTune(
      '?d_rowH=tall&d_nameColour=red&d_showArt=yes&d_unknown=3',
    );
    expect(t).toEqual(DECK_DEFAULTS);
  });
});

describe('deckRowVars', () => {
  it('turns percentages into the plain numbers the CSS multiplies by', () => {
    const v = deckRowVars({
      ...DECK_DEFAULTS,
      artOpacity: 50,
      artZoom: 150,
      goneOpacity: 20,
    });
    expect(v['--dk-art-o']).toBe('0.5');
    expect(v['--dk-zoom']).toBe('1.5');
    expect(v['--dk-gone-o']).toBe('0.2');
  });

  it('switches the strip and the cost gem off with display / opacity switches', () => {
    const v = deckRowVars({
      ...DECK_DEFAULTS,
      showArt: false,
      costShow: false,
    });
    expect(v['--dk-art-on']).toBe('0');
    expect(v['--dk-cost-display']).toBe('none');
  });
});

describe('the -DECK strip as a row background', () => {
  it('names the strip file, then the card art, then the placeholder', () => {
    expect(artUrl('CORE_011', 'DECK')).toBe(
      '/images/sets/SET_CORE/011-DECK.jpg',
    );
    expect(deckStripBackground('CORE_011')).toBe(
      `url(/images/sets/SET_CORE/011-DECK.jpg), url(/images/sets/SET_CORE/011-CARD.jpg), url(${PLACEHOLDER_ART})`,
    );
  });
});
