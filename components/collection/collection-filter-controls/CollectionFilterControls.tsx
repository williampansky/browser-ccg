import React from 'react';
import Link from 'next/link';
import type { ChangeEvent } from 'react';

import { heroes } from '../../../engine';
import type { Card } from '../../../engine';
import {
  Button,
  Checkbox,
  SegmentedControl,
  Select,
  TextInput,
} from '../../ui';
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

import styles from './collection-filter-controls.module.scss';
import { CollectionCardSizeControl } from '../collection-card-size-control';

const cardCostSegmentOptions = COSTS.map((cost) => ({
  label: cost === 'all' ? 'All' : cost,
  value: cost,
}));

const cardSizeSegmentOptions = SIZES.map((option) => ({
  label: option.label,
  title: `${option.label} cards`,
  value: option.id,
}));

type FilterSet = <K extends keyof CollectionFilters>(
  key: K,
  value: CollectionFilters[K],
) => void;

interface Props {
  art: ArtFilter;
  filters: CollectionFilters;
  isDebug: boolean;
  isShowingTokens: boolean;
  lengthOfCorePool: number;
  lengthOfPrimePool: number;
  onClearFiltersClick: () => void;
  onPickSizeChange: (id: SizeId) => void;
  onShowTokensChange: (isShowing: boolean) => void;
  pool: Card[];
  set: FilterSet;
  setArt: (art: ArtFilter) => void;
  setSort: (sort: SortKey) => void;
  shown: Card[];
  size: SizeId;
  sort: SortKey;
}

/**
 * The two rows of controls above the collection grid: search and dropdown
 * filters, then cost, sort, the entourage switch, card count and card size.
 */
export const CollectionFilterControls = ({
  art,
  filters,
  isDebug,
  isShowingTokens,
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
  size,
  sort,
}: Props): JSX.Element => {
  const effects = effectOptions(pool);
  const races = raceOptions(pool);
  const hasActiveFilters = isFiltered(filters) || art !== 'all';
  const canClear = hasActiveFilters || isShowingTokens;

  const setFilter = <K extends keyof CollectionFilters>(key: K) => {
    return (value: CollectionFilters[K]): void => {
      set(key, value);
    };
  };

  /** A Select's onChange: hands the chosen option to `apply` as type `T`. */
  const handleOnSelectChange = <T extends string>(
    apply: (value: T) => void,
  ) => {
    return (event: ChangeEvent<HTMLSelectElement>): void => {
      apply(event.target.value as T);
    };
  };

  const setLabel = (option: string): string => {
    if (option === 'both') return 'Core + Prime';
    if (option === 'core') return `Core (${lengthOfCorePool})`;

    return `Prime (${lengthOfPrimePool}, more coming)`;
  };

  return (
    <React.Fragment>
      <div className={`${styles.filters} ui-controls`}>
        <TextInput
          aria-label="Search"
          id="cardName"
          onChange={(event) => set('search', event.target.value)}
          placeholder="Search name, id or text (comma-separate several)"
          type="search"
          value={filters.search}
        />

        <Select
          aria-label="Card set"
          id="cardSet"
          onChange={handleOnSelectChange(setFilter('set'))}
          value={filters.set}
        >
          {SETS.map((option) => (
            <option key={option} value={option}>
              {setLabel(option)}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Card type"
          id="cardType"
          onChange={handleOnSelectChange(setFilter('type'))}
          value={filters.type}
        >
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All types' : type}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Rarity"
          id="CardRarity"
          onChange={handleOnSelectChange(setFilter('rarity'))}
          value={filters.rarity}
        >
          <option value="all">All rarities</option>
          {RARITIES.map((rarity) => (
            <option key={rarity.id} value={rarity.id}>
              {rarity.label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Minion race"
          id="cardRace"
          onChange={handleOnSelectChange(setFilter('race'))}
          value={filters.race}
        >
          <option value="all">All races</option>
          {races.map((race) => (
            <option key={race.value} value={race.value}>
              {race.label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Class"
          id="cardClass"
          onChange={handleOnSelectChange(setFilter('hero'))}
          value={filters.hero}
        >
          <option value="all">All classes</option>
          <option value="neutral">Neutral</option>
          {heroes().map((hero) => (
            <option key={hero.id} value={hero.id}>
              {hero.name} only
            </option>
          ))}
        </Select>

        <Select
          aria-label="Effect"
          id="cardEffect"
          onChange={handleOnSelectChange(setFilter('effect'))}
          value={filters.effect}
        >
          <option value="all">Any effect</option>
          {effects.map((effect) => (
            <option key={effect.value} value={effect.value}>
              {effect.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={`${styles.filters} ui-controls`}>
        <SegmentedControl
          ariaLabel="Card cost"
          chips
          onChange={(cost) => set('cost', cost)}
          options={cardCostSegmentOptions}
          value={filters.cost}
        />

        <Select
          aria-label="Sort by"
          id="sortBy"
          onChange={handleOnSelectChange(setSort)}
          value={sort}
        >
          {SORTS.map((option) => (
            <option key={option.id} value={option.id}>
              Sort: {option.label}
            </option>
          ))}
        </Select>

        <Checkbox
          checked={isShowingTokens}
          id="showTokens"
          onChange={onShowTokensChange}
          title="Also show the summoned and offered entourage cards"
        >
          Entourage
        </Checkbox>

        {isDebug && (
          <Select
            aria-label="Art status (dev only)"
            id="cardArtStatus"
            onChange={handleOnSelectChange(setArt)}
            title="Dev only"
            value={art}
          >
            {ART_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id === 'all' ? 'Art: any' : option.label}
              </option>
            ))}
          </Select>
        )}

        <span className={`${styles.count} ${styles.largeOnly}`}>
          {shown.length === 1 ? '1 card' : `${shown.length} cards`}
        </span>

        <div className={styles.largeOnly}>
          <CollectionCardSizeControl
            onPickSizeChange={onPickSizeChange}
            size={size}
          />
        </div>

        <div className={styles.links}>
          <Link href="/deckbuilder">
            <a className={styles.link}>Deck builder</a>
          </Link>
          <Link href="/heroes">
            <a className={styles.link}>Heroes</a>
          </Link>
          {canClear && (
            <div className={styles.clearButton}>
              <Button onClick={onClearFiltersClick} size="sm">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
