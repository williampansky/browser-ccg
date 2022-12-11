import type { AppConfig, GameConfig, Pages, SiteConfig } from './types';

const core = `SET_CORE_`;

export const gameConfig: GameConfig = {
  asynchronousTurns: false,
  debugConfig: {
    debugHandCardKey: core + '040',
    debugBoardCardKey: core + '001',
    debugBoardCardKeyAmount: 3,
    useDebugHandCardKey: true,
    useDebugBoardCardKey: true,

    debugOpponentHandCardKey: core + '126',
    debugOpponentBoardCardKey: core + '003',
    debugOpponentBoardCardKeyAmount: 4,
    useDebugOpponentHandCardKey: false,
    useDebugOpponentBoardCardKey: false,

    debugScenario: 'opponent-minions-have-buff',
    useDebugScenario: true,

    logPhaseToConsole: true,
    showDebugBar: true,
    showBoardgameIoSidebar: false,
  },
  ai: {
    botToUse: 'MCTSBot',
    enableBotAi: true,
    enableBotAiMoves: false,
    logBotAiMovesToConsole: true,
  },
  numerics: {
    actionPointsPerTurn: 1,
    actionPointsTotal: 10,
    cardsPerDeck: 30,
    cardsPerHand: 10,
    cardsPerStartingHand: 3,
    cardsPerTurn: 1,
    maxNumberOfDecks: 10,
    numberOfPlayers: 2,
    numberOfSingleTurnsPerGame: 20,
    numberOfSlotsPerZone: 6,
    numberOfZones: 3,
  },
  mechanics: {
    _enabled: true,
    ACTION_POINTS: true,
    ADD_CARD: true,
    AREA_OF_EFFECT: false,
    ARMOR: false,
    BOOLEAN: true,
    BOON: false,
    BUFF: true,
    CHOOSE_ONE: false,
    COMBO: false,
    CURSE: false,
    DEBUFF: true,
    DESTROY_ON_NEXT_TURN: false,
    DESTROY: true,
    DISCARD_CARD: false,
    DISCOVER: false,
    DRAW_CARD: true,
    DURABILITY: false,
    EVENT: false,
    GLOBAL_SPELL: false,
    HIDDEN: false,
    MYSTERY: false,
    ON_DEATH: false,
    ON_PLAY: true,
    ON_TURN_END: false,
    ON_TURN_START: false,
    OVERLOAD: false,
    RANDOM: true,
    RESET_VALUE: false,
    RESURRECT_MINION: false,
    RETURN: false,
    SET_COST: true,
    SET_VALUE: true,
    SILENCE_MECHANICS: false,
    SPELL_DAMAGE: false,
    SUMMON_MINION: true,
    TARGET: false,
    TRANSFER_OWNERSHIP: false,
    TRANSFORM: false,
  },
  zonesConfig: {
    effectAdjustments: false,
    zoneImages: true,
    zoneNames: true,
    zoneReveals: true,
  }
};

export const sitePages: Pages = {
  home: {
    description: "The site's homepage.",
    name: 'Home',
    route: '/',
    showInNav: true
  },
  apiList: {
    description: 'A frontend page listing items under the /api directory.',
    name: 'API List',
    route: '/api-list',
  },
  changelog: {
    description: '',
    name: 'Changelog',
    route: '/changelog',
    showInNav: true
  },
  profile: {
    description: '',
    name: 'Profile',
    route: '/profile',
    showInNav: true
  },
  cards: {
    description: 'All cards in the game',
    name: 'Cards',
    route: '/cards',
    headline: 'All Cards',
    title: 'All Cards',
  },
  collection: {
    description: '',
    name: 'Cards',
    route: '/collection',
    headline: 'Your Collection',
    title: 'Collection',
  },
  deckbuilder: {
    description: '',
    name: 'Deck Builder',
    route: '/deckbuilder',
    headline: 'Deck Builder',
    title: 'Deck Builder',
  },
  faq: {
    description: '',
    name: 'FAQ',
    route: '/faq',
    showInNav: true
  },
  news: {
    description: '',
    name: 'News',
    route: '/news',
    showInNav: true
  },
  play: {
    description: '',
    name: 'Play',
    route: '/play',
  },
  store: {
    description: '',
    name: 'Store',
    route: '/store',
  },
  zones: {
    description: 'Zones database and information.',
    name: 'Zones',
    route: '/zones',
    showInNav: true
  },
};

export const footerButtons: Pages = {
  store: {
    icon: 'icon-uikit-refresh',
    name: sitePages.store.name,
    route: sitePages.store.route,
  },
  collection: {
    icon: 'icon-uikit-thumbnails',
    name: sitePages.collection.name,
    route: sitePages.collection.route,
  },
  play: {
    icon: 'icon-uikit-play-circle',
    name: sitePages.play.name,
    route: sitePages.play.route,
  },
  news: {
    icon: 'icon-uikit-rss',
    name: sitePages.news.name,
    route: sitePages.news.route,
  },
  profile: {
    icon: 'icon-uikit-user',
    name: sitePages.profile.name,
    route: sitePages.profile.route,
  },
};

export const siteConfig: SiteConfig = {
  shortName: 'BCG',
  longName: 'Browser-CCG',
  pages: sitePages,
  footerButtons: footerButtons,
  version: '0.0.1',
  disableRightClick: true,
};

const appConfig: AppConfig = {
  gameConfig: { ...gameConfig },
  siteConfig: { ...siteConfig },
};

export default appConfig;
