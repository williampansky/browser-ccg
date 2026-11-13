// marked 4 ships no types; this covers the little `utils/render-markdown.ts` uses.
declare module 'marked' {
  class Renderer {
    link(href: string | null, title: string | null, text: string): string;
  }
  interface Options {
    renderer?: Renderer;
    mangle?: boolean;
    headerIds?: boolean;
  }
  export const marked: {
    Renderer: typeof Renderer;
    parse(source: string, options?: Options): string;
  };
}
