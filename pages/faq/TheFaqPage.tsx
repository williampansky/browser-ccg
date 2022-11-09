import { Container, Layout } from '../../components/site-components';
import { siteConfig } from '../../app.config';

export default function TheFaqPage() {
  const page = siteConfig.pages.faq;
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
