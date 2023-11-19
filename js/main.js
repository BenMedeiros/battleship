'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";

import {getGlobalLobby} from "../server/server/Lobby.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));


const lobby = getGlobalLobby();
const player1 = lobby.newPlayer('tom');
const player2 = lobby.newPlayer('ben');

console.log(lobby);

