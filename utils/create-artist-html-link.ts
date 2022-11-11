const createArtistHtmlLink = (
  name?: string,
  url?: string
): string | undefined => {
  if (!name || !url) return undefined;
  if (!name && url) return url;
  if (name && !url) return name;

  const html = `<a href="${url}" rel="noopener noreferrer" target="_blank">${name}</a>`;
  return html;
};

export default createArtistHtmlLink;
