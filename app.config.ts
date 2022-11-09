import { AppConfig, GameConfig, Pages, SiteConfig } from './types';

export const gameConfig: GameConfig = {
  debugConfig: {
    debugCardId: '',
    logPhaseToConsole: false,
    showDebugBar: false,
  },
  numerics: {
    actionPointsPerTurn: 1,
    actionPointsTotal: 10,
    cardsPerDeck: 20,
    cardsPerHand: 8,
    cardsPerStartingHand: 3,
    cardsPerTurn: 1,
    numberOfPlayers: 2,
    numberOfSingleTurnsPerGame: 12,
    numberOfSlotsPerZone: 6,
    numberOfZones: 3,
  },
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
  collection: {
    description: '',
    name: 'Cards',
    route: '/collection',
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
  version: '0.0.1'
};

const appConfig: AppConfig = {
  gameConfig: { ...gameConfig },
  siteConfig: { ...siteConfig },
};

export default appConfig;
