import { makeMatch } from '../test-helpers';

describe('Match', () => {
  it('refuses an action from the player whose turn it is not', () => {
    const match = makeMatch();
    const waiting = match.state.activePlayer === '0' ? '1' : '0';

    expect(match.submit(waiting, { type: 'EndTurn' }, 0)).toEqual({
      error: 'NOT_YOUR_TURN',
    });
  });

  it('passes the turn and moves the clock on EndTurn', () => {
    const match = makeMatch();
    const active = match.state.activePlayer;
    const step = match.submit(active, { type: 'EndTurn' }, 5000);

    expect('events' in step).toBe(true);
    expect(match.state.activePlayer).not.toBe(active);
    expect(match.deadline).toBeGreaterThan(5000);
  });

  it('concedes only for the seat that asked, even on the other turn', () => {
    const match = makeMatch();
    const waiting = match.state.activePlayer === '0' ? '1' : '0';
    // Someone claiming to be the other player cannot concede for them
    match.submit(
      waiting,
      { type: 'Concede', player: match.state.activePlayer },
      0,
    );

    expect(match.state.winner).toBe(match.state.activePlayer);
  });

  it('ends the turn by itself once the clock runs out', () => {
    const match = makeMatch();
    const active = match.state.activePlayer;

    expect(match.tick(match.deadline - 1)).toBeNull();
    expect(match.tick(match.deadline)).not.toBeNull();
    expect(match.state.activePlayer).not.toBe(active);
  });

  it('plays a whole game of bots without an illegal move or a stall', () => {
    const match = makeMatch(7, 'greedy');
    // Seat 0 stands in for a person who only ever passes
    let now = 0;
    for (let guard = 0; guard < 2000 && !match.isOver; guard++) {
      now += 1000;
      if (match.state.activePlayer === '0') {
        match.submit('0', { type: 'EndTurn' }, now);
      } else {
        expect(match.botStep(now)).not.toBeNull();
      }
    }

    expect(match.isOver).toBe(true);
  });

  it('gives a bot no move on a human turn', () => {
    const match = makeMatch(3, 'random');
    if (match.state.activePlayer === '0') expect(match.botStep(0)).toBeNull();
  });
});
