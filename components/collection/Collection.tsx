import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { classPool, loadHsCards, playablePool, primePool } from '../../engine';
import type { Card } from '../../engine';
import { CardDetailOverlay } from '../card-detail/CardDetailOverlay';
import styles from '../deck-builder/deck-builder.module.scss';

import { CollectionCard } from './CollectionCard';
import { CollectionFilterControls } from './collection-filter-controls';
import {
  DEFAULT_FILTERS,
  filterCards,
  fromQuery,
  loadSize,
  matchesArt,
  saveSize,
  sizeOf,
  sortCards,
  toQuery,
} from './collection-model';
import type {
  ArtFilter,
  CollectionFilters,
  SizeId,
  SortKey,
} from './collection-model';

import gridStyles from './collection.module.scss';

const { cards, byId } = loadHsCards();
const corePool = playablePool(cards);
const prime = primePool(cards);
const pool = [...corePool, ...prime, ...classPool(cards)];

/**
 * Entourage cards (summoned and offered tokens; an inactive row is left out).
 * Shown only when the box is ticked; the Core/Prime set filter applies to them
 * too (by the set in their id).
 */
const isOfferedToken = (card: Card): boolean => {
  return card.isToken && card.active && Boolean(card.name);
};

const tokenPool = Array.from(byId.values()).filter(isOfferedToken);

/**
 * Every card the engine can play, browsable. There is no ownership yet, so the
 * collection is the whole pool.
 */
export const Collection = ({
  missingArt = [],
}: {
  missingArt?: string[];
}): JSX.Element => {
  /**
   * Dev-only art tools: hidden in a production build. `missingArt` (ids with no
   * art file) comes from getStaticProps.
   */
  const isDebug = process.env.NODE_ENV !== 'production';
  const missing = useMemo(() => new Set(missingArt), [missingArt]);
  const [art, setArt] = useState<ArtFilter>('all');
  const [isShowingTokens, setIsShowingTokens] = useState(false);
  const [filters, setFilters] = useState<CollectionFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('cost');
  const [size, setSize] = useState<SizeId>('medium');
  const [viewing, setViewing] = useState<string | null>(null);

  const set = <K extends keyof CollectionFilters>(
    key: K,
    value: CollectionFilters[K],
  ) => setFilters((previous) => ({ ...previous, [key]: value }));

  /**
   * The filters live in the URL (?q=...&type=spell) so a refresh or a shared
   * link keeps them. Read once the router knows the query (a static page has
   * none on the first render), then written back on every change.
   */
  const router = useRouter();
  const [isUrlRead, setIsUrlRead] = useState(false);

  useEffect(() => {
    if (!router.isReady || isUrlRead) return;
    const saved = fromQuery(router.query);
    setFilters(saved.filters);
    setSort(saved.sort);
    setArt(saved.art);
    setIsShowingTokens(saved.tokens);
    setIsUrlRead(true);
  }, [router.isReady, router.query, isUrlRead]);

  useEffect(() => {
    if (!isUrlRead) return;
    const query = toQuery(filters, sort, art, isShowingTokens);
    const next = new URLSearchParams(query).toString();

    if (next !== window.location.search.replace(/^\?/, '')) {
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, art, isShowingTokens, isUrlRead]);

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
    setIsShowingTokens(false);
  };

  /**
   * A memoized array of filtered and sorted cards that are currently visible.
   */
  const shown = useMemo(() => {
    return sortCards(
      [
        ...filterCards(pool, filters),
        ...(isShowingTokens ? filterCards(tokenPool, filters) : []),
      ],
      sort,
    ).filter((card) => !isDebug || matchesArt(card, art, missing));
  }, [filters, sort, art, isShowingTokens, isDebug, missing]);

  const cardWidth = sizeOf(size).width;
  const open = viewing ? byId.get(viewing) : undefined;

  return (
    <div className={styles.page}>
      <section className={styles.pool}>
        <CollectionFilterControls
          art={art}
          filters={filters}
          isDebug={isDebug}
          isShowingTokens={isShowingTokens}
          lengthOfCorePool={corePool.length}
          lengthOfPrimePool={prime.length}
          onClearFiltersClick={clearFilters}
          onPickSizeChange={pickSize}
          onShowTokensChange={setIsShowingTokens}
          pool={pool}
          set={set}
          setArt={setArt}
          setSort={setSort}
          shown={shown}
          size={size}
          sort={sort}
        />

        <div
          className={gridStyles.grid}
          style={
            {
              gridTemplateColumns: `repeat(auto-fill, ${cardWidth}px)`,
              ['--card-w' as string]: `${cardWidth}px`,
            } as CSSProperties
          }
        >
          {shown.map((card) => (
            <div key={card.id} className={styles.cardWrap}>
              <CollectionCard
                card={card}
                onOpen={() => setViewing(card.id)}
                width={cardWidth}
              />
            </div>
          ))}
          {shown.length === 0 && <p>No card matches.</p>}
        </div>
      </section>

      {open && (
        <CardDetailOverlay
          byId={byId}
          card={open}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
};
