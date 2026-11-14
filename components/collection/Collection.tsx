import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { loadHsCards, playablePool, primePool } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import { useDetailCardWidth } from '../card-detail/detail-card-width';
import { CardEffects } from '../card-detail/CardEffects';
import { TiltFace } from '../card-detail/TiltFace';
import { CollectionCard } from './CollectionCard';
import {
  ART_FILTERS,
  ArtFilter,
  COSTS,
  DEFAULT_FILTERS,
  effectOptions,
  filterCards,
  fromQuery,
  toQuery,
  isFiltered,
  matchesArt,
  loadSize,
  raceOptions,
  RARITIES,
  saveSize,
  SETS,
  SizeId,
  sizeOf,
  SIZES,
  SORTS,
  SortKey,
  sortCards,
  TYPES,
} from './collection-model';
import type { CollectionFilters } from './collection-model';
import { Button, Checkbox, Select, SegmentedControl, TextInput } from '../ui';
import gridStyles from './collection.module.scss';
import styles from '../deck-builder/deck-builder.module.scss';

const { cards, byId } = loadHsCards();
const corePool = playablePool(cards);
const prime = primePool(cards);
const pool = [...corePool, ...prime];
/** Entourage cards (summoned and offered tokens). Shown only when the box is ticked; they ignore the Core/Prime set filter. */
const tokenPool = Array.from(byId.values()).filter((c) => c.isToken && c.name);
const effects = effectOptions(pool);
const races = raceOptions(pool);

