import React, { useCallback, useEffect, useState } from 'react';
import { MouseEvent, TouchEvent } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useLongPress } from 'use-long-press';

import {
  Container,
  Layout,
  ScrollToTop,
  Sidebar,
} from '../../components/site-components';
import { elementIsNotUndefined, getDeckbuilderDeckLength } from '../../utils';
import { Card as CardComponent } from '../../components/game-components';
import { CardDetailModal } from '../../components/site-components/Modals';
import { gameConfig, siteConfig } from '../../app.config';
import { useLocalStorage } from '../../hooks';

import type { RootState } from '../../store';
import type { Card, Deck } from '../../types';
import {
  addCard,
  deleteDeck,
  editDeck,
  newDeck,
  removeCard,
  setDeckName,
} from '../../features';

const { numerics } = gameConfig;

export default function TheCollectionPage() {
  const page = siteConfig.pages.collection;
  const router = useRouter();
  const dispatch = useDispatch();
  const collection = useSelector(({ collection }: RootState) => collection);
  const decks = useSelector(({ decks }: RootState) => decks);
  const [pagePaddingTop, setPagePaddingTop] = useState<number>(0);
  const [isLongPress, setIsLongPress] = useState<boolean>(false);
  const [cardModal, setCardModal] = useState<Card | undefined>(undefined);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  const [showDecks, setShowDecks] = useState<boolean>(false);
  const [activeDeck, setActiveDeck] = useState<number | undefined>(undefined);
  useLocalStorage(decks, sidebarActive.toString());

  useEffect(() => {
    if (activeDeck !== undefined) {
      const sidebar = document?.querySelector('.site__sidebar');
      if (elementIsNotUndefined(sidebar)) {
        const height = sidebar?.clientHeight;
        if (typeof height === 'number') {
          setPagePaddingTop(sidebar?.clientHeight! - 73);
        }
      }
    } else {
      setPagePaddingTop(0);
    }
  }, [activeDeck, decks]);

  // add card to deck
  const longPressCallback = useCallback(
    (e: MouseEvent | TouchEvent, c: any) => {
      const obj = c?.context;
      e.preventDefault();

      if (activeDeck) {
        const has = decks[activeDeck].cards.find((c: Card) => c.id === obj.id);
        if (has?.amount === 2) {
          dispatch(removeCard({ cardId: obj?.id, deckSlot: activeDeck }));
        } else {
          dispatch(addCard({ card: obj, deckSlot: activeDeck }));
        }
      }
    },
    [activeDeck, decks]
  );

  const bindLongPress = useLongPress(longPressCallback as any, {
    onStart: (event, { context }) => setIsLongPress(false),
    onFinish: (event, { context }) => setIsLongPress(true),
    onCancel: (event, { context }) => setIsLongPress(false),
    filterEvents: (event) => true,
    threshold: 200,
    captureEvent: true,
    cancelOnMovement: true,
  });

  const inspectCard = (event: MouseEvent | TouchEvent, c: Card) => {
    event.preventDefault();
    if (!isLongPress) setCardModal(c);
    return (e: MouseEvent | TouchEvent = event) => e.preventDefault();
  };

  const onBackFromDeckClick = () => {
    setShowDecks(true);
    setActiveDeck(undefined);

    return (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
    };
  };

  const onDeckSlotClick = (deck: Deck, idx: number) => {
    setActiveDeck(idx);
    setShowDecks(true);

    if (deck?.uuid) {
      dispatch(editDeck(idx));
    } else {
      dispatch(newDeck(idx));
    }

    return (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
    };
  };

  const onDeckNameChange = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    const element = event.currentTarget as HTMLInputElement;
    dispatch(setDeckName({ deckSlot: activeDeck!, name: element.value }));
    return (event: MouseEvent | TouchEvent) => event.preventDefault();
  };

  const onDeckDeleteClick = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setActiveDeck(undefined);
    dispatch(deleteDeck(activeDeck!));
    return (event: MouseEvent | TouchEvent) => event.preventDefault();
  };

  const toggleSidebar = (active: boolean = sidebarActive) => {
    return (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      setSidebarActive(!active);

      if (showDecks) {
        setShowDecks(false);
        setActiveDeck(undefined);
      }
    };
  };

  const handleCardLock = (card: Card): boolean => {
    if (activeDeck !== undefined) {
      if (
        getDeckbuilderDeckLength(decks[activeDeck].cards) >=
        numerics.cardsPerDeck
      ) {
        return true;
      }

      const c = decks[activeDeck].cards.find((c: Card) => c.id === card?.id);
      if (c?.amount === 2 || c?.elite === true) return true;
      else return false;
    }

    return false;
  };

  const handleModalDeckbuilderCtaClick = (
    context: 'ADD_CARD' | 'REMOVE_CARD',
    card: Card
  ) => {
    if (activeDeck) {
      switch (context) {
        case 'ADD_CARD':
          dispatch(addCard({ card: card, deckSlot: activeDeck }));
          break;

        case 'REMOVE_CARD':
        default:
          dispatch(removeCard({ cardId: card?.id, deckSlot: activeDeck }));
          break;
      }
    }

    return (event: MouseEvent | TouchEvent) => event.preventDefault();
  };

  return (
    <Layout title={page.title} description={page.description}>
      <Sidebar
        active={sidebarActive}
        activeDeck={activeDeck}
        onDeckSlotClick={onDeckSlotClick}
        onDeckDeleteClick={onDeckDeleteClick}
        onDeckNameChange={onDeckNameChange}
        onBackFromDeckClick={onBackFromDeckClick}
      />

      <div
        className='collection__page'
        style={{
          paddingTop: `${pagePaddingTop}px`,
        }}
      >
        <Container>
          <div className='page__header'>
            <h1>{page.headline}</h1>
            <button onClickCapture={toggleSidebar()}>Decks</button>
          </div>

          <div className='grid'>
            {collection?.map((c: Card, i) => {
              return c && !c.isEntourage ? (
                <div
                  key={c.uuid}
                  className='grid-item'
                  data-locked={handleCardLock(c)}
                  onClickCapture={(e) => inspectCard(e, c)}
                  {...bindLongPress(c)}
                >
                  <CardComponent {...c} canPlay={!handleCardLock(c)} />
                </div>
              ) : null;
            })}
          </div>
        </Container>

        <ScrollToTop />
      </div>

      <CardDetailModal
        data={cardModal}
        activeDeck={activeDeck}
        deckbuilderLocked={
          getDeckbuilderDeckLength(decks[activeDeck!]?.cards) >=
          numerics.cardsPerDeck
        }
        isDeckbuilder={activeDeck ? true : false}
        onModalDismiss={() => setCardModal(undefined)}
        onDeckbuilderCtaClick={handleModalDeckbuilderCtaClick}
      />
    </Layout>
  );
}
