import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  classPool,
  heroes,
  loadHsCards,
  playablePool,
  primePool,
} from '../../engine';
import { CardDetailOverlay } from '../card-detail/CardDetailOverlay';
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
const pool = [...corePool, ...prime, ...classPool(cards)];
/** Entourage cards (summoned and offered tokens; an inactive row is left out). Shown only when the box is ticked; the Core/Prime set filter applies to them too (by the set in their id). */
const tokenPool = Array.from(byId.values()).filter(
  (c) => c.isToken && c.active && c.name,
);
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
  const set = <K extends keyof CollectionFilters>(
    key: K,
    value: CollectionFilters[K],
  ) => setFilters((f) => ({ ...f, [key]: value }));

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
    const next = new URLSearchParams(
      toQuery(filters, sort, art, showTokens),
    ).toString();
    if (next !== window.location.search.replace(/^\?/, ''))
      router.replace(
        {
          pathname: router.pathname,
          query: toQuery(filters, sort, art, showTokens),
        },
        undefined,
        { shallow: true, scroll: false },
      );
  }, [filters, sort, art, showTokens, urlRead]); // eslint-disable-line react-hooks/exhaustive-deps

  // The saved size is read after the first render (it lives in localStorage, which the server does not have).
  useEffect(() => setSize(loadSize()), []);
  const pickSize = (id: SizeId) => {
    setSize(id);
    saveSize(id);
  };

  const shown = useMemo(
    () =>
      sortCards(
        [
          ...filterCards(pool, filters),
          ...(showTokens ? filterCards(tokenPool, filters) : []),
        ],
        sort,
      ).filter((c) => !debug || matchesArt(c, art, missing)),
    [filters, sort, art, showTokens, debug, missing],
  );
  const cardWidth = sizeOf(size).width;
  const open = viewing ? byId.get(viewing) : undefined;

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <div className={`${styles.filters} ui-controls`}>
          <TextInput
            type="search"
            placeholder="Search name, id or text"
            aria-label="Search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          <Select
            value={filters.set}
            onChange={(e) =>
              set('set', e.target.value as CollectionFilters['set'])
            }
            aria-label="Card set"
          >
            {SETS.map((s) => (
              <option key={s} value={s}>
                {s === 'both'
                  ? 'Core + Prime'
                  : s === 'core'
                    ? `Core (${corePool.length})`
                    : `Prime (${prime.length}, more coming)`}
              </option>
            ))}
          </Select>
          <Select
            value={filters.type}
            onChange={(e) =>
              set('type', e.target.value as CollectionFilters['type'])
            }
            aria-label="Card type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
          </Select>
          <Select
            value={filters.rarity}
            onChange={(e) => set('rarity', e.target.value)}
            aria-label="Rarity"
          >
            <option value="all">All rarities</option>
            {RARITIES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.race}
            onChange={(e) => set('race', e.target.value)}
            aria-label="Minion race"
          >
            <option value="all">All races</option>
            {races.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.hero}
            onChange={(e) => set('hero', e.target.value)}
            aria-label="Class"
          >
            <option value="all">All classes</option>
            <option value="neutral">Neutral</option>
            {heroes().map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} only
              </option>
            ))}
          </Select>
          <Select
            value={filters.effect}
            onChange={(e) => set('effect', e.target.value)}
            aria-label="Effect"
          >
            <option value="all">Any effect</option>
            {effects.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </Select>
        </div>
        <div className={`${styles.filters} ui-controls`}>
          <SegmentedControl
            chips
            ariaLabel="Mana cost"
            value={filters.cost}
            onChange={(c) => set('cost', c)}
            options={COSTS.map((c) => ({
              label: c === 'all' ? 'All' : c,
              value: c,
            }))}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort by"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </Select>
          <Checkbox
            checked={showTokens}
            onChange={setShowTokens}
            title="Also show the summoned and offered entourage cards"
          >
            Entourage
          </Checkbox>
          {debug && (
            <Select
              value={art}
              onChange={(e) => setArt(e.target.value as ArtFilter)}
              aria-label="Art status (dev only)"
              title="Dev only"
            >
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
          <span className={styles.count}>
            {shown.length === 1 ? '1 card' : `${shown.length} cards`}
          </span>
          <SegmentedControl
            chips
            ariaLabel="Card size"
            value={size}
            onChange={pickSize}
            options={SIZES.map((s) => ({
              label: s.label,
              value: s.id,
              title: `${s.label} cards`,
            }))}
          />
          <Link href="/deckbuilder">
            <a>Deck builder</a>
          </Link>
          <Link href="/heroes">
            <a>Heroes</a>
          </Link>
        </div>
        <div
          className={gridStyles.grid}
          style={
            {
              gridTemplateColumns: `repeat(auto-fill, ${cardWidth}px)`,
              ['--card-w' as string]: `${cardWidth}px`,
            } as React.CSSProperties
          }
        >
          {shown.map((c) => (
            <div key={c.id} className={styles.cardWrap}>
              <CollectionCard
                card={c}
                width={cardWidth}
                onOpen={() => setViewing(c.id)}
              />
            </div>
          ))}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      {open && (
        <CardDetailOverlay
          card={open}
          byId={byId}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
};