/** Every card the engine can play, browsable. There is no ownership yet, so the collection is the whole pool. */
export const Collection = ({ missingArt = [] }: { missingArt?: string[] }) => {
  // Dev-only art tools: hidden in a production build. `missingArt` (ids with no art file) comes from getStaticProps.
  const debug = process.env.NODE_ENV !== 'production';
  const missing = useMemo(() => new Set(missingArt), [missingArt]);
  const [art, setArt] = useState<ArtFilter>('all');
  const [showTokens, setShowTokens] = useState(false);
  const [filters, setFilters] = useState<CollectionFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('cost');
  const [size, setSize] = useState<SizeId>('medium');
  const [viewing, setViewing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const bigWidth = useDetailCardWidth();
  const set = <K extends keyof CollectionFilters>(key: K, value: CollectionFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  // The filters live in the URL (?q=...&type=spell) so a refresh or a shared link keeps them. Read once the router knows
  // the query (a static page has none on the first render), then written back on every change.
  const router = useRouter();
  const [urlRead, setUrlRead] = useState(false);
  useEffect(() => {
    if (!router.isReady || urlRead) return;
    const q = fromQuery(router.query);
    setFilters(q.filters);
    setSort(q.sort);
    setArt(q.art);
    setShowTokens(q.tokens);
    setUrlRead(true);
  }, [router.isReady, router.query, urlRead]);
  useEffect(() => {
    if (!urlRead) return;
    const next = new URLSearchParams(toQuery(filters, sort, art, showTokens)).toString();
    if (next !== window.location.search.replace(/^\?/, '')) router.replace({ pathname: router.pathname, query: toQuery(filters, sort, art, showTokens) }, undefined, { shallow: true, scroll: false });
  }, [filters, sort, art, showTokens, urlRead]); // eslint-disable-line react-hooks/exhaustive-deps

  // The saved size is read after the first render (it lives in localStorage, which the server does not have).
  useEffect(() => setSize(loadSize()), []);
  const pickSize = (id: SizeId) => {
    setSize(id);
    saveSize(id);
  };

  useEffect(() => {
    if (!viewing) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [viewing]);

  const shown = useMemo(() => sortCards([...filterCards(pool, filters), ...(showTokens ? filterCards(tokenPool, { ...filters, set: 'both' }) : [])], sort).filter((c) => !debug || matchesArt(c, art, missing)), [filters, sort, art, showTokens, debug, missing]);
  const cardWidth = sizeOf(size).width;
  const open = viewing ? byId.get(viewing) : undefined;
  const tokens = open ? open.entourage.map((id) => byId.get(id)).filter((t): t is NonNullable<typeof t> => !!t) : [];

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <div className={`${styles.filters} ui-controls`}>
          <TextInput type="search" placeholder="Search name or text" aria-label="Search" value={filters.search} onChange={(e) => set('search', e.target.value)} />
          <Select value={filters.set} onChange={(e) => set('set', e.target.value as CollectionFilters['set'])} aria-label="Card set">
            {SETS.map((s) => (
              <option key={s} value={s}>
                {s === 'both' ? 'Core + Prime' : s === 'core' ? `Core (${corePool.length})` : `Prime (${prime.length}, more coming)`}
              </option>
            ))}
          </Select>
          <Select value={filters.type} onChange={(e) => set('type', e.target.value as CollectionFilters['type'])} aria-label="Card type">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
          </Select>
          <Select value={filters.rarity} onChange={(e) => set('rarity', e.target.value)} aria-label="Rarity">
            <option value="all">All rarities</option>
            {RARITIES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select value={filters.race} onChange={(e) => set('race', e.target.value)} aria-label="Minion race">
            <option value="all">All races</option>
            {races.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select value={filters.effect} onChange={(e) => set('effect', e.target.value)} aria-label="Effect">
            <option value="all">Any effect</option>
            {effects.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </Select>
        </div>
        <div className={`${styles.filters} ui-controls`}>
          <SegmentedControl chips ariaLabel="Mana cost" value={filters.cost} onChange={(c) => set('cost', c)} options={COSTS.map((c) => ({ label: c === 'all' ? 'All' : c, value: c }))} />
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort by">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </Select>
          <Checkbox checked={showTokens} onChange={setShowTokens} title="Also show the summoned and offered entourage cards">
            Entourage
          </Checkbox>
          {debug && (
            <Select value={art} onChange={(e) => setArt(e.target.value as ArtFilter)} aria-label="Art status (dev only)" title="Dev only">
              {ART_FILTERS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id === 'all' ? 'Art: any' : a.label}
                </option>
              ))}
            </Select>
          )}
          {(isFiltered(filters) || art !== 'all' || showTokens) && (
            <Button
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setArt('all');
                setShowTokens(false);
              }}
            >
              Clear filters
            </Button>
          )}
          <span className={styles.count}>{shown.length === 1 ? '1 card' : `${shown.length} cards`}</span>
          <SegmentedControl chips ariaLabel="Card size" value={size} onChange={pickSize} options={SIZES.map((s) => ({ label: s.label, value: s.id, title: `${s.label} cards` }))} />
          <Link href="/deckbuilder">
            <a>Deck builder</a>
          </Link>
          <Link href="/heroes">
            <a>Heroes</a>
          </Link>
        </div>
        <div className={gridStyles.grid} style={{ gridTemplateColumns: `repeat(auto-fill, ${cardWidth}px)`, ['--card-w' as string]: `${cardWidth}px` } as React.CSSProperties}>
          {shown.map((c) => (
            <div key={c.id} className={styles.cardWrap}>
              <CollectionCard card={c} width={cardWidth} onOpen={() => setViewing(c.id)} />
            </div>
          ))}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      {open && (
        <div className={styles.backdrop} onClick={() => setViewing(null)}>
          <div className={styles.detail} role="dialog" aria-label={open.name}>
            <div className={styles.detailMain}>
              <TiltFace card={open} width={bigWidth} />
              <div className={styles.detailText}>
                <h2>{open.name}</h2>
                <p className={styles.detailMeta}>
                  {open.source === 'prime' ? 'Prime' : 'Core'} · <span className={styles.cap}>{open.type}</span>
                </p>
                <button
                  type="button"
                  className={styles.cardId}
                  title="Click to copy"
                  onClick={(e) => {
                    e.stopPropagation(); // a click anywhere else closes the dialog; this one only copies
                    navigator.clipboard?.writeText(open.id).then(() => {
                      setCopied(open.id);
                      window.setTimeout(() => setCopied((id) => (id === open.id ? null : id)), 1200);
                    });
                  }}
                >
                  {copied === open.id ? 'Copied!' : open.id}
                </button>
                {open.flavor ? <blockquote className={styles.flavor}>{open.flavor}</blockquote> : <p className={styles.noFlavor}>No flavor text.</p>}
                <CardEffects card={open} />

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
                <p className={styles.closeHint}>Click anywhere or press Esc to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
