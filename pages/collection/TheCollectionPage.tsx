import { Layout } from '../../components/site-components';
import { Collection } from '../../components/collection/Collection';
import { siteConfig } from '../../app.config';

export default function TheCollectionPage({ missingArt }: { missingArt: string[] }) {
  const page = siteConfig.pages.collection;
  return (
    <Layout title={page.title} description={page.description}>
      <Collection missingArt={missingArt} />
    </Layout>
  );
}

/** Dev tooling: the ids whose `-CARD` art file is not on disk (read at build/request time; only shown in development). */
export const getStaticProps = async () => {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const { loadHsCards } = await import('../../engine');
  const { artUrl } = await import('../../components/play-board/card-face-model');
  const missingArt = loadHsCards()
    .cards.filter((c) => {
      const url = artUrl(c.id);
      return !url || !existsSync(join(process.cwd(), 'public', url));
    })
    .map((c) => c.id);
  return { props: { missingArt } };
};
