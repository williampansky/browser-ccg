import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadHsCards, MAX_DECK_SIZE, playablePool, primePool } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import { addCard, blankDeck, countOf, curve, removeCard, SavedDeck, whyNotAdd } from './deck-model';
import { loadDecks, saveDecks } from './deck-storage';
import styles from './deck-builder.module.scss';

const { cards, byId } = loadHsCards();
const corePool = playablePool(cards);
const prime = primePool(cards);
const pool = [...corePool, ...prime].sort((a, b) => a.cost - b.cost || (a.name ?? '').localeCompare(b.name ?? ''));
const TYPES = ['all', 'minion', 'spell', 'weapon', 'item'] as const;
const SETS = ['core', 'prime', 'both'] as const;
const COSTS = ['all', '0', '1', '2', '3', '4', '5', '6', '7+'] as const;

export const DeckBuilder = () => {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [type, setType] = useState<typeof TYPES[number]>('all');
  const [set, setSet] = useState<typeof SETS[number]>('core');
  const [cost, setCost] = useState<typeof COSTS[number]>('all');
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const saved = loadDecks(byId);
    const list = saved.length ? saved : [blankDeck('My deck')];
    setDecks(list);
    setCurrentId(list[0].id);
    setLoaded(true);
  }, []);
  // Every change is saved as it happens (but not before the first load, which would wipe the saved decks).
  useEffect(() => {
    if (loaded) saveDecks(decks);
  }, [decks, loaded]);

  const deck = decks.find((d) => d.id === currentId) ?? decks[0];
  const update = (next: SavedDeck) => setDecks((all) => all.map((d) => (d.id === next.id ? next : d)));

  const shown = useMemo(
    () =>
      pool.filter((c) => {
        if (set !== 'both' && c.source !== set) return false;
        if (type !== 'all' && c.type !== type) return false;
        if (cost !== 'all' && (cost === '7+' ? c.cost < 7 : c.cost !== Number(cost))) return false;
        const q = search.trim().toLowerCase();
        return !q || (c.name ?? '').toLowerCase().includes(q) || c.text.toLowerCase().includes(q);
      }),
    [set, type, cost, search],
  );

  if (!deck) return null;

  const add = (id: string) => {
    const card = byId.get(id)!;
    const why = whyNotAdd(deck, card);
    setNote(why ?? '');
    if (!why) update(addCard(deck, card, byId));
  };
  const rows = Array.from(new Set(deck.cards));
  const bars = curve(deck, byId);
  const tallest = Math.max(1, ...bars);
  const full = deck.cards.length >= MAX_DECK_SIZE;

  const newDeck = () => {
    const d = blankDeck(`Deck ${decks.length + 1}`);
    setDecks([...decks, d]);
    setCurrentId(d.id);
    setNote('');
  };
  const deleteDeck = () => {
    if (!window.confirm(`Delete "${deck.name}"?`)) return;
    const rest = decks.filter((d) => d.id !== deck.id);
    const list = rest.length ? rest : [blankDeck('My deck')];
    setDecks(list);
    setCurrentId(list[0].id);
  };

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <div className={styles.filters}>
          <input type="search" placeholder="Search name or text" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={set} onChange={(e) => setSet(e.target.value as typeof set)} aria-label="Card set">
            <option value="core">Core ({corePool.length})</option>
            <option value="prime">Prime ({prime.length}, more coming)</option>
            <option value="both">Core + Prime</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Card type">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
          </select>
          <div className={styles.costs} role="group" aria-label="Mana cost">
            {COSTS.map((c) => (
              <button key={c} type="button" className={c === cost ? styles.on : ''} onClick={() => setCost(c)}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
          <span className={styles.count}>{shown.length} cards</span>
        </div>
        <div className={styles.grid}>
          {shown.map((c) => {
            const n = countOf(deck, c.id);
            const blocked = !!whyNotAdd(deck, c);
            return (
              <button
                key={c.id}
                type="button"
                className={[styles.cardButton, blocked ? styles.blocked : ''].join(' ')}
                onClick={() => add(c.id)}
                aria-label={`Add ${c.name} (${n} in deck)`}
              >
                <CardFace card={c} width={150} />
                {n > 0 && <span className={styles.copies}>×{n}</span>}
              </button>
            );
          })}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      <aside className={styles.deck}>
        <div className={styles.deckHead}>
          <select value={deck.id} onChange={(e) => { setCurrentId(e.target.value); setNote(''); }} aria-label="Saved decks">
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || 'Unnamed'} ({d.cards.length})
              </option>
            ))}
          </select>
          <button type="button" onClick={newDeck}>New</button>
          <button type="button" onClick={deleteDeck}>Delete</button>
        </div>
        <input className={styles.name} value={deck.name} maxLength={30} onChange={(e) => update({ ...deck, name: e.target.value })} aria-label="Deck name" />
        <div className={[styles.size, full ? styles.full : ''].join(' ')}>
          {deck.cards.length} / {MAX_DECK_SIZE} cards
        </div>
        <div className={styles.curve} aria-label="Mana curve">
          {bars.map((n, i) => (
            <div key={i} className={styles.bar}>
              <span style={{ height: `${(n / tallest) * 100}%` }} title={`${n} cards`}>{n || ''}</span>
              <small>{i === 7 ? '7+' : i}</small>
            </div>
          ))}
        </div>
        {note && <p className={styles.note}>{note}</p>}
        <ul className={styles.list}>
          {rows.map((id) => {
            const c = byId.get(id)!;
            return (
              <li key={id}>
                <button type="button" onClick={() => { update(removeCard(deck, id)); setNote(''); }} title="Remove one copy">
                  <span className={styles.rowCost}>{c.cost}</span>
                  <span className={styles.rowName}>{c.name}</span>
                  <span className={styles.rowCount}>×{countOf(deck, id)}</span>
                </button>
              </li>
            );
          })}
          {rows.length === 0 && <li className={styles.empty}>Click a card to add it. Click a row here to remove one.</li>}
        </ul>
        <Link href="/play">
          <a className={styles.playLink}>Play (choose this deck under New game)</a>
        </Link>
        {deck.cards.length < MAX_DECK_SIZE && deck.cards.length > 0 && (
          <p className={styles.hint}>A deck under {MAX_DECK_SIZE} cards runs out sooner, and you take fatigue damage.</p>
        )}
      </aside>
    </div>
  );
};
