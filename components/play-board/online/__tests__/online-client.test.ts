import { OnlineClient } from '../online-client';
import type { ClientStatus } from '../online-client';

class FakeSocket {
  static instances: FakeSocket[] = [];
  static OPEN = 1;
  readyState = 1;
  onclose: ((event: { reason: string }) => void) | null = null;
  onmessage = null;
  onopen: (() => void) | null = null;
  constructor() {
    FakeSocket.instances.push(this);
  }
  close(): void {}
  send(): void {}
}

describe('OnlineClient', () => {
  const statuses: ClientStatus[] = [];
  const makeClient = (): OnlineClient =>
    new OnlineClient({
      onMessage: () => undefined,
      onStatus: (status) => statuses.push(status),
    });

  beforeEach(() => {
    jest.useFakeTimers();
    FakeSocket.instances = [];
    statuses.length = 0;
    (global as unknown as { WebSocket: unknown }).WebSocket = FakeSocket;
  });
  afterEach(() => jest.useRealTimers());

  it('reconnects by itself after an ordinary drop', () => {
    makeClient().start();
    FakeSocket.instances[0].onclose?.({ reason: '' });
    jest.advanceTimersByTime(10000);

    expect(statuses).toEqual(['connecting', 'closed', 'connecting']);
    expect(FakeSocket.instances).toHaveLength(2);
  });

  it('stays closed when another window took the session, until taken back', () => {
    const client = makeClient();
    client.start();
    FakeSocket.instances[0].onclose?.({ reason: 'replaced' });
    jest.advanceTimersByTime(60000);

    expect(statuses).toEqual(['connecting', 'replaced']);
    expect(FakeSocket.instances).toHaveLength(1);

    client.takeOver();
    expect(FakeSocket.instances).toHaveLength(2);
  });
});
