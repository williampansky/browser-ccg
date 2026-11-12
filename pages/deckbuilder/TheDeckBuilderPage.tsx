import dynamic from 'next/dynamic';
import { Layout } from '../../components/site-components';
import { siteConfig } from '../../app.config';

// Saved decks live in localStorage, so the builder renders on the client only.
const DeckBuilder = dynamic(() => import('../../components/deck-builder/DeckBuilder').then((m) => m.DeckBuilder), {
  ssr: false,
});

export default function TheDeckBuilderPage() {
  const page = siteConfig.pages.deckbuilder;
  return (
    <Layout title={page.title} description={page.description}>
      <DeckBuilder />
    </Layout>
  );
}
