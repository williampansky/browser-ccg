import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';

import type { RootState } from '../../../store';
import type { Card, Deck } from '../../../types';
import { DeckSlot } from '../DeckSlot';
import { removeCard } from '../../../features';

import energyImg from '../../../public/images/card-assets/ENERGY_SLOT_EMPTY.png';
import { getDeckbuilderDeckLength } from '../../../utils';

interface SidebarProps {
  active: boolean;
  activeDeck?: number;
  onDeckSlotClick: (d: Deck, i: number) => void;
  onDeckDeleteClick: (event: any) => void;
  onDeckNameChange: (event: any) => void;
  onBackFromDeckClick: (event: any) => void;
}

export const Sidebar = ({
  active,
  activeDeck,
  onDeckSlotClick,
  onDeckDeleteClick,
  onDeckNameChange,
  onBackFromDeckClick,
}: SidebarProps) => {
  const dispatch = useDispatch();
  const config = useSelector(({ config }: RootState) => config);
  const decks = useSelector(({ decks }: RootState) => decks);
  const { gameConfig } = config;

  const handleRemoveCardClick = (c: Card, d: number) => {
    dispatch(removeCard({ cardId: c.id, deckSlot: d }));
    return (event: MouseEvent | TouchEvent) => event.preventDefault();
  };

  return (
    <aside
      className={[
        'site__sidebar',
        active ? 'sidebar--decks' : '',
        activeDeck !== undefined ? 'sidebar--deckbuilder' : '',
      ].join(' ')}
    >
      {active && !activeDeck && decks && (
        <ul className='decks__grid'>
          {Object.keys(decks)
            .map((i) => decks[i])
            .map((d: Deck, i) => {
              i = i + 1;
              return (
                <li key={i} onClickCapture={() => onDeckSlotClick(d, i)}>
                  <DeckSlot filled={d?.uuid ? true : false} />
                </li>
              );
            })}
        </ul>
      )}

      {active && activeDeck && (
        <div className='deckbuilder__deck'>
          <div className='deckbuilder__deck-info'>
            <div>
              <button onClickCapture={onBackFromDeckClick}>Back</button>
            </div>
            <div>
              <input
                name='name'
                defaultValue={decks[activeDeck]?.name}
                type='text'
                onChangeCapture={onDeckNameChange}
              />
            </div>
            <div>
              {getDeckbuilderDeckLength(decks[activeDeck]?.cards)}/{gameConfig.numerics.cardsPerDeck}
            </div>
            <div>
              <button onClickCapture={onDeckDeleteClick}>Delete</button>
            </div>
          </div>
          <ul className='deckbuilder__deck-grid'>
            {decks[activeDeck]?.cards.map((card: Card, i: number) => {
              return (
                <div
                  key={i}
                  data-key={card?.key}
                  onClick={() => handleRemoveCardClick(card, activeDeck)}
                >
                  <div className='deck__item' data-rarity={card?.rarity}>
                    <div className='item__cost text__value text__value--shadow'>
                      <span>{card?.baseCost}</span>
                      <Image layout='intrinsic' src={energyImg} />
                    </div>

                    <div className='item__info'>
                      <div className='item__name bccg-text-truncate text__value text__value--shadow'>
                        {card?.name}
                      </div>
                    </div>

                    {card?.amount === 2 && (
                      <div className='item__amount text__value text__value--shadow'>
                        2
                      </div>
                    )}

                    <Image
                      layout='fill'
                      src={`/images/sets/SET_CORE/${card?.id}-DECK.jpg`}
                    />
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};
