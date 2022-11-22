import { useEffect, useState } from 'react';
import { Container, Layout } from '../../components/site-components';
import { Card as CardComponent } from '../../components/game-components';
import { siteConfig } from '../../app.config';
import { CardDetailModal } from '../../components/site-components/Modals';
import type { Card } from '../../types';

export default function TheCardsPage() {
  const page = siteConfig.pages.cards;
  const [cards, setCards] = useState<Card[]>([]);
  const [cardModal, setCardModal] = useState<Card | undefined>(undefined);

  const fetchCards = async () => {
    const response = await fetch('/api/cards');
    const data = await response.json();
    setCards(data.sort().reverse());
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
          <div className='page__header'>
            <h1>{page.headline}</h1>
          </div>
          <div className='grid'>
            {cards?.map((c: Card) => {
              return c ? (
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

        <CardDetailModal
          data={cardModal}
          onModalDismiss={() => setCardModal(undefined)}
        />
      </div>
    </Layout>
  );
}
