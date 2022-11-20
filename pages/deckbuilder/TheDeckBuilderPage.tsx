import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Layout } from '../../components/site-components';
import { Card as CardComponent } from '../../components/game-components';
import type { Card } from '../../types';
import { siteConfig } from '../../app.config';
import { CardDetailModal } from '../../components/site-components/Modals';
import { useLocalStorage } from '../../hooks';
import { useLongPress } from 'use-long-press';
import { RootState } from '../../store';

export default function TheDeckBuilderPage() {
  const page = siteConfig.pages.deckbuilder;
  const collection = useSelector(({ collection }: RootState) => collection);
  const [cardModal, setCardModal] = useState<Card | undefined>(undefined);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  useLocalStorage([], sidebarActive.toString());

  const callback = useCallback(() => {
    // add card to deck
    console.log('add to deck')
  }, []);

  const bind = useLongPress(callback, {
    onStart: event => () => {},
    onFinish: event => callback,
    threshold: 500,
    captureEvent: true,
    cancelOnMovement: true
  });

  const inspectCard = (c: Card) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setCardModal(c);
    };
  };

  return (
    <Layout title={page.title} description={page.description}>
      <div className='collection__page'>
        <Container>
          <h1>{page.headline}</h1>
          <div className='grid'>
            {collection?.map((c: Card) => {
              return c && !c.isEntourage ? (
                <div
                  key={c.uuid}
                  className='grid-item'
                  onClickCapture={inspectCard(c)}
                  {...bind()}
                >
                  <CardComponent {...c} canPlay={true} />
                </div>
              ) : null;
            })}
          </div>
        </Container>

        <CardDetailModal
          data={cardModal}
          onModalDismiss={() => setCardModal(undefined)}
        />
      </div>
    </Layout>
  );
}
