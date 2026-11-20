import { canonicalCardId, findCards } from '../lookup';

const cards = [{ id: 'CORE_122', name: 'Fissure Fiend' }, { id: 'CORE_12', name: 'Twelve' }, { id: 'PRIME_005', name: 'Fiend Hunter' }, { id: 'CORE_001' }];

describe('findCards', () => {
  it('finds nothing for an empty query', () => expect(findCards('  ', cards)).toEqual([]));
  it('prefers an exact id, ignoring case, over longer ids that contain it', () => expect(findCards('core_12', cards).map((c) => c.id)).toEqual(['CORE_12']));
  it('prefers an exact name', () => expect(findCards('fissure fiend', cards).map((c) => c.id)).toEqual(['CORE_122']));
  it('falls back to id or name containing the text', () => expect(findCards('fiend', cards).map((c) => c.id)).toEqual(['CORE_122', 'PRIME_005']));
  it('copes with cards that have no name', () => expect(findCards('001', cards).map((c) => c.id)).toEqual(['CORE_001']));
});

describe('canonicalCardId', () => {
  it('upper-cases the set and keeps an entourage letter lower case', () => {
    expect(canonicalCardId('core_122')).toBe('CORE_122');
    expect(canonicalCardId('CORE_020A')).toBe('CORE_020a');
    expect(canonicalCardId(' prime_097a ')).toBe('PRIME_097a');
  });
  it('upper-cases anything else (an id shape it does not know)', () => expect(canonicalCardId('weird')).toBe('WEIRD'));
});
