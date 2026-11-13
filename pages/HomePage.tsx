import { MarkdownPage } from '../components/site-components';
import { siteConfig } from '../app.config';
import { renderMarkdown } from '../utils/render-markdown';

const {
  pages: { home },
} = siteConfig;

export async function getStaticProps() {
  return { props: { html: renderMarkdown('README.md') } };
}

export default function HomePage({ html }: { html: string }) {
  return <MarkdownPage title={home.name} description={home.description} html={html} />;
}
