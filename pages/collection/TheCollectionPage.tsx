import React, { useCallback, useEffect, useState } from 'react';
import { MouseEvent, TouchEvent } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useLongPress } from 'use-long-press';

import { Container, Layout, Sidebar } from '../../components/site-components';
import { Card as CardComponent } from '../../components/game-components';
import { CardDetailModal } from '../../components/site-components/Modals';
import { siteConfig } from '../../app.config';
import { useLocalStorage } from '../../hooks';

import type { RootState } from '../../store';
import type { Card, Deck } from '../../types';
import { addCard, deleteDeck, editDeck, newDeck, setDeckName } from '../../features';

export default function TheCollectionPage() {
  const page = siteConfig.pages.collection;
  const router = useRouter();
  const dispatch = useDispatch();
  const collection = useSelector(({ collection }: RootState) => collection);
  const decks = useSelector(({ decks }: RootState) => decks);
  const [cardModal, setCardModal] = useState<Card | undefined>(undefined);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  const [showDecks, setShowDecks] = useState<boolean>(false);
  const [activeDeck, setActiveDeck] = useState<number | undefined>(undefined);
  useLocalStorage(decks, sidebarActive.toString());

  // add card to deck
  const addCardToDeck = useCallback(
    (e: MouseEvent | TouchEvent, c: any) => {
      e.preventDefault();
      // console.log(c)
      // if (activeDeck) dispatch(addCard({ card: c?.context, deckSlot: activeDeck }));
    },
    [activeDeck]
  );

  const bind = useLongPress(addCardToDeck as any, {
    onStart: (event) => () => null,
    onFinish: (event, { context }) => addCardToDeck(event, context),
    onCancel: (event) => () => null,
    threshold: 500,
    captureEvent: true,
    cancelOnMovement: true,
  });

  const inspectCard = (c: Card) => {
    return (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      // setCardModal(c);
      if (activeDeck) dispatch(addCard({ card: c, deckSlot: activeDeck }));
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
    dispatch(setDeckName({ deckSlot: activeDeck, name: element.value }));
    return (event: MouseEvent | TouchEvent) => event.preventDefault();
  };

  const onDeckDeleteClick = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setActiveDeck(undefined);
    dispatch(deleteDeck(activeDeck));
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

  return (
    <Layout title={page.title} description={page.description}>
      <Sidebar
        active={sidebarActive}
        activeDeck={activeDeck}
        onDeckSlotClick={onDeckSlotClick}
        onDeckDeleteClick={onDeckDeleteClick}
        onDeckNameChange={onDeckNameChange}
      />

      <div className='collection__page'>
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
                  onClickCapture={inspectCard(c)}
                  {...bind(c)}
                >
                  <CardComponent {...c} canPlay={true} />
                </div>
              ) : null;
            })}
          </div>
        </Container>
      </div>

      <CardDetailModal
        data={cardModal}
        onModalDismiss={() => setCardModal(undefined)}
      />
    </Layout>
  );
}
