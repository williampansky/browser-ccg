import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadHsCards, playablePool, primePool } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import styles from '../deck-builder/deck-builder.module.scss';

const { cards, byId } = loadHsCards();
const corePool = playablePool(cards);
const prime = primePool(cards);
const pool = [...corePool, ...prime].sort((a, b) => a.cost - b.cost || (a.name ?? '').localeCompare(b.name ?? ''));
const TYPES = ['all', 'minion', 'spell', 'weapon', 'item'] as const;
const SETS = ['both', 'core', 'prime'] as const;
const COSTS = ['all', '0', '1', '2', '3', '4', '5', '6', '7+'] as const;

/** Every card the engine can play, browsable. There is no ownership yet, so the collection is the whole pool. */
export const Collection = () => {
  const [type, setType] = useState<typeof TYPES[number]>('all');
  const [set, setSet] = useState<typeof SETS[number]>('both');
  const [cost, setCost] = useState<typeof COSTS[number]>('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    if (!viewing) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [viewing]);

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

  const open = viewing ? byId.get(viewing) : undefined;
  const tokens = open ? open.entourage.map((id) => byId.get(id)).filter((t): t is NonNullable<typeof t> => !!t) : [];

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <div className={styles.filters}>
          <input type="search" placeholder="Search name or text" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={set} onChange={(e) => setSet(e.target.value as typeof set)} aria-label="Card set">
            <option value="both">Core + Prime</option>
            <option value="core">Core ({corePool.length})</option>
            <option value="prime">Prime ({prime.length}, more coming)</option>
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
          <Link href="/deckbuilder">
            <a>Deck builder</a>
          </Link>
        </div>
        <div className={styles.grid}>
          {shown.map((c) => (
            <div key={c.id} className={styles.cardWrap}>
              <button type="button" className={styles.cardButton} onClick={() => setViewing(c.id)} aria-label={`View ${c.name}`}>
                <CardFace card={c} width={150} />
              </button>
            </div>
          ))}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      {open && (
        <div className={styles.backdrop} onClick={() => setViewing(null)}>
          <div className={styles.detail} role="dialog" aria-label={open.name} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailMain}>
              <CardFace card={open} width={320} />
              <div className={styles.detailText}>
                <h2>{open.name}</h2>
                <p className={styles.detailMeta}>
                  {open.source === 'prime' ? 'Prime' : 'Core'} · <span className={styles.cap}>{open.type}</span>
                </p>
                {open.flavor ? <blockquote className={styles.flavor}>{open.flavor}</blockquote> : <p className={styles.noFlavor}>No flavor text.</p>}
                <div className={styles.detailButtons}>
                  <button type="button" onClick={() => setViewing(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
            {tokens.length > 0 && (
              <div className={styles.tokens}>
                <h3>Makes or offers</h3>
                <div className={styles.tokenRow}>
                  {tokens.map((t) => (
                    <div key={t.id} className={styles.token}>
                      <CardFace card={t} width={150} />
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
