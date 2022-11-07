import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card as CardComponent } from '../../components/game-components/Card/Card';
import { Layout } from '../../components/site-components';
import tempCardsDatabase from '../../tempCardsDatabase';
import { tempUsers } from '../../tempUsers';
import { Account, Card, CardBase } from '../../types';
import { createCardObject } from '../../utils';
import styles from './the-collection-page.module.scss';

export default function TheCollectionPage() {
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
    <Layout title='Collection'>
      <h1>Collection</h1>
      <div className={styles['page']}>
        <div className={styles['grid']}>
          {cards.map((c: Card) => {
            return c ? (
              <div key={c.uuid} className={styles['grid-item']}>
                <CardComponent {...c} canPlay={true} />
              </div>
            ) : null;
          })}
        </div>
      </div>
    </Layout>
  );
}

// export const getStaticProps: GetStaticProps = async () => {
//   // Example for including static props in a Next.js function component page.
//   // Don't forget to include the respective types for any props passed into
//   // the component.
//   const items: Account[] = tempUsers;
//   return { props: { items } };
// };

// export default WithStaticProps;
