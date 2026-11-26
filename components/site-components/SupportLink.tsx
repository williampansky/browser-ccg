import type { FunctionComponent } from 'react';

/** The Ko-fi page. */
const SUPPORT_URL = 'https://ko-fi.com/williampansky';

/**
 * A link to the donation page. `NEXT_PUBLIC_SUPPORT_URL` (read when the site
 * is built) overrides the address; an empty value hides the link.
 */
export const SupportLink: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const url = process.env.NEXT_PUBLIC_SUPPORT_URL ?? SUPPORT_URL;
  if (!url) return null;

  return (
    <a
      className={className}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      Support the game
    </a>
  );
};
