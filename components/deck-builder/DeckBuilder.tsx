import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadHsCards, MAX_DECK_SIZE, playablePool, primePool } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import { useDetailCardWidth } from '../card-detail/detail-card-width';
import { CardEffects } from '../card-detail/CardEffects';
import { heroes } from '../../engine/heroes';
import { addCard, blankDeck, countOf, curve, removeCard, SavedDeck, whyNotAdd } from './deck-model';
import { loadDecks, saveDecks } from './deck-storage';
import { Button, LinkButton, SegmentedControl, Select, TextInput } from '../ui';
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
  /** The card shown enlarged in the detail window (flavor text, the tokens it makes, add / close), or null. */
  const [viewing, setViewing] = useState<string | null>(null);
  const bigWidth = useDetailCardWidth();

  useEffect(() => {
    const saved = loadDecks(byId);
    const list = saved.length ? saved : [blankDeck('My deck')];
    setDecks(list);
    setCurrentId(list[0].id);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!viewing) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [viewing]);
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
        <div className={`${styles.filters} ui-controls`}>
          <TextInput type="search" placeholder="Search name or text" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={set} onChange={(e) => setSet(e.target.value as typeof set)} aria-label="Card set">
            <option value="core">Core ({corePool.length})</option>
            <option value="prime">Prime ({prime.length}, more coming)</option>
            <option value="both">Core + Prime</option>
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Card type">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
          </Select>
          <SegmentedControl chips ariaLabel="Mana cost" value={cost} onChange={setCost} options={COSTS.map((c) => ({ label: c === 'all' ? 'All' : c, value: c }))} />
          <span className={styles.count}>{shown.length} cards</span>
        </div>
        <div className={styles.grid}>
          {shown.map((c) => {
            const n = countOf(deck, c.id);
            const blocked = !!whyNotAdd(deck, c);
            return (
              <div key={c.id} className={styles.cardWrap}>
                <button
                  type="button"
                  className={[styles.cardButton, blocked ? styles.blocked : ''].join(' ')}
                  onClick={() => setViewing(c.id)}
                  onContextMenu={(e) => {
                    // Right-click adds a copy without opening the card (and no browser menu).
                    e.preventDefault();
                    add(c.id);
                  }}
                  title={whyNotAdd(deck, c) ?? 'Click to view, right-click to add to the deck'}
                  aria-label={`View ${c.name} (${n} in deck). Right-click to add it to the deck`}
                >
                  <CardFace card={c} width={150} />
                  {n > 0 && <span className={styles.copies}>×{n}</span>}
                </button>
              </div>
            );
          })}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      {viewing && byId.get(viewing) && (
        <div className={styles.backdrop} onClick={() => setViewing(null)}>
          <div className={styles.detail} role="dialog" aria-label={byId.get(viewing)!.name} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const c = byId.get(viewing)!;
              const why = whyNotAdd(deck, c);
              const tokens = c.entourage.map((id) => byId.get(id)).filter((t): t is NonNullable<typeof t> => !!t);
              return (
                <>
                  <div className={styles.detailMain}>
                    <CardFace card={c} width={bigWidth} />
                    <div className={styles.detailText}>
                      <h2>{c.name}</h2>
                      <p className={styles.detailMeta}>
                        {c.source === 'prime' ? 'Prime' : 'Core'} · <span className={styles.cap}>{c.type}</span> · {countOf(deck, c.id)} in {deck.name || 'this deck'}
                      </p>
                      {c.flavor ? <blockquote className={styles.flavor}>{c.flavor}</blockquote> : <p className={styles.noFlavor}>No flavor text.</p>}
                      {why && <p className={styles.note}>{why}</p>}
                      <CardEffects card={c} />
                      <div className={styles.detailButtons}>
                        <Button disabled={!!why} onClick={() => add(c.id)}>
                          Add to deck
                        </Button>
                        <Button onClick={() => setViewing(null)}>Close</Button>
                      </div>
                      {tokens.length > 0 && (
                        <div className={styles.tokens}>
                          <h3>Makes or offers</h3>
                          <div className={styles.tokenRow}>
                            {tokens.map((t) => (
                              <div key={t.id} className={styles.token}>
                                <CardFace card={t} width={110} />
                                <span>{t.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <aside className={styles.deck}>
        <div className={styles.deckHead}>
          <Select value={deck.id} onChange={(e) => { setCurrentId(e.target.value); setNote(''); }} aria-label="Saved decks">
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || 'Unnamed'} ({d.cards.length})
              </option>
            ))}
          </Select>
          <Button onClick={newDeck}>New</Button>
          <Button variant="danger" onClick={deleteDeck}>Delete</Button>
        </div>
        <TextInput className={styles.name} value={deck.name} maxLength={30} onChange={(e) => update({ ...deck, name: e.target.value })} aria-label="Deck name" />
        <Select
          className={styles.name}
          value={deck.hero ?? ''}
          onChange={(e) => update({ ...deck, hero: e.target.value || undefined })}
          aria-label="Deck hero"
        >
          <option value="">Hero: any (pick at start)</option>
          {heroes().map((h) => (
            <option key={h.id} value={h.id}>
              Hero: {h.name}
            </option>
          ))}
        </Select>
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
          {rows.length === 0 && <li className={styles.empty}>Right-click a card to add it (click it to look closer). Click a row here to remove one.</li>}
        </ul>
        <LinkButton href="/play" variant="primary" className={styles.playLink}>
          Play (choose this deck under New game)
        </LinkButton>
        {deck.cards.length < MAX_DECK_SIZE && deck.cards.length > 0 && (
          <p className={styles.hint}>A deck under {MAX_DECK_SIZE} cards runs out sooner, and you take fatigue damage.</p>
        )}
      </aside>
    </div>
  );
};
