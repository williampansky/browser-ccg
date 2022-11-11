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
  /**
   * Enable or disable specific game mechanics
   */
  mechanics: {
    /**
     * Enable or disable ALL game mechanics
     */
    _enabled: boolean;
    ACTION_POINTS: boolean;
    ADD_CARD: boolean;
    AREA_OF_EFFECT: boolean;
    ARMOR: boolean;
    BOOLEAN: boolean;
    BOON: boolean;
    BUFF: boolean;
    CHOOSE_ONE: boolean;
    COMBO: boolean;
    CURSE: boolean;
    DEBUFF: boolean;
    DESTROY_ON_NEXT_TURN: boolean;
    DESTROY: boolean;
    DISCARD_CARD: boolean;
    DISCOVER: boolean;
    DRAW_CARD: boolean;
    DURABILITY: boolean;
    EVENT: boolean;
    GLOBAL_SPELL: boolean;
    HIDDEN: boolean;
    MYSTERY: boolean;
    ON_DEATH: boolean;
    ON_PLAY: boolean;
    ON_TURN_END: boolean;
    ON_TURN_START: boolean;
    OVERLOAD: boolean;
    RANDOM: boolean;
    RESET_VALUE: boolean;
    RESURRECT_MINION: boolean;
    RETURN: boolean;
    SET_COST: boolean;
    SET_VALUE: boolean;
    SILENCE_MECHANICS: boolean;
    SPELL_DAMAGE: boolean;
    SUMMON_MINION: boolean;
    TARGET: boolean;
    TRANSFER_OWNERSHIP: boolean;
    TRANSFORM: boolean;
  }
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
export type Version = string;

export interface SiteConfig {
  shortName: string;
  longName: string;
  pages: Pages;
  footerButtons: Pages;
  version: Version;
}

export interface AppConfig {
  gameConfig: GameConfig;
  siteConfig: SiteConfig;
}
