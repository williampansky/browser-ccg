import { useEffect, useState } from 'react';
import { Container, Layout } from '../../components/site-components';
import { Card as CardComponent } from '../../components/game-components';
import { createCardObject } from '../../utils';
import type { Card, CardBase } from '../../types';
import { siteConfig } from '../../config.app';
import tempCardsDatabase from '../../tempCardsDatabase';

export default function TheCollectionPage() {
  const page = siteConfig.pages.changelog;
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    setCards(
      tempCardsDatabase.map((c: CardBase) => {
        const obj = createCardObject(c);
        return obj;
      })
    );
  }, [tempCardsDatabase]);

  return (
    <Layout title={page.name} description={page.description}>
      <div className={`${page.name.toLocaleLowerCase()}__page`}>
        <Container>
          <h1>{page.name}</h1>
          <div className='grid'>
            {cards.map((c: Card) => {
              return c ? (
                <div key={c.uuid} className='grid-item'>
                  <CardComponent {...c} canPlay={true} />
                </div>
              ) : null;
            })}
          </div>
        </Container>
      </div>
    </Layout>
  );
}
