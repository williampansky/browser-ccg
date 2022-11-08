import { Container, Layout } from '../../components/site-components';
import { siteConfig } from '../../config.app';

export default function TheChangelogPage() {
  const page = siteConfig.pages.changelog;
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
