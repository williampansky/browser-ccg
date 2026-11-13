import { Layout } from '../../components/site-components';
import { Collection } from '../../components/collection/Collection';
import { siteConfig } from '../../app.config';

export default function TheCollectionPage() {
  const page = siteConfig.pages.collection;
  return (
    <Layout title={page.title} description={page.description}>
      <Collection />
    </Layout>
  );
}
