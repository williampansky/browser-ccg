import type { FunctionComponent } from 'react';

/**
 * The game's version (from package.json, put in the build by next.config.js)
 * with its alpha tag, so a bug report can say which build it came from.
 */
export const VersionLabel: FunctionComponent = () => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  if (!version) return null;

  return <span title="Game version">v{version} alpha</span>;
};
