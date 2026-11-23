import type { AppConfig, GameConfig, Pages, SiteConfig } from './types';

export const gameConfig: GameConfig = {
  cardCounts: {
    core: 137,
    prime: 259,
    entourage: 57,
    game: 1,
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
  },
};

export const sitePages: Pages = {
  home: {
    description: "The site's homepage.",
    name: 'Home',
    route: '/',
    showInFooter: true,
    showInNav: true,
  },
  apiList: {
    description: 'A frontend page listing items under the /api directory.',
    name: 'API List',
    route: '/api-list',
    showInFooter: false,
    showInNav: false,
  },
  changelog: {
    description: 'A page listing all changes to the game and site.',
    name: 'Changelog',
    route: '/changelog',
    showInFooter: false,
    showInNav: true,
  },
  profile: {
    description: 'Your account profile and settings',
    name: 'Profile',
    route: '/profile',
    showInFooter: true,
    showInNav: true,
  },
  cards: {
    description: 'All cards in the game',
    name: 'Cards',
    route: '/cards',
    headline: 'All Cards',
    title: 'All Cards',
    showInFooter: false,
    showInNav: false,
  },
  collection: {
    description: 'Your personal card collection',
    name: 'Cards',
    route: '/collection',
    headline: 'Your Collection',
    title: 'Collection',
    showInFooter: true,
    showInNav: true,
  },
  heroes: {
    description: 'Heroes and their skills',
    name: 'Heroes',
    route: '/heroes',
    headline: 'Heroes',
    title: 'Heroes',
    showInFooter: true,
    showInNav: true,
  },
  deckbuilder: {
    description: 'A page for building decks from your collection',
    name: 'Deck Builder',
    route: '/deckbuilder',
    headline: 'Deck Builder',
    title: 'Deck Builder',
    showInFooter: false,
    showInNav: true,
  },
  faq: {
    description: 'A page for frequently asked questions',
    name: 'FAQ',
    route: '/faq',
    showInFooter: false,
    showInNav: true,
  },
  news: {
    description: 'Recent news and announcements about the game',
    name: 'News',
    route: '/news',
    showInFooter: true,
    showInNav: true,
  },
  play: {
    description: 'A page for playing the game',
    name: 'Play',
    route: '/play',
    showInFooter: true,
    showInNav: true,
  },
  store: {
    description: 'A page for purchasing content for the game',
    name: 'Store',
    route: '/store',
    showInFooter: true,
    showInNav: true,
  },
};

/**
 * Left-to-right order of the bottom nav; a page flagged `showInFooter`
 * but not listed here goes at the end.
 */
const FOOTER_ORDER = [
  'home',
  'collection',
  'heroes',
  'play',
  'store',
  'news',
  'profile',
];

/**
 * The bottom nav: every page with `showInFooter`, in `FOOTER_ORDER`.
 */
export const footerButtons: Pages = Object.fromEntries(
  Object.entries(sitePages)
    .filter(([, page]) => page.showInFooter)
    .sort(([a], [b]) => {
      const rank = (k: string) => {
        return FOOTER_ORDER.includes(k)
          ? FOOTER_ORDER.indexOf(k)
          : FOOTER_ORDER.length;
      };

      return rank(a) - rank(b);
    })
    .map(([key, page]) => [
      key,
      { name: page.name, route: page.route, description: page.description },
    ]),
);

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
