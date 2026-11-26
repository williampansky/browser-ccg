import type { FunctionComponent } from 'react';

/**
 * A link to the donation page (Ko-fi or similar). The address comes from
 * `NEXT_PUBLIC_SUPPORT_URL` when the site is built, so it is set in Render and
 * nothing is hard-coded; with none set the link is simply not shown.
 */
export const SupportLink: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const url = process.env.NEXT_PUBLIC_SUPPORT_URL;
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
