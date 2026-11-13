import { MarkdownPage } from '../../components/site-components';
import { siteConfig } from '../../app.config';
import { renderMarkdown } from '../../utils/render-markdown';

const page = siteConfig.pages.news;

export async function getStaticProps() {
  return { props: { html: renderMarkdown('ROADMAP.md') } };
}

export default function TheNewsPage({ html }: { html: string }) {
  return <MarkdownPage title={page.name} description={page.description} html={html} />;
}
