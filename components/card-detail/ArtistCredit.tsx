import styles from '../deck-builder/deck-builder.module.scss';

/**
 * The artist credit, if any, for a card. Shown in the enlarged-card overlay.
 */
export const ArtistCredit = ({
  artistName,
  artistUrl
}: {
  artistName: string;
  artistUrl?: string;
}) => {
  return (
    <div className={styles.artistCredit}>
      <p>
        Art by{' '}
        {artistUrl ? (
          <a
            href={artistUrl}
            onClick={e => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
            title="Click to open the artist's page in a new tab"
          >
            {artistName}
          </a>
        ) : (
          artistName
        )}
      </p>
    </div>
  );
};
