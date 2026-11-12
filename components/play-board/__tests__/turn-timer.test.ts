import { formatClock, secondsLeft } from '../turn-timer';

describe('turn timer helpers', () => {
  it('counts down from the limit and rounds up', () => {
    expect(secondsLeft(1000, 1000, 60)).toBe(60);
    expect(secondsLeft(1000, 1000 + 59_100, 60)).toBe(1);
    expect(secondsLeft(1000, 1000 + 60_000, 60)).toBe(0);
    expect(secondsLeft(1000, 1000 + 90_000, 60)).toBe(0);
  });
  it('a limit that shrinks mid-turn (Cronus arrives) applies to the time already used', () => {
    expect(secondsLeft(0, 20_000, 15)).toBe(0);
    expect(secondsLeft(0, 10_000, 15)).toBe(5);
  });
  it('formats as m:ss', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(9)).toBe('0:09');
    expect(formatClock(0)).toBe('0:00');
  });
});
