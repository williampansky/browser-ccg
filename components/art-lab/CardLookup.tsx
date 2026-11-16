import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import core from '../../data/core.json';
import prime from '../../data/prime.json';
import entourage from '../../data/entourage.json';
import game from '../../data/game.json';
import { Button, TextInput } from '../ui';
import { LookupCard, findCards } from './lookup';

const ALL: LookupCard[] = [...core, ...prime, ...entourage, ...game].filter((c: LookupCard) => c.id);

/** Type a card id or name (from the local data/*.json), pick it, and the button adds `?id=` to the address. */
export const CardLookup = ({ current }: { current?: string }) => {
  const router = useRouter();
  const [q, setQ] = useState('');
  const matches = useMemo(() => findCards(q, ALL), [q]);
  const open = (id: string) => router.push({ pathname: '/art-lab', query: { id } });
  return (
    <div style={{ marginBottom: 16 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (matches.length === 1) open(matches[0].id);
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
        className="ui-controls"
      >
        <TextInput aria-label="Card id or name" list="art-lab-cards" placeholder={current ? `Another card (now ${current})` : 'Card id or name'} value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 300 }} />
        <datalist id="art-lab-cards">
          {ALL.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </datalist>
        <Button variant="primary" type="submit" disabled={matches.length !== 1}>Open ?id={matches.length === 1 ? matches[0].id : '...'}</Button>
      </form>
      {matches.length > 1 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {matches.map((c) => (
            <li key={c.id}><Button onClick={() => open(c.id)}>{c.id} · {c.name ?? '(unnamed)'}</Button></li>
          ))}
        </ul>
      )}
      {q.trim() && !matches.length && <p style={{ opacity: 0.7 }}>No card in data/ matches &quot;{q}&quot;.</p>}
    </div>
  );
};
