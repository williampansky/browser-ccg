import { Container, Layout } from '../../components/site-components';
import { siteConfig } from '../../config.app';

export default function TheStorePage() {
  const page = siteConfig.pages.store;
  return (
    <Layout title={page.name} description={page.description}>
      <div className={`${page.name.toLocaleLowerCase()}__page`}>
        <Container>
          <h1>{page.name}</h1>
        </Container>
      </div>
    </Layout>
  );
}
