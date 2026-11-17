export type AttributionRule = { match: string | string[]; artist: string; url?: string };

const matches = (pattern: string, file: string) => {
  try {
    return new RegExp(pattern, 'i').test(file);
  } catch {
    return false;
  }
};

/** The first rule with any regex matching the path (case-insensitive); a bad regex never matches. */
export const findAttribution = (
  file: string,
  rules: AttributionRule[]
): AttributionRule | undefined =>
  rules.find(r => [r.match].flat().some(p => matches(p, file)));
