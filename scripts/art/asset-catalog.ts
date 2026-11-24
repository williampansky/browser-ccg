/**
 * Search `art-assets-catalog.json`: what each purchased icon in `art-assets/`
 * shows, so a card can be matched to art by its meaning ("poison", "heal")
 * instead of by looking through a thousand numbered files.
 */

export interface CatalogPack {
  id: string;
  /** A file name is `prefix` + the icon's key + `suffix`. */
  prefix: string;
  suffix: string;
  icons: Record<string, string>;
}

export interface AssetMatch {
  file: string;
  pack: string;
  tags: string;
}

/** The file an icon key stands for, e.g. `elemental-magic-icons-9985.png`. */
export const iconFile = (pack: CatalogPack, key: string): string => {
  return `${pack.prefix}${key}${pack.suffix}`;
};

/**
 * Every icon whose tags (or pack id) contain all the search words, in any
 * case. A word with no match anywhere returns nothing.
 */
export const findAssets = (
  packs: readonly CatalogPack[],
  words: readonly string[],
): AssetMatch[] => {
  const needles = words.map((word) => word.toLowerCase()).filter(Boolean);
  const matches: AssetMatch[] = [];

  for (const pack of packs) {
    for (const [key, tags] of Object.entries(pack.icons)) {
      const haystack = `${pack.id} ${tags}`.toLowerCase();

      if (needles.every((needle) => haystack.includes(needle))) {
        matches.push({ file: iconFile(pack, key), pack: pack.id, tags });
      }
    }
  }

  return matches;
};
