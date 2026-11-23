import { FieldInfo, toUpdate } from '../airtable-card';

const schema: FieldInfo[] = [
  { name: 'name', kind: 'text' },
  { name: 'cost', kind: 'number' },
  { name: 'artStatus', kind: 'select', choices: ['FPO', 'FINAL', 'AI'] },
  { name: 'collectible', kind: 'checkbox' },
  { name: 'mechanics', kind: 'multi', choices: ['AOE'] },
];

describe('toUpdate', () => {
  it('passes valid values through', () => {
    expect(
      toUpdate(schema, {
        name: 'A',
        cost: 3,
        artStatus: 'FINAL',
        collectible: true,
        mechanics: ['AOE'],
      }),
    ).toEqual({
      name: 'A',
      cost: 3,
      artStatus: 'FINAL',
      collectible: true,
      mechanics: ['AOE'],
    });
  });
  it('clears emptied text, number and select cells with null', () => {
    expect(toUpdate(schema, { name: '', cost: null, artStatus: '' })).toEqual({
      name: null,
      cost: null,
      artStatus: null,
    });
  });
  it('rejects unknown or locked fields, a non-number and an unknown option', () => {
    expect(() => toUpdate(schema, { id: 'CORE_001' })).toThrow(
      'not an editable',
    );
    expect(() => toUpdate(schema, { cost: 'x' })).toThrow('must be a number');
    expect(() => toUpdate(schema, { artStatus: 'DONE' })).toThrow(
      'not one of its options',
    );
  });
  it('skips undefined', () => {
    expect(toUpdate(schema, { name: undefined })).toEqual({});
  });
});
