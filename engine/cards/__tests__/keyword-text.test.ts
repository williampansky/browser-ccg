import { loadHsCards } from '../load-hs-cards';

const KEYWORDS = [
  'BULWARK',
  'RUSH',
  'BUBBLE',
  'DOUBLE_ATTACK',
  'HIDDEN',
  'NO_ATTACK',
];
const keywordToken = new RegExp(`%(${KEYWORDS.join('|')})%`, 'g');

/** The text with the keyword tokens, tags, punctuation and spaces removed. */
const leftover = (template: string): string =>
  template
    .replace(/<[^>]+>/g, '')
    .replace(keywordToken, '')
    .replace(/[\s,./]+/g, '');

describe('keywords printed on a minion', () => {
  const { cards } = loadHsCards();
  const minions = cards.filter((c) => c.type === 'minion' && c.active);

  it('a minion whose whole text is keywords has every one of them in its mechanics', () => {
    const missing = minions.flatMap((card) => {
      if (leftover(card.textTemplate) !== '') return [];

      const printed = card.textTemplate.match(keywordToken) ?? [];

      return printed
        .map((token) => token.replace(/%/g, ''))
        .filter((keyword) => !card.mechanics.includes(keyword))
        .map((keyword) => `${card.id} prints ${keyword} but does not have it`);
    });

    expect(missing).toEqual([]);
  });
  it('catches the case it exists for: text alone does not give a keyword', () => {
    expect(leftover('<strong>%HIDDEN%</strong>')).toBe('');
    expect(leftover('Draw a card')).not.toBe('');
  });
});
