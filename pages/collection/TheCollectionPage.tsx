import { useEffect, useState } from 'react';
import { Container, Layout } from '../../components/site-components';
import { Card as CardComponent } from '../../components/game-components';
import { createCardObject } from '../../utils';
import type { Card, CardBase } from '../../types';
import { siteConfig } from '../../app.config';

export default function TheCollectionPage() {
  const page = siteConfig.pages.collection;
  const [cards, setCards] = useState<Card[]>([]);
  const [cardModal, setCardModal] = useState<Card | undefined>(undefined);

  const fetchCards = async () => {
    const response = await fetch('/api/cards');
    const data = await response.json();
    setCards(data);
  };

  useEffect(() => {
    fetchCards();
  }, []);

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
            {cards?.map((c: Card) => {
              return c && !c.isEntourage ? (
                <div
                  key={c.uuid}
                  className='grid-item'
                  onClickCapture={inspectCard(c)}
                >
                  <CardComponent {...c} canPlay={true} />
                </div>
              ) : null;
            })}
          </div>
        </Container>

        <div
          className={[
            'collection__modal',
            cardModal ? 'collection__modal--active' : '',
          ].join(' ')}
          onClick={() => setCardModal(undefined)}
        >
          <div className='modal__inner'>
            {cardModal && <CardComponent {...cardModal} canPlay={true} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
