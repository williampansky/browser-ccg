import Link from 'next/link';
import {
  Button,
  Checkbox,
  SegmentedControl,
  Select,
  TextInput,
} from '../../ui';
import styles from './collection-filter-controls.module.scss';
import {
  ART_FILTERS,
  COSTS,
  effectOptions,
  isFiltered,
  raceOptions,
  RARITIES,
  SETS,
  SIZES,
  SORTS,
  TYPES,
} from '../collection-model';
import type {
  ArtFilter,
  CollectionFilters,
  SizeId,
  SortKey,
} from '../collection-model';
import { heroes } from '../../../engine';
import type { Card } from '../../../engine';

type FilterSet = <K extends keyof CollectionFilters>(
  key: K,
  value: CollectionFilters[K],
) => void;

interface Props {
  art: ArtFilter;
  debug: boolean;
  filters: CollectionFilters;
  lengthOfCorePool: number;
  lengthOfPrimePool: number;
  onClearFiltersClick: () => void;
  onPickSizeChange: (id: SizeId) => void;
  onShowTokensChange: (isShown: boolean) => void;
  pool: Card[];
  set: FilterSet;
  setArt: (art: ArtFilter) => void;
  setSort: (sort: SortKey) => void;
  shown: Card[];
  showTokens: boolean;
  size: SizeId;
  sort: SortKey;
}

export const CollectionFilterControls = ({
  art,
  debug,
  filters,
  lengthOfCorePool,
  lengthOfPrimePool,
  onClearFiltersClick,
  onPickSizeChange,
  onShowTokensChange,
  pool,
  set,
  setArt,
  setSort,
  shown,
  showTokens,
  size,
  sort,
}: Props): JSX.Element => {
  const effects = effectOptions(pool);
  const races = raceOptions(pool);

  return (
    <div>
      <div className={`${styles.filters} ui-controls`}>
        <TextInput
          type="search"
          placeholder="Search name, id or text (comma-separate several)"
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
                  ? `Core (${lengthOfCorePool})`
                  : `Prime (${lengthOfPrimePool}, more coming)`}
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
          onChange={onShowTokensChange}
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
          <Button onClick={onClearFiltersClick}>Clear filters</Button>
        )}

        <span className={styles.count}>
          {shown.length === 1 ? '1 card' : `${shown.length} cards`}
        </span>

        <SegmentedControl
          chips
          ariaLabel="Card size"
          value={size}
          onChange={onPickSizeChange}
          options={SIZES.map((s) => ({
            label: s.label,
            value: s.id,
            title: `${s.label} cards`,
          }))}
        />

        <div>
          <Link href="/deckbuilder">
            <a>Deck builder</a>
          </Link>
          <Link href="/heroes">
            <a>Heroes</a>
          </Link>
        </div>
      </div>
    </div>
  );
};
