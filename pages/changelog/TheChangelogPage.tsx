import { MarkdownPage } from '../../components/site-components';
import { siteConfig } from '../../app.config';
import { renderMarkdown } from '../../utils/render-markdown';

const page = siteConfig.pages.changelog;

export async function getStaticProps() {
  return { props: { html: renderMarkdown('CHANGELOG.md') } };
}

export default function TheChangelogPage({ html }: { html: string }) {
  return <MarkdownPage title={page.name} description={page.description} html={html} />;
}
