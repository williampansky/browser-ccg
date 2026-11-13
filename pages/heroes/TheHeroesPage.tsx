import { Layout } from '../../components/site-components';
import { Heroes } from '../../components/heroes/Heroes';
import { siteConfig } from '../../app.config';

export default function TheHeroesPage() {
  const page = siteConfig.pages.heroes;
  return (
    <Layout title={page.title} description={page.description}>
      <Heroes />
    </Layout>
  );
}
