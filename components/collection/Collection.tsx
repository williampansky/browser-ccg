import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { classPool, loadHsCards, playablePool, primePool } from '../../engine';
import { CardDetailOverlay } from '../card-detail/CardDetailOverlay';
import { CollectionCard } from './CollectionCard';
import {
  ArtFilter,
  DEFAULT_FILTERS,
  filterCards,
  fromQuery,
  toQuery,
  matchesArt,
  loadSize,
  saveSize,
  SizeId,
  sizeOf,
  SortKey,
  sortCards,
} from './collection-model';
import type { CollectionFilters } from './collection-model';
import gridStyles from './collection.module.scss';
import styles from '../deck-builder/deck-builder.module.scss';
import { CollectionFilterControls } from './collection-filter-controls';

const { cards, byId } = loadHsCards();
const corePool = playablePool(cards);
const prime = primePool(cards);
const pool = [...corePool, ...prime, ...classPool(cards)];

/**
 * Entourage cards (summoned and offered tokens; an inactive row is left out).
 * Shown only when the box is ticked; the Core/Prime set filter applies to them
 * too (by the set in their id).
 */
const tokenPool = Array.from(byId.values()).filter(
  (c) => c.isToken && c.active && c.name,
);

/**
 * Every card the engine can play, browsable. There is no ownership yet, so the
 * collection is the whole pool.
 */
export const Collection = ({ missingArt = [] }: { missingArt?: string[] }) => {
  /**
   * Dev-only art tools: hidden in a production build. `missingArt` (ids with no
   * art file) comes from getStaticProps.
   */
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

  /**
   * The filters live in the URL (?q=...&type=spell) so a refresh or a shared
   * link keeps them. Read once the router knows
   * the query (a static page has none on the first render), then written back
   * on every change.
   */
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

    if (next !== window.location.search.replace(/^\?/, '')) {
      router.replace(
        {
          pathname: router.pathname,
          query: toQuery(filters, sort, art, showTokens),
        },
        undefined,
        { shallow: true, scroll: false },
      );
    }
  }, [filters, sort, art, showTokens, urlRead]); // eslint-disable-line react-hooks/exhaustive-deps

  // The saved size is read after the first render (it lives in localStorage,
  // which the server does not have).
  useEffect(() => setSize(loadSize()), []);
  const pickSize = (id: SizeId) => {
    setSize(id);
    saveSize(id);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setArt('all');
    setShowTokens(false);
  };

  /**
   * A memoized array of filtered and sorted cards that are currently visible.
   */
  const shown = useMemo(() => {
    return sortCards(
      [
        ...filterCards(pool, filters),
        ...(showTokens ? filterCards(tokenPool, filters) : []),
      ],
      sort,
    ).filter((c) => !debug || matchesArt(c, art, missing));
  }, [filters, sort, art, showTokens, debug, missing]);

  const cardWidth = sizeOf(size).width;
  const open = viewing ? byId.get(viewing) : undefined;

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <CollectionFilterControls
          art={art}
          debug={debug}
          filters={filters}
          lengthOfCorePool={corePool.length}
          lengthOfPrimePool={prime.length}
          onClearFiltersClick={clearFilters}
          onPickSizeChange={pickSize}
          onShowTokensChange={setShowTokens}
          pool={pool}
          set={set}
          setArt={setArt}
          setSort={setSort}
          shown={shown}
          showTokens={showTokens}
          size={size}
          sort={sort}
        />
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
