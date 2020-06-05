import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Server } from 'boardgame.io/server';
import ReactCCG from './game';

const server = Server({ games: [ReactCCG] });
const PORT = process.env.PORT || 8000;

server.run(PORT);
