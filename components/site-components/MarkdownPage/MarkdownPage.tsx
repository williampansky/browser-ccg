import { Layout } from '../Layout';

type Props = {
  title: string;
  description?: string;
  html: string;
};

/** A page whose body is rendered markdown (`renderMarkdown` in `getStaticProps`). */
export const MarkdownPage = ({ title, description, html }: Props) => (
  <Layout title={title} description={description}>
    <div className='markdown__page'>
      <article className='markdown__body' dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </Layout>
);
