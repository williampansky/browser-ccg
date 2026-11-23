export interface ArtistSuggestions {
  /** Every artist name already in the data, sorted ignoring case. */
  names: string[];
  /** Every artist URL already in the data, sorted ignoring case. */
  urls: string[];
  /**
   * The URLs seen with each name, most used first, so picking a name can fill
   * in the URL.
   */
  urlsByName: Record<string, string[]>;
}

const sortText = (list: Set<string>) =>
  Array.from(list).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

/**
 * The artist names and URLs already used by cards or heroes (any records with
 * `artistName` / `artistUrl`). Pure, so it is unit tested.
 */
export const collectArtists = (
  records: { artistName?: unknown; artistUrl?: unknown }[],
): ArtistSuggestions => {
  const names = new Set<string>();
  const urls = new Set<string>();
  const counts: Record<string, Map<string, number>> = {};
  for (const r of records) {
    const name = typeof r.artistName === 'string' ? r.artistName.trim() : '';
    const url = typeof r.artistUrl === 'string' ? r.artistUrl.trim() : '';
    if (name) names.add(name);
    if (url) urls.add(url);
    if (name && url) {
      const m = (counts[name] ??= new Map());
      m.set(url, (m.get(url) ?? 0) + 1);
    }
  }
  const urlsByName: Record<string, string[]> = {};
  for (const [name, m] of Object.entries(counts))
    urlsByName[name] = Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([u]) => u);
  return { names: sortText(names), urls: sortText(urls), urlsByName };
};
