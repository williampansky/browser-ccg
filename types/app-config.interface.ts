export interface GameConfig {
  debugConfig: {
    debugCardId: string;
    logPhaseToConsole: boolean;
    showDebugBar: boolean;
  };
  numerics: {
    actionPointsPerTurn: number;
    actionPointsTotal: number;
    cardsPerDeck: number;
    cardsPerHand: number;
    cardsPerStartingHand: number;
    cardsPerTurn: number;
    numberOfPlayers: number;
    numberOfSingleTurnsPerGame: number;
    numberOfSlotsPerZone: number;
    numberOfZones: number;
  };
}

export interface Page {
  /**
   * A short description of the page; used in the `meta` description.
   */
  description?: string;

  /**
   * Optional headline text; renders as the page's `h1` element.
   */
  headline?: string;

  /**
   * Name of the page; e.g. `'News'` or `'Store'`
   */
  name: string;

  /**
   * The routing path of the page; e.g. `/collection`
   */
  route: string;

  /**
   * Optional title text; renders as the page's `meta` title.
   */
  title?: string;

  /**
   * Optional icon name; renders if the link is used in the site's footer.
   */
  icon?: string;

  /**
   * Boolean to indicate if the item should render in the site nav.
   */
  showInNav?: boolean;
}

export type PageId = string;
export type Pages = Record<PageId, Page>;

export interface SiteConfig {
  shortName: string;
  longName: string;
  pages: Pages;
  footerButtons: Pages;
}

export interface AppConfig {
  gameConfig: GameConfig;
  siteConfig: SiteConfig;
}
