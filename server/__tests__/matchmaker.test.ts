import { createSeededRng } from '../../engine';
import { Matchmaker } from '../matchmaker';

const config = { waitMs: 30000, greedyShare: 0.9 };

describe('Matchmaker', () => {
  it('pairs two people at once, oldest first', () => {
    const queue = new Matchmaker(createSeededRng(1), config);
    queue.add('a', 0);
    queue.add('b', 10);
    queue.add('c', 20);
    const [pairing] = queue.pair(20);

    expect(pairing).toMatchObject({
      kind: 'humans',
      first: { id: 'a' },
      second: { id: 'b' },
    });
    expect(queue.size).toBe(1);
  });

  it('holds a lone player until the wait is over, then gives a bot', () => {
    const queue = new Matchmaker(createSeededRng(1), config);
    queue.add('a', 0);

    expect(queue.pair(29999)).toEqual([]);
    expect(queue.pair(30000)).toMatchObject([
      { kind: 'bot', ticket: { id: 'a' } },
    ]);
    expect(queue.size).toBe(0);
  });

  it('is not queued twice and can be left', () => {
    const queue = new Matchmaker(createSeededRng(1), config);
    queue.add('a', 0);
    queue.add('a', 5);
    expect(queue.size).toBe(1);
    queue.remove('a');
    expect(queue.pair(99999)).toEqual([]);
  });

  it('picks the greedy bot about 90% of the time', () => {
    const queue = new Matchmaker(createSeededRng(42), config);
    const games = 2000;
    let greedy = 0;
    for (let i = 0; i < games; i++) {
      queue.add(`p${i}`, 0);
      const [pairing] = queue.pair(30000);
      if (pairing.kind === 'bot' && pairing.bot === 'greedy') greedy++;
    }

    expect(greedy / games).toBeGreaterThan(0.87);
    expect(greedy / games).toBeLessThan(0.93);
  });
});
