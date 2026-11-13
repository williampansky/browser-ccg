import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const REPO = 'https://github.com/williampansky/browser-ccg/blob/hs-rebuild/';

/**
 * Reads a markdown file from the repo root and returns HTML. Server only (use it in `getStaticProps`).
 * The files are our own, so the output is trusted. Relative links to other repo files, which only
 * work on GitHub, are pointed there.
 */
export const renderMarkdown = (file: string): string => {
  const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  const renderer = new marked.Renderer();
  const link = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    const local = href && !/^([a-z]+:|#|\/)/i.test(href);
    return link(local ? REPO + href : href, title, text);
  };
  return marked.parse(source, { renderer, mangle: false, headerIds: true });
};
